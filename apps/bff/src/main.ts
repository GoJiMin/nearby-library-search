import Fastify from 'fastify'

const DEFAULT_HOST = '0.0.0.0'
const DEFAULT_PORT = 3001

const host = process.env.HOST ?? DEFAULT_HOST
const port = Number(process.env.PORT ?? DEFAULT_PORT)

const server = Fastify({
  logger: true,
})

async function startServer() {
  try {
    await server.listen({ host, port })
  } catch (error) {
    server.log.error(error)
    process.exitCode = 1
  }
}

void startServer()
