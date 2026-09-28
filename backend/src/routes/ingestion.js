const express = require('express');
const { upload } = require('../middleware/upload');
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
router.post('/upload', upload.any(), (req, res, next) => {
  uploadDocument(req, res, next);
});

/**
 * @openapi
 * /generate:
 *   post:
 *     summary: Generate structured knowledge (explanation, graph, or world)
 *     tags: [Ingestion]
 */
router.post('/generate', generateKnowledge);

/**
 * @openapi
 * /generation/{jobId}:
 *   get:
 *     summary: Retrieve generation status & result
 *     tags: [Ingestion]
 */
router.get('/generation/:jobId', getGenerationJob);

/**
 * @openapi
 * /document/{documentId}:
 *   get:
 *     summary: Retrieve document details
 *     tags: [Ingestion]
 */
router.get('/document/:documentId', getDocument);

module.exports = router;
