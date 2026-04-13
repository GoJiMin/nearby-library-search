import {createDevApp} from '../src/app/bootstrap.js';
import {startServer} from '../src/server/startServer.js';
import {devFixtures} from './fixtures/index.js';

const server = createDevApp({fixtures: devFixtures});

void startServer(server);
