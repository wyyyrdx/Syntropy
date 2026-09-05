const express = require('express');
const { upload } = require('../middleware/upload');
const { uploadNote, getStatus } = require('../controllers/notesController');

const router = express.Router();

router.post('/', upload.single('image'), uploadNote);
router.get('/:sessionId/status', getStatus);

module.exports = router;
