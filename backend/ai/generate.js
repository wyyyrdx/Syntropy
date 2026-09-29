const fs = require('fs');
const path = require('path');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000/generate';
const AI_REQUEST_TIMEOUT_MS = Number.parseInt(process.env.AI_SERVICE_TIMEOUT_MS, 10) || 120_000;

const MIME_TYPES = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.pdf': 'application/pdf',
};

function buildEndpoint() {
  const separator = AI_SERVICE_URL.includes('?') ? '&' : '?';
  return process.env.MOCK_AI === 'true'
    ? `${AI_SERVICE_URL}${separator}mock=true`
    : AI_SERVICE_URL;
}

async function generateConceptGraph(localPaths) {
  const paths = (Array.isArray(localPaths) ? localPaths : [localPaths]).filter(Boolean);
  if (paths.length === 0) {
    throw new Error('No note files were provided to the AI service.');
  }

  const form = new FormData();
  for (const localPath of paths) {
    const absolutePath = path.resolve(localPath);
    const extension = path.extname(absolutePath).toLowerCase();
    const mimeType = MIME_TYPES[extension];

    if (!mimeType) {
      throw new Error(`Unsupported AI input type: ${extension || 'unknown'}`);
    }
    if (!fs.existsSync(absolutePath)) {
      throw new Error(`Uploaded note file is missing: ${path.basename(absolutePath)}`);
    }

    const fileBytes = await fs.promises.readFile(absolutePath);
    form.append('files', new Blob([fileBytes], { type: mimeType }), path.basename(absolutePath));
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AI_REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(buildEndpoint(), {
      method: 'POST',
      body: form,
      signal: controller.signal,
    });

    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(body.detail || body.error || `AI service returned HTTP ${response.status}.`);
    }
    if (!Array.isArray(body.nodes) || body.nodes.length === 0) {
      throw new Error('AI service returned an empty concept graph.');
    }

    console.log(`[ai/generate] AI service succeeded: "${body.subject_title}" from ${paths.length} file(s).`);
    return body;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(`AI analysis timed out after ${Math.round(AI_REQUEST_TIMEOUT_MS / 1000)} seconds.`);
    }
    throw new Error(`AI analysis request failed: ${error.message}`);
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = { generateConceptGraph };
