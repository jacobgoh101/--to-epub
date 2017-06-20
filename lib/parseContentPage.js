"use strict"
require('dotenv').config();
const normalizeUrl = require('normalize-url');
const request = require('requestretry');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

export const parseContentPage = ({contentPage,chapterLinkSelector}) => {
    return new Promise((resolve, reject) => {
        console.log('parseContentPage started');
        console.time("Time taken to generate epub: ");

        contentPage = normalizeUrl(contentPage, {stripWWW: false});
        let chapterLength = 0;
        let articleHTML = {};
        // crawl
        request({
            url: contentPage,
            encoding: null,
            maxAttempts: 50,
            retryDelay: 500
        }, function (error, response, html) {
            if (error) 
                reject(error);
            if (!error && response.statusCode == 200) {
                const decodedHtml = iconv.decode(new Buffer(html), "GB2312");
                const $ = cheerio.load(decodedHtml);

                chapterLength = $(chapterLinkSelector).length;

                $(chapterLinkSelector).each((index, element) => {
                    const href = $(element).attr('href');
                    const url = contentPage + '/' + href;
                    request({
                        url,
                        encoding: null,
                        maxAttempts: 50,
                        retryDelay: 500
                    }, function (error, response, html) {
                        if (error) 
                            reject(error);
                        if (!error && response.statusCode == 200) {
                            const decodedHtml = iconv.decode(new Buffer(html), "GB2312");
                            articleHTML[index] = decodedHtml;
                            if (Object.keys(articleHTML).length === chapterLength) {
                                console.log(`before generateEpub. chapterLength:${chapterLength}`);
                                resolve({articleHTML});
                            }
                        }
                    });
                });
            }
        });
    });
}