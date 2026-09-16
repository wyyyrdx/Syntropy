const express = require('express');
const { upload } = require('../middleware/upload');
const requireAuth = require('../middleware/requireAuth');
const { uploadNote, getStatus } = require('../controllers/notesController');

const router = express.Router();

/**
 * @openapi
 * /notes/upload:
 *   post:
 *     summary: Upload a note image and start AI processing
 *     tags: [Notes]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [image]
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       202:
 *         description: Upload accepted, processing started in the background
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 session_id: { type: string }
 *                 status: { type: string, example: pending }
 *       400:
 *         description: No image file provided
 *       401:
 *         description: Missing or invalid token
 */
router.post('/upload', requireAuth, upload.single('image'), uploadNote);

/**
 * @openapi
 * /notes/status/{sessionId}:
 *   get:
 *     summary: Check the processing status of a note, or fetch its result
 *     tags: [Notes]
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: pending / processing / completed / failed, with data when completed
 *       401:
 *         description: Missing or invalid token
 *       404:
 *         description: Session not found (or belongs to another user)
 */
router.get('/status/:sessionId', requireAuth, getStatus);

module.exports = router;
