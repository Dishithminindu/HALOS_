/**
 * HALOS v2.0 - Cloudflare Worker Main API Router
 * Secure API Gateway routing requests to D1 database and ML inference services.
 */

import { verifyAuth, USER_ROLES } from './auth.js';
import {
  createParticipant,
  listParticipants,
  getParticipantById,
  updateParticipant,
  deleteParticipant
} from './participants.js';
import {
  addRecallEntry,
  getRecallEntries,
  deleteRecallEntry
} from './recall.js';
import {
  saveMonthlyQuestionnaire,
  getMonthlyQuestionnaire
} from './questionnaire.js';
import {
  buildFeatureVector,
  executePrediction,
  getPredictionsForParticipant
} from './prediction.js';
import {
  getResearchSummary,
  exportResearchCsv
} from './research.js';

// CORS Configuration
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-HALOS-Role',
  'Access-Control-Max-Age': '86400'
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...corsHeaders
    }
  });
}

function errorResponse(message, code = 'INTERNAL_ERROR', status = 500) {
  return jsonResponse({
    ok: false,
    error: message,
    code
  }, status);
}

export default {
  async fetch(request, env, ctx) {
    // 1. Handle CORS Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // 2. Health check route
    if (path === '/api/health' && method === 'GET') {
      return jsonResponse({
        ok: true,
        data: {
          system: 'HALOS v2.0 API Gateway',
          status: 'online',
          environment: env.ENVIRONMENT || 'production',
          database: env.DB ? 'connected' : 'unbound',
          timestamp: new Date().toISOString()
        }
      });
    }

    // 3. Ensure D1 Database binding exists
    const db = env.DB;
    if (!db) {
      return errorResponse('Cloudflare D1 database binding DB not found.', 'DATABASE_UNBOUND', 503);
    }

    try {
      // -------------------------------------------------------------
      // PARTICIPANTS ROUTES
      // -------------------------------------------------------------
      if (path === '/api/participants' && method === 'POST') {
        const auth = verifyAuth(request, env, [USER_ROLES.ADMIN, USER_ROLES.RESEARCHER, USER_ROLES.DATA_COLLECTOR]);
        if (!auth.authenticated) return errorResponse(auth.error, auth.code, 403);

        const body = await request.json().catch(() => ({}));
        const res = await createParticipant(db, body);
        return jsonResponse(res, res.ok ? 201 : 400);
      }

      if (path === '/api/participants' && method === 'GET') {
        const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '50', 10)));
        const offset = Math.max(0, parseInt(url.searchParams.get('offset') || '0', 10));
        const res = await listParticipants(db, limit, offset);
        return jsonResponse(res);
      }

      // Participant by ID matching: /api/participants/:id
      const partMatch = path.match(/^\/api\/participants\/([^/]+)$/);
      if (partMatch) {
        const partId = partMatch[1];

        if (method === 'GET') {
          const res = await getParticipantById(db, partId);
          return jsonResponse(res, res.ok ? 200 : 404);
        }

        if (method === 'PUT') {
          const auth = verifyAuth(request, env, [USER_ROLES.ADMIN, USER_ROLES.RESEARCHER]);
          if (!auth.authenticated) return errorResponse(auth.error, auth.code, 403);

          const body = await request.json().catch(() => ({}));
          const res = await updateParticipant(db, partId, body);
          return jsonResponse(res, res.ok ? 200 : 400);
        }

        if (method === 'DELETE') {
          const auth = verifyAuth(request, env, [USER_ROLES.ADMIN]);
          if (!auth.authenticated) return errorResponse(auth.error, auth.code, 403);

          const res = await deleteParticipant(db, partId);
          return jsonResponse(res, res.ok ? 200 : 404);
        }
      }

      // -------------------------------------------------------------
      // 24-HOUR DIETARY RECALL ROUTES
      // -------------------------------------------------------------
      const recallMatch = path.match(/^\/api\/participants\/([^/]+)\/recall$/);
      if (recallMatch) {
        const partId = recallMatch[1];

        if (method === 'POST') {
          const body = await request.json().catch(() => ({}));
          const res = await addRecallEntry(db, partId, body);
          return jsonResponse(res, res.ok ? 201 : 400);
        }

        if (method === 'GET') {
          const res = await getRecallEntries(db, partId);
          return jsonResponse(res, res.ok ? 200 : 404);
        }
      }

      // Delete specific recall item: DELETE /api/recall/:id
      const singleRecallMatch = path.match(/^\/api\/recall\/([^/]+)$/);
      if (singleRecallMatch && method === 'DELETE') {
        const recId = singleRecallMatch[1];
        const res = await deleteRecallEntry(db, recId);
        return jsonResponse(res, res.ok ? 200 : 404);
      }

      // -------------------------------------------------------------
      // MONTHLY QUESTIONNAIRE ROUTES
      // -------------------------------------------------------------
      const monthlyMatch = path.match(/^\/api\/participants\/([^/]+)\/monthly$/);
      if (monthlyMatch) {
        const partId = monthlyMatch[1];

        if (method === 'POST') {
          const body = await request.json().catch(() => ({}));
          const res = await saveMonthlyQuestionnaire(db, partId, body);
          return jsonResponse(res, res.ok ? 201 : 400);
        }

        if (method === 'GET') {
          const res = await getMonthlyQuestionnaire(db, partId);
          return jsonResponse(res, res.ok ? 200 : 404);
        }
      }

      // -------------------------------------------------------------
      // FEATURE VECTOR & PREDICTION ROUTES
      // -------------------------------------------------------------
      const featMatch = path.match(/^\/api\/participants\/([^/]+)\/features$/);
      if (featMatch && method === 'GET') {
        const partId = featMatch[1];
        const res = await buildFeatureVector(db, partId);
        return jsonResponse(res, res.ok ? 200 : 404);
      }

      const predMatch = path.match(/^\/api\/participants\/([^/]+)\/predict$/);
      if (predMatch && method === 'POST') {
        const partId = predMatch[1];
        const body = await request.json().catch(() => ({}));
        const res = await executePrediction(db, env, partId, body);
        return jsonResponse(res, res.ok ? 201 : 400);
      }

      const predHistMatch = path.match(/^\/api\/participants\/([^/]+)\/predictions$/);
      if (predHistMatch && method === 'GET') {
        const partId = predHistMatch[1];
        const res = await getPredictionsForParticipant(db, partId);
        return jsonResponse(res);
      }

      // -------------------------------------------------------------
      // RESEARCH & CSV EXPORT ROUTES
      // -------------------------------------------------------------
      if (path === '/api/research/summary' && method === 'GET') {
        const res = await getResearchSummary(db);
        return jsonResponse(res);
      }

      if (path === '/api/research/export.csv' && method === 'GET') {
        const auth = verifyAuth(request, env, [USER_ROLES.ADMIN, USER_ROLES.RESEARCHER]);
        if (!auth.authenticated) return errorResponse(auth.error, auth.code, 403);

        const csvContent = await exportResearchCsv(db);
        return new Response(csvContent, {
          status: 200,
          headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="halos_research_export_${new Date().toISOString().slice(0, 10)}.csv"`,
            ...corsHeaders
          }
        });
      }

      return errorResponse(`API Route not found: ${method} ${path}`, 'NOT_FOUND', 404);
    } catch (err) {
      console.error('[WORKER_INTERNAL_ERROR]', err);
      // Ensure no raw stack traces are sent to clients
      return errorResponse('An internal server error occurred while processing the research request.', 'INTERNAL_SERVER_ERROR', 500);
    }
  }
};
