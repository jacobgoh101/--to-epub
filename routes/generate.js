const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: true}));
const {parseContentPage} = require('../lib/parseContentPage');
const {generateEpub} = require('../lib/generateEpub');
const {uploadToUguuSE} = require('../lib/uploadToUguuSE');
const {sendDownloadLink} = require('../lib/sendDownloadLink');
const {sendErrorReport} = require('../lib/sendErrorReport');
const JsonResponse = require('jsonresponse');

router.post('/generate', (req, res) => {
    const {
        contentPage,
        chapterLinkSelector,
        title,
        author,
        publisher,
        cover,
        chapterTitleSelector,
        chapterDataSelector,
        removeString,
        receiverEmail
    } = req.body;

    parseContentPage({contentPage, chapterLinkSelector})
        .then(result => result.articleHTML)
        .then(articleHTML => generateEpub({
            articleHTML,
            title,
            author,
            publisher,
            cover,
            chapterTitleSelector,
            chapterDataSelector,
            removeString
        }))
        .then(result => result.epubFileLocation)
        .then(epubFileLocation => uploadToUguuSE({epubFileLocation}))
        .then(result => result.downloadLink)
        .then(downloadLink => sendDownloadLink({downloadLink, title, receiverEmail}))
        .then(result => console.log(result))
        .catch(err => {
            sendErrorReport({errorMessage: err, reqData: req.body});
            console.error(err);
        });
    res.json(new JsonResponse(null, {
        message: "Epub parsing process has begun. You shall receive a link to download the generat" +
                "ed EPUB once the process is completed.",
        reqBody: req.body
    }));
})

module.exports = router