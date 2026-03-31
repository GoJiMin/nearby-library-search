import { createApp } from './app/createApp.js'
import { startServer } from './server/startServer.js'

const server = createApp()

void startServer(server)
