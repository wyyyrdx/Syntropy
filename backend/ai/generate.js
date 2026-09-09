const fetch = require('node-fetch');
const path = require('path');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://ai-service:8000/generate';
const AI_REQUEST_TIMEOUT_MS = 60_000;

/**
 * @param {string} localImagePath - the path as stored by our own multer upload
 *   (e.g. ./uploads/169999-abc.jpg). We only need the filename; the AI service
 *   reads it from its own mount of the same shared volume.
 */
async function generateConceptGraph(localImagePath) {
  const filename = path.basename(localImagePath);
  const containerImagePath = `/app/uploads/${filename}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AI_REQUEST_TIMEOUT_MS);

  let response;
  try {
    response = await fetch(AI_SERVICE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_path: containerImagePath }),
      signal: controller.signal,
    });
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('AI service timed out after 60s.');
    }
    throw new Error(`Could not reach AI service: ${err.message}`);
  } finally {
    clearTimeout(timeout);
  }

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(body.detail || body.error || `AI service error (${response.status})`);
  }

  return body; 
}

module.exports = { generateConceptGraph };
