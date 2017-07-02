require('dotenv').config();
// const Epub = require("epub-gen");
const Streampub = require('streampub')
const fs = require('fs')
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

            if (removeString) 
                removeString.split('\n').map((str) => {
                    chapterTitle = chapterTitle.replace(str, '');
                    chapterData = chapterData.replace(str, '');
                })
            content.push({title: chapterTitle, data: chapterData});
        });

        const epubFileName = `${title}-${md5(new Date())}.epub`;
        const epubFileLocation = __dirname + `/${epubFileName}`;

        // epub building
        const epub = new Streampub({title})
        epub.setAuthor(author)
        const fsStream = epub.pipe(fs.createWriteStream(epubFileLocation))
        const chapterLength = content.length;
        content.map((cont, index) => {
            epub.write(Streampub.newChapter(cont.title, `<h3>${cont.title}</h3><br/>${cont.data}`));
            console.log(`written chapter ${index+1}/${chapterLength}`);
        })
        epub.end();
        fsStream.on('finish', function () {
            console.log("Ebook Generated Successfully!")
            console.timeEnd("Time taken to generate epub: ");
            resolve({epubFileLocation});
        });
    });
}