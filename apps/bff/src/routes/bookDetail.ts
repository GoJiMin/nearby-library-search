import type { ErrorResponse } from '@nearby-library-search/contracts'
import {
  LibraryApiRequestConfigError,
  requestLibraryApi,
} from '../libraryApi/requestLibraryApi.js'
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

async function fetchBookDetailPayload(
  isbn13: string,
): Promise<Result<unknown>> {
  try {
    const response = await requestLibraryApi({
      endpoint: '/srchDtlList',
      queryParams: {
        isbn13,
        loaninfoYN: 'Y',
      },
      requiredQueryParams: ['isbn13'],
    })

    if (!response.ok) {
      return {
        ok: false,
        error: createErrorResponse(
          'BOOK_DETAIL_UPSTREAM_ERROR',
          '도서 상세 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.',
          502,
        ),
      }
    }

    return {
      ok: true,
      value: await response.json(),
    }
  } catch (error) {
    if (error instanceof LibraryApiRequestConfigError) {
      return {
        ok: false,
        error: {
          detail: error.detail,
          status: error.status,
          title: error.title,
        },
      }
    }

    return {
      ok: false,
      error: createErrorResponse(
        'BOOK_DETAIL_UPSTREAM_ERROR',
        '도서 상세 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.',
        502,
      ),
    }
  }
}

export const bookDetailRoute: FastifyPluginAsync = async (app) => {
  app.get('/api/books/:isbn13', async (request, reply) => {
    const parsedParams = parseBookDetailParams(request.params)

    if (!parsedParams.ok) {
      reply.status(parsedParams.error.status)

      return parsedParams.error
    }

    const bookDetailPayload = await fetchBookDetailPayload(parsedParams.value.isbn13)

    if (!bookDetailPayload.ok) {
      app.log.warn(
        { errorTitle: bookDetailPayload.error.title },
        'Book detail upstream request failed',
      )

      reply.status(bookDetailPayload.error.status)

      return bookDetailPayload.error
    }

    reply.status(501)

    return createErrorResponse(
      'BOOK_DETAIL_NOT_IMPLEMENTED',
      '도서 상세 엔드포인트 구현이 아직 완료되지 않았습니다.',
      501,
    )
  })
}
