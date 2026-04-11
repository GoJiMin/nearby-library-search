import type {FastifyInstance} from 'fastify';
import {bookDetailRoute} from './bookDetail.js';
import {bookSearchRoute} from './bookSearch.js';
import {healthRoute} from './health.js';
import {libraryAvailabilityRoute} from './libraryAvailability.js';
import {librarySearchRoute} from './librarySearch.js';

export function registerRoutes(app: FastifyInstance) {
  app.register(bookDetailRoute);
  app.register(bookSearchRoute);
  app.register(healthRoute);
  app.register(libraryAvailabilityRoute);
  app.register(librarySearchRoute);
}
