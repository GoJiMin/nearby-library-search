import {
  getDocRecords,
  getLibraryApiResponseRoot,
  normalizeNullableNumber,
  normalizeNullableString,
} from '../libraryApi/parseLibraryApiResponse.js'
import {
  LibraryApiRequestConfigError,
  requestLibraryApi,
} from '../libraryApi/requestLibraryApi.js'
import type { FastifyPluginAsync } from 'fastify'
import {
  parseBookSearchQuery,
} from './bookSearchQuery.js'
import type { BookSearchQuery } from './bookSearchQuery.js'

type ErrorResponse = {
  detail: string
  status: number
  title: string
}

type BookSearchItem = {
  author: string
  detailUrl: string | null
  imageUrl: string | null
  isbn13: string
  loanCount: number | null
  publicationYear: string | null
  publisher: string | null
  title: string
}

type BookSearchResponse = {
  items: BookSearchItem[]
  totalCount: number
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

type BookSearchResponseResult =
  | {
      ok: true
      value: BookSearchResponse
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

function createBookSearchResponseInvalidError() {
  return createErrorResponse({
    detail: '도서 검색 응답을 처리하는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
    status: 502,
    title: 'BOOK_SEARCH_RESPONSE_INVALID',
  })
}

function normalizeHttpUrl(value: unknown) {
  const normalizedValue = normalizeNullableString(value)

  if (!normalizedValue) {
    return null
  }

  try {
    const url = new URL(normalizedValue)

    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return null
    }

    return url.toString()
  } catch {
    return null
  }
}

function normalizeBookSearchItem(record: Record<string, unknown>) {
  const title = normalizeNullableString(record.bookname)
  const author = normalizeNullableString(record.authors)
  const isbn13 = normalizeNullableString(record.isbn13)

  if (!title || !author || !isbn13 || !/^\d{13}$/.test(isbn13)) {
    return null
  }

  return {
    author,
    detailUrl: normalizeHttpUrl(record.bookDtlUrl),
    imageUrl: normalizeHttpUrl(record.bookImageURL),
    isbn13,
    loanCount: normalizeNullableNumber(record.loan_count),
    publicationYear: normalizeNullableString(record.publication_year),
    publisher: normalizeNullableString(record.publisher),
    title,
  }
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

function normalizeBookSearchResponse(
  payload: unknown,
): BookSearchResponseResult {
  const responseRoot = getLibraryApiResponseRoot(payload)
  const totalCount = normalizeNullableNumber(responseRoot.numFound)

  if (totalCount === null) {
    return {
      ok: false,
      error: createBookSearchResponseInvalidError(),
    }
  }

  if (totalCount === 0) {
    return {
      ok: true,
      value: {
        items: [],
        totalCount: 0,
      },
    }
  }

  const items = getDocRecords(responseRoot)
    .map(normalizeBookSearchItem)
    .flatMap((item) => (item ? [item] : []))

  if (items.length === 0) {
    return {
      ok: false,
      error: createBookSearchResponseInvalidError(),
    }
  }

  return {
    ok: true,
    value: {
      items,
      totalCount,
    },
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
