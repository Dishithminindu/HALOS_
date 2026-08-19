/**
 * HALOS v2.0 - Centralized API Gateway Client
 * Handles all communication between the static frontend and Cloudflare Worker API.
 */

const HALOS_API = (function() {
  const BASE_URL = '/api';

  function getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };

    const token = localStorage.getItem('halos_auth_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const role = localStorage.getItem('halos_user_role') || 'RESEARCHER';
    headers['X-HALOS-Role'] = role;

    return headers;
  }

  async function request(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const config = {
      headers: getHeaders(),
      ...options
    };

    try {
      const response = await fetch(url, config);

      if (response.status === 204) {
        return { ok: true };
      }

      // Check if response is CSV
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('text/csv')) {
        const text = await response.text();
        return { ok: true, data: text };
      }

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        return {
          ok: false,
          error: (data && data.error) ? data.error : `HTTP ${response.status}: Request failed.`,
          code: (data && data.code) ? data.code : 'HTTP_ERROR',
          status: response.status
        };
      }

      return data;
    } catch (err) {
      console.error('[HALOS_API_NETWORK_ERROR]', err);
      return {
        ok: false,
        error: 'Cloud database / API gateway unavailable. Please check connectivity.',
        code: 'NETWORK_ERROR'
      };
    }
  }

  return {
    // Health & System
    getHealth: () => request('/health'),

    // Participants CRUD
    createParticipant: (data) => request('/participants', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

    listParticipants: (limit = 50, offset = 0) => request(`/participants?limit=${limit}&offset=${offset}`),

    getParticipant: (id) => request(`/participants/${encodeURIComponent(id)}`),

    updateParticipant: (id, data) => request(`/participants/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

    deleteParticipant: (id) => request(`/participants/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    }),

    // 24-Hour Dietary Recall
    addRecallEntry: (participantId, entry) => request(`/participants/${encodeURIComponent(participantId)}/recall`, {
      method: 'POST',
      body: JSON.stringify(entry)
    }),

    getRecallEntries: (participantId) => request(`/participants/${encodeURIComponent(participantId)}/recall`),

    deleteRecallEntry: (recallId) => request(`/recall/${encodeURIComponent(recallId)}`, {
      method: 'DELETE'
    }),

    // Monthly Food-Frequency Questionnaire
    saveMonthlyQuestionnaire: (participantId, answers) => request(`/participants/${encodeURIComponent(participantId)}/monthly`, {
      method: 'POST',
      body: JSON.stringify(answers)
    }),

    getMonthlyQuestionnaire: (participantId) => request(`/participants/${encodeURIComponent(participantId)}/monthly`),

    // Features & Prediction
    getFeatures: (participantId) => request(`/participants/${encodeURIComponent(participantId)}/features`),

    predict: (participantId, options = {}) => request(`/participants/${encodeURIComponent(participantId)}/predict`, {
      method: 'POST',
      body: JSON.stringify(options)
    }),

    getPredictionHistory: (participantId) => request(`/participants/${encodeURIComponent(participantId)}/predictions`),

    // Research Analytics & Export
    getResearchSummary: () => request('/research/summary'),

    exportResearchCsv: () => request('/research/export.csv'),

    // Food Database Local/Remote Loader
    getFoodDatabase: async () => {
      try {
        const res = await fetch('/data/food-database.json');
        if (!res.ok) throw new Error('Failed to load food dataset');
        return await res.json();
      } catch (e) {
        console.error('Error loading food database:', e);
        return { categories: [], foods: [] };
      }
    },

    // Model Metadata
    getModelMetadata: async () => {
      try {
        const res = await fetch('/ml-service/model_metadata.json');
        if (!res.ok) return null;
        return await res.json();
      } catch {
        return null;
      }
    }
  };
})();
