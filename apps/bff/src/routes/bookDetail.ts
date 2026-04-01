import { createErrorResponse } from '../utils/error.js'
import type { FastifyPluginAsync } from 'fastify'

export const bookDetailRoute: FastifyPluginAsync = async (app) => {
  app.get('/api/books/:isbn13', async (_, reply) => {
    reply.status(501)

    return createErrorResponse(
      'BOOK_DETAIL_NOT_IMPLEMENTED',
      '도서 상세 엔드포인트 구현이 아직 완료되지 않았습니다.',
      501,
    )
  })
}
