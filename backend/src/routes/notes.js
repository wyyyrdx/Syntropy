const express = require('express');
const upload = require('../middleware/upload');
const { uploadNote, getStatus } = require('../controllers/notesController');

const router = express.Router();

router.post('/upload', upload.single('image'), uploadNote);
router.get('/status/:sessionId', getStatus);

module.exports = router;
