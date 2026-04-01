import type {FastifyInstance} from 'fastify';
import {serverEnv} from '../config/env.js';

export async function startServer(server: FastifyInstance) {
  try {
    await server.listen(serverEnv);
  } catch (error) {
    server.log.error(error);
    process.exitCode = 1;
  }
}
