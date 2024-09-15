require('dotenv').config();

const Cognito = require('../cognito-services');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');


let SignUp = async function (req, res) {
    try {
        let response = await Cognito.signUp(req.body.email,req.body.password);
        res.json(response)
    } catch (err) {
        console.error("Unable to signUp:", err.message)
        return res.status(400).json({ message: err.message });
    }
}

let SignIn = async function (req, res) {
    try {
        let response = await Cognito.signIn(req.body.email,req.body.password);
        res.json(response)
    } catch (err) {
        console.error("Unable to signIn:", err.message)
        return res.status(400).json({ message: err.message });
    }
}

let Verify = async function(req, res) {
    try {
        let response = await Cognito.verify(req.body.email,req.body.codeEmailVerify);
        res.json(response)
    } catch (err) {
        console.error("Unable to verify:", err.message)
        return res.status(400).json({ message: err.message });
    }
}

 let uploadFile = async function(req, res) {
    let file = req.file;
    if (!file) {
        return res.status(400).send('No file uploaded.');
    }

    let s3Client = new S3Client({
        region: process.env.AWS_REGION,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
    });

    try {
        let filePath = path.join(__dirname, '../' + file.path);
        let fileData = fs.readFileSync(filePath, 'utf8');
        let uploadParams = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: Date.now() + "_" + file.originalname,
            Body: fileData,
        };

        let data = await s3Client.send(new PutObjectCommand(uploadParams));
        fs.unlinkSync(filePath);
        return res.status(200).send('File uploaded to S3 successfully!');
    } catch (err) {
        console.error('Error uploading file to S3:', err);
        return res.status(400).json({ message: err.message });
    }
};

module.exports = {
    SignIn, Verify, SignUp, uploadFile
}
