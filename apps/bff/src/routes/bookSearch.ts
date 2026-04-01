import type { FastifyPluginAsync } from 'fastify'

export const bookSearchRoute: FastifyPluginAsync = async (app) => {
  app.get('/api/books/search', async (_, reply) => {
    reply.status(501)

    return {
      title: 'BOOK_SEARCH_NOT_IMPLEMENTED',
      detail: '도서 검색 엔드포인트 구현이 아직 완료되지 않았습니다.',
      status: 501,
    }
  })
}
