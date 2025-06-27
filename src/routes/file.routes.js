const express = require('express');
const router = express.Router();
const multer = require('multer');
const fileController = require('../controllers/file.controller');

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/upload', upload.single('file'), fileController.uploadFile);
router.get('/download/:id', fileController.downloadFile);

module.exports = router;
