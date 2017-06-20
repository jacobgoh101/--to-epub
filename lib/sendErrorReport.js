const nodemailer = require('nodemailer');

const config = {};

export const sendErrorReport = (({errorMessage, reqData}) => {
    return new Promise((resolve, reject) => {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: process.env.EMAIL_SENDER,
                clientId: process.env.EMAIL_SENDER_CLIENT_ID,
                clientSecret: process.env.EMAIL_SENDER_CLIENT_SECRET,
                refreshToken: process.env.EMAIL_SENDER_REFESH_TOKEN
            }
        });
        transporter.sendMail({
            from: 'youremail@gmail.com',
            to: 'jacobgoh101@gmail.com',
            subject: `Error from zai-xian-xiao-shuo--to--epub`,
            text: `${errorMessage} \n\n\n ${JSON.stringify(reqData)}`
        }, function (error, info) {
            if (error) {
                reject(error);
            } else {
                console.log('Email sent: ' + info.response);
                resolve('Email sent: ' + info.response);
            }
        });
    })
})