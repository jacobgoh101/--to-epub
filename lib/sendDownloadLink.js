const nodemailer = require('nodemailer');

export const sendDownloadLink = (({downloadLink}) => {
    return new Promise((resolve, reject) => {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_SENDER,
                pass: process.env.EMAIL_SENDER_PASS
            }
        });
        transporter.sendMail({
            from: 'youremail@gmail.com',
            to: 'jacobgoh101@gmail.com',
            subject: 'zai-xian-xiao-shuo--to--epub',
            text: `download link: ${downloadLink} \n This link will expire in 24 hours.`
        }, function (error, info) {
            if (error) {
                reject(err);
            } else {
                console.log('Email sent: ' + info.response);
                resolve('Operation Completes.');
            }
        });
    })
})