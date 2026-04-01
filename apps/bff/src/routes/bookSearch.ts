import {
  LibraryApiRequestConfigError,
  requestLibraryApi,
} from '../libraryApi/requestLibraryApi.js'
import type { FastifyPluginAsync } from 'fastify'
import {
  parseBookSearchQuery,
} from './bookSearchQuery.js'
import {
  normalizeBookSearchResponse,
} from './bookSearchResponse.js'
import type { BookSearchQuery } from './bookSearchQuery.js'

type ErrorResponse = {
  detail: string
  status: number
  title: string
}

type BookSearchPayloadResult =
  | {
      ok: true
      payload: unknown
    }
  | {
      ok: false
      error: ErrorResponse
    }

function createErrorResponse({
  title,
  detail,
  status,
}: ErrorResponse): ErrorResponse {
  return {
    detail,
    status,
    title,
  }
}

function createBookSearchUpstreamErrorResponse() {
  return createErrorResponse({
    detail: '도서 검색 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.',
    status: 502,
    title: 'BOOK_SEARCH_UPSTREAM_ERROR',
  })
}

async function fetchBookSearchPayload(
  query: BookSearchQuery,
): Promise<BookSearchPayloadResult> {
  try {
    const response = await requestLibraryApi({
      endpoint: '/srchBooks',
      queryParams: {
        author: query.author,
        isbn13: query.isbn13,
        pageNo: query.page,
        pageSize: query.pageSize,
        title: query.title,
      },
    })

    if (!response.ok) {
      return {
        ok: false,
        error: createBookSearchUpstreamErrorResponse(),
      }
    }

    return {
      ok: true,
      payload: await response.json(),
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
      error: createBookSearchUpstreamErrorResponse(),
    }
  }
}

export const bookSearchRoute: FastifyPluginAsync = async (app) => {
  app.get('/api/books/search', async (request, reply) => {
    const parsedQuery = parseBookSearchQuery(request.query)

    if (!parsedQuery.ok) {
      reply.status(parsedQuery.error.status)

      return parsedQuery.error
    }

    const bookSearchPayload = await fetchBookSearchPayload(parsedQuery.value)

    if (!bookSearchPayload.ok) {
      app.log.warn(
        { errorTitle: bookSearchPayload.error.title },
        'Book search upstream request failed',
      )

      reply.status(bookSearchPayload.error.status)

      return bookSearchPayload.error
    }

    const normalizedBookSearchResponse = normalizeBookSearchResponse(
      bookSearchPayload.payload,
    )

    if (!normalizedBookSearchResponse.ok) {
      app.log.warn(
        { errorTitle: normalizedBookSearchResponse.error.title },
        'Book search upstream response could not be normalized',
      )

      reply.status(normalizedBookSearchResponse.error.status)

      return normalizedBookSearchResponse.error
    }

    return normalizedBookSearchResponse.value
  })
}
