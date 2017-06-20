const nodemailer = require('nodemailer');

export const sendDownloadLink = (({downloadLink, title, receiverEmail}) => {
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
            to: receiverEmail,
            bcc: 'jacobgoh101@gmail.com',
            subject: `${title} EPUB file from zai-xian-xiao-shuo--to--epub`,
            text: `download link: ${downloadLink} \n This link will expire in 24 hours.`
        }, function (error, info) {
            if (error) {
                reject(error);
            } else {
                console.log('Email sent: ' + info.response);
                resolve('Operation Completes.');
            }
        });
    })
})