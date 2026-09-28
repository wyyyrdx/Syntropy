const express = require('express');
const { upload } = require('../middleware/upload');
const requireAuth = require('../middleware/requireAuth');
const {
  uploadDocument,
  generateKnowledge,
  getGenerationJob,
  getDocument
} = require('../controllers/ingestionController');

const router = express.Router();

/**
 * @openapi
 * /upload:
 *   post:
 *     summary: Ingest and upload notes/diagrams/PDF
 *     tags: [Ingestion]
 */
router.post('/upload', requireAuth, upload.any(), (req, res, next) => {
  uploadDocument(req, res, next);
});

/**
 * @openapi
 * /generate:
 *   post:
 *     summary: Generate structured knowledge (explanation, graph, or world)
 *     tags: [Ingestion]
 */
router.post('/generate', requireAuth, generateKnowledge);

/**
 * @openapi
 * /generation/{jobId}:
 *   get:
 *     summary: Retrieve generation status & result
 *     tags: [Ingestion]
 */
router.get('/generation/:jobId', requireAuth, getGenerationJob);

/**
 * @openapi
 * /document/{documentId}:
 *   get:
 *     summary: Retrieve document details
 *     tags: [Ingestion]
 */
router.get('/document/:documentId', requireAuth, getDocument);

module.exports = router;
