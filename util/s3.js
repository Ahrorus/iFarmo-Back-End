const S3 = require('aws-sdk/clients/s3');
const fs = require('fs');
require('dotenv/config');
const sharp = require('sharp');

const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;

const s3 = new S3({
    region,
    accessKeyId,
    secretAccessKey
});

// Upload file to S3
const uploadFile = async (file) => {
    // resize image to 500x500 and upload
    const fileStream = await sharp(file.path).resize(800, 800).toBuffer();
    const filename = "images/" + file.filename;
    // const fileStream = fs.createReadStream(file.path);
    const params = {
        Bucket: bucketName,
        Key: filename,
        Body: fileStream
    };
    return s3.upload(params).promise();
}

// Download file from S3
const downloadFile = (fileKey) => {
    const params = {
        Bucket: bucketName,
        Key: fileKey
    };
    return s3.getObject(params).createReadStream();
}

// Helper function to unlink the file
const unlink = (filePath) => {
    return new Promise((resolve, reject) => {
        fs.unlink(filePath, (err) => {
            if (err) reject(err);
            resolve();
        });
    });
};


module.exports.uploadFile = uploadFile;
module.exports.downloadFile = downloadFile;
module.exports.unlink = unlink;