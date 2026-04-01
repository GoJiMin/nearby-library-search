import type { ErrorResponse } from '@nearby-library-search/contracts'
import type { FastifyPluginAsync } from 'fastify'
import type { ZodError } from 'zod'
import { bookDetailParamsSchema } from '../schemas/book.js'
import { createErrorResponse } from '../utils/error.js'

type Result<T> =
  | {
      ok: true
      value: T
    }
  | {
      ok: false
      error: ErrorResponse
    }

function getBookDetailParamsError(error: ZodError): ErrorResponse {
  const [firstIssue] = error.issues

  if (firstIssue?.path[0] === 'isbn13') {
    return createErrorResponse(
      'BOOK_DETAIL_ISBN13_INVALID',
      'isbn13은 13자리 숫자 문자열이어야 합니다.',
      400,
    )
  }

  return createErrorResponse(
    'BOOK_DETAIL_PARAMS_INVALID',
    '도서 상세 요청 경로가 올바르지 않습니다.',
    400,
  )
}

function parseBookDetailParams(params: unknown): Result<{ isbn13: string }> {
  const result = bookDetailParamsSchema.safeParse(params)

  if (result.success) {
    return {
      ok: true,
      value: result.data,
    }
  }

  return {
    ok: false,
    error: getBookDetailParamsError(result.error),
  }
}

export const bookDetailRoute: FastifyPluginAsync = async (app) => {
  app.get('/api/books/:isbn13', async (request, reply) => {
    const parsedParams = parseBookDetailParams(request.params)

    if (!parsedParams.ok) {
      reply.status(parsedParams.error.status)

      return parsedParams.error
    }

    reply.status(501)

    return createErrorResponse(
      'BOOK_DETAIL_NOT_IMPLEMENTED',
      '도서 상세 엔드포인트 구현이 아직 완료되지 않았습니다.',
      501,
    )
  })
}
