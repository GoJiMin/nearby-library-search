import type {FastifyInstance} from 'fastify';
import type {AppFixtures} from '../app/fixtures.types.js';
import {createBookDetailRoute} from './book/detail/route.js';
import {createBookSearchRoute} from './book/search/route.js';
import {healthRoute} from './health/route.js';
import {createLibraryAvailabilityRoute} from './library/availability/route.js';
import {createLibrarySearchRoute} from './library/search/route.js';

type RegisterRoutesOptions = {
  fixtures?: AppFixtures;
};

export function registerRoutes(app: FastifyInstance, options: RegisterRoutesOptions = {}) {
  app.register(createBookDetailRoute(options.fixtures?.bookDetail));
  app.register(createBookSearchRoute(options.fixtures?.bookSearch));
  app.register(healthRoute);
  app.register(createLibraryAvailabilityRoute(options.fixtures?.libraryAvailability));
  app.register(createLibrarySearchRoute(options.fixtures?.librarySearch));
}
