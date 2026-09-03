/**
 * HTTP client for the AI Engineer's FastAPI concept-graph service.
 */

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
const AI_SERVICE_TIMEOUT_MS = Number(process.env.AI_SERVICE_TIMEOUT_MS || 60000);

async function generateConceptGraph(imagePath) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AI_SERVICE_TIMEOUT_MS);

  let response;
  try {
    response = await fetch(`${AI_SERVICE_URL}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_path: imagePath }),
      signal: controller.signal
    });
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('AI service timed out');
    }
    throw new Error(`Could not reach AI service: ${err.message}`);
  } finally {
    clearTimeout(timeout);
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message = payload && payload.error ? payload.error : `AI service returned ${response.status}`;
    throw new Error(message);
  }

  return payload; 
}

module.exports = { generateConceptGraph };
