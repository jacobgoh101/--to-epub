"use strict"
require('dotenv').config();
const express = require('express');
const app = express();
const {parseContentPage} = require('./lib/parseContentPage');
const {generateEpub} = require('./lib/generateEpub');
const {uploadToUguuSE} = require('./lib/uploadToUguuSE');
const {sendDownloadLink} = require('./lib/sendDownloadLink');

const contentPage = "http://www.hkxs99.net/01/douluodalu/";
const chapterLinkSelector = "#main .book a";

parseContentPage({contentPage, chapterLinkSelector})
    .then(result => result.articleHTML)
    .then(articleHTML => generateEpub({articleHTML}))
    .then(result => result.epubFileLocation)
    .then(epubFileLocation => uploadToUguuSE({epubFileLocation}))
    .then(result => result.downloadLink)
    .then(downloadLink => sendDownloadLink({downloadLink}))
    .then(result => console.log(result))
    .catch(err => {
        throw err;
    });

app.listen(process.env.PORT || 3000);