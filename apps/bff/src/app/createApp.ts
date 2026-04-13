import helmet from '@fastify/helmet';
import Fastify from 'fastify';
import type {FastifyInstance} from 'fastify';
import {developmentConfig, webAppConfig} from '../config/env.js';
import {registerRoutes} from '../routes/index.js';
import {createErrorResponse} from '../utils/error.js';

const CORS_ALLOWED_METHODS = 'GET,HEAD,OPTIONS';
const DEV_CORS_ORIGINS = ['http://localhost:5173', 'http://127.0.0.1:5173'] as const;

function createAllowedCorsOrigins() {
  const allowedOrigins = new Set([webAppConfig.origin]);

  if (developmentConfig.allowDevCorsOrigins) {
    for (const origin of DEV_CORS_ORIGINS) {
      allowedOrigins.add(origin);
    }
  }

  return allowedOrigins;
}

export function createApp(): FastifyInstance {
  const app = Fastify({
    logger: {
      redact: {
        paths: ['req.headers.authorization', 'req.headers.cookie', 'res.headers["set-cookie"]'],
        remove: true,
      },
    },
  });
  const allowedCorsOrigins = createAllowedCorsOrigins();

  void app.register(helmet, {
    contentSecurityPolicy: false,
    hsts: false,
  });

  app.addHook('onRequest', async (request, reply) => {
    const origin = request.headers.origin;

    if (typeof origin === 'string' && allowedCorsOrigins.has(origin)) {
      reply.header('access-control-allow-origin', origin);
      reply.header('access-control-allow-methods', CORS_ALLOWED_METHODS);
      reply.header('vary', 'Origin');

      const requestHeaders = request.headers['access-control-request-headers'];

      if (typeof requestHeaders === 'string' && requestHeaders.length > 0) {
        reply.header('access-control-allow-headers', requestHeaders);
      }
    }

    if (request.method === 'OPTIONS' && typeof origin === 'string') {
      return reply.code(204).send();
    }
  });

  registerRoutes(app);

  app.setNotFoundHandler(async (_, reply) => {
    return reply.status(404).send(createErrorResponse('NOT_FOUND', '요청한 경로를 찾을 수 없습니다.', 404));
  });

  app.setErrorHandler(async (error, request, reply) => {
    request.log.error({err: error}, 'Unhandled application error');

    return reply
      .status(500)
      .send(
        createErrorResponse(
          'INTERNAL_SERVER_ERROR',
          '서버 내부에서 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
          500,
        ),
      );
  });

  return app;
}
