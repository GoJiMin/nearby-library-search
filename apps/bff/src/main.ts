import {createProductionApp} from './app/bootstrap.js';
import {startServer} from './server/startServer.js';

const server = createProductionApp();

void startServer(server);
