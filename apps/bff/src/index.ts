import Fastify from 'fastify';
import {createProductionApp} from './app/bootstrap.js';
import {startServer} from './server/startServer.js';

// Vercel's Fastify framework detection looks for a direct fastify import
// in the entrypoint file.
void Fastify;

const server = createProductionApp();

void startServer(server);
