import Fastify from 'fastify';
import type {FastifyInstance} from 'fastify';
import {registerRoutes} from '../routes/index.js';

const CORS_ALLOWED_METHODS = 'GET,HEAD,OPTIONS';

function isAllowedCorsOrigin(origin: string) {
  let url: URL;

  try {
    url = new URL(origin);
  } catch {
    return false;
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return false;
  }

  return url.hostname === 'localhost' || url.hostname === '127.0.0.1';
}

export function createApp(): FastifyInstance {
  const app = Fastify({
    logger: {
      redact: {
        paths: ['req.headers.authorization', 'req.headers.cookie', 'res.headers["set-cookie"]'],
        remove: true,
      },
    },
    trustProxy: false,
  });

  app.addHook('onRequest', async (request, reply) => {
    const origin = request.headers.origin;

    if (typeof origin === 'string' && isAllowedCorsOrigin(origin)) {
      reply.header('access-control-allow-origin', origin);
      reply.header('access-control-allow-methods', CORS_ALLOWED_METHODS);
      reply.header('vary', 'Origin');

      const requestHeaders = request.headers['access-control-request-headers'];

      if (typeof requestHeaders === 'string' && requestHeaders.length > 0) {
        reply.header('access-control-allow-headers', requestHeaders);
      }
    }

    if (request.method === 'OPTIONS') {
      return reply.code(204).send();
    }
  });

  registerRoutes(app);

  return app;
}
