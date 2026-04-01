import Fastify from 'fastify';
import type {FastifyInstance} from 'fastify';
import {registerRoutes} from '../routes/index.js';

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

  registerRoutes(app);

  return app;
}
