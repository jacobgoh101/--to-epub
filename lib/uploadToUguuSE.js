const request = require('requestretry');
const fs = require('fs');

export const uploadToUguuSE = ({epubFileLocation}) => {
    return new Promise((resolve, reject) => {
        request
            .post({
                url: 'https://uguu.se/api.php?d=upload-tool',
                formData: {
                    file: fs.createReadStream(epubFileLocation)
                }
            }, function (error, response, body) {
                if (error) 
                    reject(error);
                if (!error && response.statusCode == 200) {
                    const downloadLink = body;
                    console.log(`download link: ${downloadLink}`);
                    resolve({downloadLink});

                    // remove file
                    fs.unlink(epubFileLocation, err => {
                        if (err) {
                            reject(err);
                        }
                        console.log(`removed: ${epubFileLocation}`)
                    });
                }
            });
    });
}
