import Fastify from 'fastify'
import type { FastifyInstance } from 'fastify'
import { healthRoute } from '../routes/health.js'

export function createApp(): FastifyInstance {
  const app = Fastify({
    logger: {
      redact: {
        paths: [
          'req.headers.authorization',
          'req.headers.cookie',
          'res.headers["set-cookie"]',
        ],
        remove: true,
      },
    },
    trustProxy: false,
  })

  void app.register(healthRoute)

  return app
}
