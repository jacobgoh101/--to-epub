"use strict"
require('dotenv').config();
const normalizeUrl = require('normalize-url');
const request = require('requestretry');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const urlParse = require('url-parse');
const charset = require('charset');

export const parseContentPage = ({contentPage, chapterLinkSelector}) => {
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
            timeout: 60000,
            maxAttempts: 6000,
            retryDelay: 1000
        }, function (error, response, html) {
            if (error) 
                reject(error);
            if (!error && response.statusCode == 200) {
                let encoding = charset(response.headers['content-type']);
                if (!encoding) {
                    encoding = "GB2312";
                }
                const decodedHtml = iconv.decode(new Buffer(html), encoding);
                const $ = cheerio.load(decodedHtml);

                chapterLength = $(chapterLinkSelector).length;
                console.log(`chapterLength: ${chapterLength}`);

                let hasErr = false;
                $(chapterLinkSelector).each((index, element) => {
                    if (hasErr) 
                        return;
                    const href = $(element).attr('href');
                    let url = '';
                    if (href.charAt(0) === '/') {
                        const parsed = new urlParse(contentPage);
                        url = parsed.protocol + (parsed.slashes
                            ? '//'
                            : '') + parsed.hostname + href;
                    } else {
                        url = contentPage + '/' + href;
                    }
                    request({
                        url,
                        encoding: null,
                        timeout: 60000,
                        maxAttempts: 6000,
                        retryDelay: 1000
                    }, function (error, response, html) {
                        if (hasErr) 
                            return;
                        if (error) {
                            reject(JSON.stringify({
                                url,
                                ...error
                            }));
                            hasErr = true;
                        }
                        if (!error && response.statusCode == 200) {
                            let encoding = charset(response.headers['content-type']);
                            if (!encoding) {
                                encoding = "GB2312";
                            }
                            const decodedHtml = iconv.decode(new Buffer(html), encoding);
                            articleHTML[index] = decodedHtml;
                            // console.log(`parsed article count: ${Object.keys(articleHTML).length}/${chapterLength}`)
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