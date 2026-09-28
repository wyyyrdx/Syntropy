/**
 * Syntropy API Client Utilities
 */

const API_BASE = '/api';

export const api = {
  // Check backend health
  getHealth: async () => {
    try {
      const res = await fetch(`${API_BASE}/health`);
      return await res.json();
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
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Registration failed');
    }
    return await res.json();
  },

  // User Login
  login: async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Login failed');
    }
    return await res.json();
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

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Upload failed');
    }
    return await res.json();
  },

  // Poll Note Status
  getStatus: async (sessionId, token) => {
    const res = await fetch(`${API_BASE}/notes/status/${sessionId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to fetch note status');
    }
    return await res.json();
  },

  // Ingestion: Upload file(s) (PNG, JPG, PDF, WEBP, TXT, MD)
  uploadDocument: async (files) => {
    const formData = new FormData();
    if (Array.isArray(files)) {
      files.forEach((f) => formData.append('files', f));
      if (files[0]) formData.append('file', files[0]);
    } else {
      formData.append('file', files);
      formData.append('files', files);
    }

    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Upload failed');
    }
    return await res.json();
  },

  // Ingestion: Trigger AI Generation (explanation | graph | world)
  generateKnowledge: async (documentId, mode = 'graph') => {
    const res = await fetch(`${API_BASE}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ document_id: documentId, mode })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Generation failed');
    }
    return await res.json();
  },

  // Ingestion: Get Generation Job Status & Results
  getGenerationJob: async (jobId) => {
    const res = await fetch(`${API_BASE}/generation/${jobId}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to fetch generation job');
    }
    return await res.json();
  },

  // Ingestion: Get Document Details
  getDocument: async (documentId) => {
    const res = await fetch(`${API_BASE}/document/${documentId}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to fetch document');
    }
    return await res.json();
  }
};

