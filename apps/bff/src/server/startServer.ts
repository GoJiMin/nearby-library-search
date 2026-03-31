import type { FastifyInstance } from 'fastify'

const DEFAULT_HOST = '0.0.0.0'
const DEFAULT_PORT = 3001

export async function startServer(server: FastifyInstance) {
  const host = process.env.HOST ?? DEFAULT_HOST
  const port = Number(process.env.PORT ?? DEFAULT_PORT)

  try {
    await server.listen({ host, port })
  } catch (error) {
    server.log.error(error)
    process.exitCode = 1
  }
}
