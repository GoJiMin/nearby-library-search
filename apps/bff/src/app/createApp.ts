import Fastify from 'fastify'
import type { FastifyInstance } from 'fastify'

export function createApp(): FastifyInstance {
  return Fastify({
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
}
