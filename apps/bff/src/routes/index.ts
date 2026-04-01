import type { FastifyInstance } from 'fastify'
import { bookSearchRoute } from './bookSearch.js'
import { healthRoute } from './health.js'

export function registerRoutes(app: FastifyInstance) {
  app.register(bookSearchRoute)
  app.register(healthRoute)
}
