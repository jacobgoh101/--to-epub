require('dotenv').config();
const Epub = require("epub-gen");
const sanitizeHtml = require('sanitize-html');
const cheerio = require('cheerio');
const md5 = require('md5');

export const generateEpub = (obj) => {
    return new Promise((resolve, reject) => {
        const defaultObjParam = {
            title: "斗罗大陆",
            author: "唐家三少",
            publisher: "Jacob Goh",
            cover: "http://i.imgur.com/Qkn9FME.jpg",
            chapterTitleSelector: 'title',
            chapterDataSelector: '#main .book p'
        };
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
            chapterDataSelector
        } = obj;
        let {articleHTML} = obj;
        let content = [];
        let removeString = [' - 斗罗大陆 - 唐家三少 - 无弹窗小说网', '无弹窗小说网'];

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

            removeString.map((str) => {
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
                reject(err);
            });
    });
}