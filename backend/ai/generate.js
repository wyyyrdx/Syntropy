const path = require('path');
const fs = require('fs');
const { execFile } = require('child_process');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000/generate';
const AI_UPLOADS_PATH_PREFIX = process.env.AI_UPLOADS_PATH_PREFIX || path.resolve(__dirname, '../uploads');
const AI_REQUEST_TIMEOUT_MS = parseInt(process.env.AI_SERVICE_TIMEOUT_MS, 10) || 45_000;

/**
 * Direct Python execution fallback when HTTP AI service is offline
 */
function runPythonFallback(localImagePath) {
  return new Promise((resolve, reject) => {
    const pythonScript = path.resolve(__dirname, '../../ai-models/prompt_to_3d.py');
    const pythonCwd = path.resolve(__dirname, '../../ai-models');
    const absImagePath = path.resolve(localImagePath);

    if (!fs.existsSync(pythonScript)) {
      return reject(new Error(`Python script not found: ${pythonScript}`));
    }
    if (!fs.existsSync(absImagePath)) {
      return reject(new Error(`Target image not found: ${absImagePath}`));
    }

    console.log(`[ai/generate] Running direct Python AI extraction for: ${absImagePath}`);

    execFile(
      'python',
      [pythonScript, absImagePath],
      {
        cwd: pythonCwd,
        maxBuffer: 15 * 1024 * 1024,
        timeout: 90_000,
        env: { ...process.env }
      },
      (error, stdout, stderr) => {
        if (error) {
          console.error('[ai/generate] Python script error:', stderr || error.message);
          return reject(new Error(`AI extraction process error: ${stderr || error.message}`));
        }

        try {
          // Extract the outermost JSON block from stdout
          const firstBrace = stdout.indexOf('{');
          const lastBrace = stdout.lastIndexOf('}');
          if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            const jsonText = stdout.substring(firstBrace, lastBrace + 1);
            const parsed = JSON.parse(jsonText);
            console.log(`[ai/generate] Direct Python AI extraction succeeded: "${parsed.subject_title}" with ${parsed.nodes?.length || 0} nodes.`);
            return resolve(parsed);
          }
          return resolve(JSON.parse(stdout));
        } catch (parseErr) {
          reject(new Error(`Failed to parse AI output JSON: ${parseErr.message}\nOutput: ${stdout.substring(0, 500)}`));
        }
      }
    );
  });
}

/**
 * @param {string} localImagePath - the path as stored by our own multer upload
 *   (e.g. ./uploads/169999-abc.jpg).
 */
async function generateConceptGraph(localImagePath) {
  const filename = path.basename(localImagePath);
  const containerImagePath = path.isAbsolute(AI_UPLOADS_PATH_PREFIX)
    ? path.join(AI_UPLOADS_PATH_PREFIX, filename)
    : `${AI_UPLOADS_PATH_PREFIX}/${filename}`;

  // 1. Try FastAPI AI service if available
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Math.min(AI_REQUEST_TIMEOUT_MS, 15_000));

  const mockQuery = process.env.MOCK_AI === 'true' ? '?mock=true' : '';
  const endpoint = AI_SERVICE_URL.includes('?') 
    ? `${AI_SERVICE_URL}&mock=${process.env.MOCK_AI === 'true'}` 
    : `${AI_SERVICE_URL}${mockQuery}`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_path: containerImagePath }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (response.ok) {
      const body = await response.json();
      if (body && body.nodes && body.nodes.length > 0) {
        console.log(`[ai/generate] FastAPI AI service succeeded: "${body.subject_title}"`);
        return body;
      }
    }
  } catch (httpErr) {
    clearTimeout(timeout);
    console.warn(`[ai/generate] FastAPI service unreachable (${httpErr.message}). Switching to direct Python engine.`);
  }

  // 2. Direct Python extraction engine fallback
  return runPythonFallback(localImagePath);
}

module.exports = { generateConceptGraph, runPythonFallback };