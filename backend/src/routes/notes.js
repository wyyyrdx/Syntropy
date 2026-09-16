const express = require('express');
const { upload } = require('../middleware/upload');
const requireAuth = require('../middleware/requireAuth');
const { uploadNote, getStatus } = require('../controllers/notesController');

const router = express.Router();

router.post('/upload', requireAuth, upload.single('image'), uploadNote);
router.get('/status/:sessionId', requireAuth, getStatus);

module.exports = router;
