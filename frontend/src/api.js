/**
 * Syntropy API Client Utilities
 */

const configuredApiUrl = (import.meta.env.VITE_API_URL || '').trim().replace(/\/$/, '');
const API_BASE = configuredApiUrl
  ? (configuredApiUrl.endsWith('/api') ? configuredApiUrl : `${configuredApiUrl}/api`)
  : '/api';

function getAuthHeaders() {
  try {
    const session = JSON.parse(localStorage.getItem('syntropy_auth') || 'null');
    return session?.token ? { Authorization: `Bearer ${session.token}` } : {};
  } catch {
    return {};
  }
}

async function parseResponse(res, fallbackMessage) {
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error('The Syntropy backend is unavailable. Check the frontend API URL and backend deployment.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401) {
      try { localStorage.removeItem('syntropy_auth'); } catch {}
      window.dispatchEvent(new Event('syntropy:unauthorized'));
    }
    throw new Error(data.error || fallbackMessage);
  }
  return data;
}

export const api = {
  // Check backend health
  getHealth: async () => {
    try {
      const res = await fetch(`${API_BASE}/health`);
      return await parseResponse(res, 'Offline');
    } catch (err) {
      return { status: 'offline', error: err.message };
    }
  },

  // User Registration
  register: async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return parseResponse(res, 'Registration failed');
  },

  // User Login
  login: async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return parseResponse(res, 'Login failed');
  },

  // Note Upload
  uploadNote: async (imageFile, token) => {
    const formData = new FormData();
    formData.append('image', imageFile);

    const res = await fetch(`${API_BASE}/notes/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });

    return parseResponse(res, 'Upload failed');
  },

  // Poll Note Status
  getStatus: async (sessionId, token) => {
    const res = await fetch(`${API_BASE}/notes/status/${sessionId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return parseResponse(res, 'Failed to fetch note status');
  },

  // Ingestion: Upload note file(s) (PNG, JPG, PDF, WEBP)
  uploadDocument: async (files) => {
    const formData = new FormData();
    if (Array.isArray(files)) {
      files.forEach((f) => formData.append('files', f));
    } else {
      formData.append('files', files);
    }

    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData
    });

    return parseResponse(res, 'Upload failed');
  },

  // Ingestion: Trigger AI Generation (explanation | graph | world)
  generateKnowledge: async (documentId, mode = 'graph') => {
    const res = await fetch(`${API_BASE}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ document_id: documentId, mode })
    });

    return parseResponse(res, 'Generation failed');
  },

  // Ingestion: Get Generation Job Status & Results
  getGenerationJob: async (jobId) => {
    const res = await fetch(`${API_BASE}/generation/${jobId}`, { headers: getAuthHeaders() });
    return parseResponse(res, 'Failed to fetch generation job');
  },

  // Ingestion: Get Document Details
  getDocument: async (documentId) => {
    const res = await fetch(`${API_BASE}/document/${documentId}`, { headers: getAuthHeaders() });
    return parseResponse(res, 'Failed to fetch document');
  },

  getProfile: async () => {
    const res = await fetch(`${API_BASE}/profile`, { headers: getAuthHeaders() });
    return parseResponse(res, 'Failed to load profile');
  },

  updateProgress: async (xp, completedQuizzes) => {
    const res = await fetch(`${API_BASE}/profile/progress`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ xp, completed_quizzes: completedQuizzes })
    });
    return parseResponse(res, 'Failed to save progress');
  }
};
