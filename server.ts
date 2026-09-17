/**
 * HALOS v2.0 - Local Development & Production Server
 * Bridges the static frontend and Cloudflare Worker API.
 * 
 * ARCHITECTURE PRINCIPLES:
 * 1. The frontend NEVER accesses Cloudflare D1 directly.
 * 2. The Cloudflare Worker API is the sole intermediary between the frontend and D1.
 * 3. D1 is connected to the Worker through the Cloudflare D1 binding named 'DB' (env.DB).
 * 4. All INSERT, SELECT, UPDATE, and DELETE operations are performed strictly by the Worker using env.DB.
 */

import express from 'express';
import path from 'path';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import { createD1Database } from './worker/src/d1-adapter.js';
import worker from './worker/src/index.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize Cloudflare D1 Database binding
  // This provides an exact Cloudflare D1-compatible binding (env.DB) backed by SQLite,
  // executing the worker/migrations/0001_initial.sql schema and pre-seeding the research cohort.
  const d1Database = await createD1Database();

  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // ============================================================================
  // Cloudflare Worker API Gateway (/api/*)
  // All requests to /api/* are dispatched to the Cloudflare Worker fetch handler.
  // The Worker accesses D1 exclusively via env.DB.
  // ============================================================================
  app.all('/api/*', async (req, res) => {
    try {
      const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
      const host = req.get('host') || `localhost:${PORT}`;
      const fullUrl = `${protocol}://${host}${req.originalUrl}`;

      const headers = new Headers();
      for (const [key, value] of Object.entries(req.headers)) {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach(v => headers.append(key, v));
          } else {
            headers.set(key, value);
          }
        }
      }

      const requestInit: RequestInit = {
        method: req.method,
        headers
      };

      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) && req.body && Object.keys(req.body).length > 0) {
        requestInit.body = JSON.stringify(req.body);
      }

      const webRequest = new Request(fullUrl, requestInit);

      // Pass Cloudflare D1 binding as env.DB
      const env = {
        DB: d1Database,
        ENVIRONMENT: process.env.NODE_ENV || 'development',
        ML_SERVICE_URL: process.env.ML_SERVICE_URL || 'http://localhost:8000'
      };

      const workerResponse = await worker.fetch(webRequest, env, {});

      // Forward HTTP status and headers
      res.status(workerResponse.status);
      workerResponse.headers.forEach((val: string, key: string) => {
        // Skip transfer-encoding or content-length to let Express handle streaming/chunking
        if (key.toLowerCase() !== 'transfer-encoding' && key.toLowerCase() !== 'content-length') {
          res.setHeader(key, val);
        }
      });

      const contentType = workerResponse.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const json = await workerResponse.json();
        res.json(json);
      } else {
        const text = await workerResponse.text();
        res.send(text);
      }
    } catch (err: any) {
      console.error('[API_GATEWAY_FORWARD_ERROR]', err);
      res.status(500).json({
        ok: false,
        error: err.message || 'Worker API execution failed',
        code: 'GATEWAY_ERROR'
      });
    }
  });

  // ============================================================================
  // Vite & Static Asset Handling
  // ============================================================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[HALOS v2.0] Cloudflare Worker API & D1 Gateway running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(console.error);
