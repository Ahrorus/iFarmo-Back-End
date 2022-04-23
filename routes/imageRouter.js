const router = require('express').Router();
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { uploadFile, downloadFile } = require('../util/s3');
const upload = multer({ dest: 'uploads/' });
const fs = require('fs');

// Get image by key
router.get('/:key', async (req, res) => {
    const key = req.params.key;
    const readStream = await downloadFile(key);
    readStream.pipe(res);
});

// Upload image
router.post('/', upload.single('image'), async (req, res) => {
    try {
        // Upload the image to S3
        if (req.file) {
            const result = await uploadFile(req.file);
            if (!result) return res.status(404).send('Could not upload the file.');
            await unlink(req.file.path);
            res.redirect(result.Location);
        }
        else {
            console.log('No file received');
            res.send('No file received');
        }
    }
    catch(err) {
        console.log(err);
        return res.status(404).send("Could not upload the image.");
    }
});


// Helper function to unlink the file
const unlink = (filePath) => {
    return new Promise((resolve, reject) => {
        fs.unlink(filePath, (err) => {
            if (err) reject(err);
            resolve();
        });
    });
};

module.exports = router;