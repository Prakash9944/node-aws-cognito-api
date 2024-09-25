require('dotenv').config();

const Cognito = require('../cognito-services');
const { S3Client, PutObjectCommand, ListObjectsV2Command, GetObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');


let SignUp = async function (req, res) {
    try {
        let response = await Cognito.signUp(req.body.email,req.body.password);
        return res.json(response)
    } catch (err) {
        console.error("Unable to signUp:", err.message)
        return res.status(400).json({ message: err.message });
    }
}

let SignIn = async function (req, res) {
    try {
        let response = await Cognito.signIn(req.body.email,req.body.password);
        return res.json(response)
    } catch (err) {
        console.error("Unable to signIn:", err.message)
        return res.status(400).json({ message: err.message });
    }
}

let Verify = async function(req, res) {
    try {
        let response = await Cognito.verify(req.body.email,req.body.otp);
        return res.json(response)
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
            Key: req.headers.userid + "_" + file.originalname + "_" + Date.now(),
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

let listsAudio = async function (req, res) {
    const s3 = new S3Client({ region: process.env.AWS_REGION });
    const userId = req.headers.userid;

    try {
        let s3Files = await s3.send(new ListObjectsV2Command({ Bucket: process.env.AWS_S3_BUCKET_NAME, Prefix: userId }));
        return res.json(s3Files.Contents || [])
    } catch (err) {
        console.error("Unable to get audio lists", err);
        return res.status(400).json({ message: err.message });
    }
}

const streamToString = (stream) => {
    return new Promise((resolve, reject) => {
        let chunks = [];
        stream.on('data', (chunk) => {
            chunks.push(chunk);
        });
        stream.on('error', (err) => {
            reject(err);
        });
        stream.on('end', () => {
            resolve(Buffer.concat(chunks).toString('utf-8'));
        });
    });
};

let fetchContent = async function (req, res) {
    let s3Client = new S3Client({
        region: process.env.AWS_REGION,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        }
    });

    let command = new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: req.params.fileName,
    });

    try {
        let response = await s3Client.send(command);
        let fileContent = await streamToString(response.Body);
        return fileContent;
    } catch (err) {
        console.error("Unable to get audio lists", err);
        return res.status(400).json({ message: err.message });
    }
}

module.exports = {
    SignIn, Verify, SignUp, uploadFile, listsAudio, fetchContent
}
