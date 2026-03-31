import type { FastifyPluginAsync } from 'fastify'

export const healthRoute: FastifyPluginAsync = async (app) => {
  app.get('/health', async (_, reply) => {
    reply.header('Cache-Control', 'no-store')

    return {
      status: 'ok',
    }
  })
}
