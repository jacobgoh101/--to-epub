require('dotenv').config();
const Epub = require("epub-gen");
const sanitizeHtml = require('sanitize-html');
const cheerio = require('cheerio');
const md5 = require('md5');
const cleanDeep = require('clean-deep');

export const generateEpub = (obj) => {
    return new Promise((resolve, reject) => {
        const defaultObjParam = {
            publisher: "Jacob Goh",
            cover: "http://i.imgur.com/HmiTKBb.jpg",
            chapterTitleSelector: 'title'
        };
        obj = cleanDeep(obj);
        obj = {
            ...defaultObjParam,
            ...obj
        };
        const {
            title,
            author,
            publisher,
            cover,
            chapterTitleSelector,
            chapterDataSelector,
            removeString
        } = obj;
        let {articleHTML} = obj;
        let content = [];

        let tempArticleHTML = [];
        for (let i = 0; i < Object.keys(articleHTML).length; i++) {
            tempArticleHTML[i] = articleHTML[i];
        }
        articleHTML = [...tempArticleHTML];

        articleHTML.map(html => {
            const $ = cheerio.load(html);
            let chapterTitle = $(chapterTitleSelector).text();
            let chapterData = $(chapterDataSelector).html();
            chapterData = sanitizeHtml(chapterData);

            removeString
                .split('\n')
                .map((str) => {
                    chapterTitle = chapterTitle.replace(str, '');
                    chapterData = chapterData.replace(str, '');
                })
            content.push({title: chapterTitle, data: chapterData});
        })

        let option = {
            title, // *Required, title of the book.
            author, // *Required, name of the author.
            publisher, // optional
            cover, // Url or File path, both ok.
            content,
            css: ""
        };
        const epubFileName = `${title}-${md5(new Date())}.epub`;
        const epubFileLocation = __dirname + `/${epubFileName}`;
        new Epub(option, epubFileLocation)
            .promise
            .then(function () {
                console.log("Ebook Generated Successfully!")
                console.timeEnd("Time taken to generate epub: ");
                resolve({epubFileLocation});
            }, function (err) {
                console.error("Failed to generate Ebook because of ", err);
                reject("Failed to generate Ebook because of ", err);
            });
    });
}