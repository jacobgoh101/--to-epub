"use strict"
require('dotenv').config();
const normalizeUrl = require('normalize-url');
const request = require('requestretry');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const urlParse = require('url-parse');
const charset = require('charset');
const urlResolve = require('url').resolve;

export const parseContentPage = ({contentPage, chapterLinkSelector, encoding, ignoredUrlString}) => {
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
                if (!encoding) {
                    encoding = charset(response.headers['content-type']);
                    if (!encoding) {
                        encoding = "GB2312";
                    }
                }
                const decodedHtml = iconv.decode(new Buffer(html), encoding);
                const $ = cheerio.load(decodedHtml);

                let chapterUrls = [];
                $(chapterLinkSelector).each((index, element) => {
                    const href = $(element).attr('href');
                    let url = urlResolve(contentPage, href);

                    let shouldIgnoreUrl = false;
                    if (ignoredUrlString) 
                        ignoredUrlString.split('\n').map((str) => {
                            if (shouldIgnoreUrl) 
                                return;
                            if (url.indexOf(str) > -1) {
                                shouldIgnoreUrl = true;
                            }
                        });
                    if (!shouldIgnoreUrl) {
                        chapterUrls.push(url);
                    }
                });

                chapterLength = chapterUrls.length;
                if(chapterLength === 0){
                    reject('chapterLength is 0.');
                }
                console.log(`chapterLength: ${chapterLength}`);

                let hasErr = false;
                chapterUrls.map((url, index) => {
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
                            console.log(`parsed article count: ${Object.keys(articleHTML).length}/${chapterLength}`)
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