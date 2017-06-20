const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: true}));
const {parseContentPage} = require('../lib/parseContentPage');
const {generateEpub} = require('../lib/generateEpub');
const {uploadToUguuSE} = require('../lib/uploadToUguuSE');
const {sendDownloadLink} = require('../lib/sendDownloadLink');

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
            throw err;
        });
    res.json(req.body);
})

module.exports = router