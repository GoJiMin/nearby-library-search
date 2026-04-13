import type {FastifyInstance} from 'fastify';
import {developmentConfig} from '../config/env.js';
import {createApp} from './createApp.js';
import type {CreateAppOptions} from './fixtures.types.js';

function createProductionApp(): FastifyInstance {
  if (developmentConfig.useDevFixtures) {
    throw new Error('Invalid production bootstrap: USE_DEV_FIXTURES=true is not allowed');
  }

  return createApp();
}

function createDevApp(options: CreateAppOptions = {}): FastifyInstance {
  if (developmentConfig.useDevFixtures && !options.fixtures) {
    throw new Error('Invalid dev bootstrap: USE_DEV_FIXTURES=true requires a fixture registry');
  }

  if (developmentConfig.useDevFixtures) {
    return createApp({fixtures: options.fixtures});
  }

  return createApp();
}

export {createDevApp, createProductionApp};
