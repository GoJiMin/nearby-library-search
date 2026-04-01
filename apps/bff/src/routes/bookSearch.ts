import type {
  BookSearchItem,
  BookSearchResponse,
  ErrorResponse,
} from '@nearby-library-search/contracts'
import {
  LibraryApiRequestConfigError,
  requestLibraryApi,
} from '../libraryApi/requestLibraryApi.js'
import type { FastifyPluginAsync } from 'fastify'
import type { ZodError } from 'zod'
import {
  bookSearchQuerySchema,
} from '../schemas/book.js'
import type { BookSearchQuery } from '../schemas/book.js'
import {
  getDocRecords,
  getLibraryApiResponseRoot,
} from '../utils/libraryApiResponse.js'
import { createErrorResponse } from '../utils/error.js'
import {
  normalizeHttpUrl,
  normalizeNullableNumber,
  normalizeNullableString,
} from '../utils/normalize.js'

type Result<T> =
  | {
      ok: true
      value: T
    }
  | {
      ok: false
      error: ErrorResponse
    }

function getBookSearchQueryError(error: ZodError): ErrorResponse {
  const [firstIssue] = error.issues
  const [issuePath] = firstIssue?.path ?? []

  switch (issuePath) {
    case 'title':
      return createErrorResponse(
        'BOOK_SEARCH_TITLE_INVALID',
        '도서명은 100자 이하의 문자열이어야 합니다.',
        400,
      )
    case 'author':
      return createErrorResponse(
        'BOOK_SEARCH_AUTHOR_INVALID',
        '저자명은 100자 이하의 문자열이어야 합니다.',
        400,
      )
    case 'isbn13':
      return createErrorResponse(
        'BOOK_SEARCH_ISBN13_INVALID',
        'ISBN13은 13자리 숫자 문자열이어야 합니다.',
        400,
      )
    case 'page':
      return createErrorResponse(
        'BOOK_SEARCH_PAGE_INVALID',
        'page는 1 이상의 정수여야 합니다.',
        400,
      )
    case 'pageSize':
      return createErrorResponse(
        'BOOK_SEARCH_PAGE_SIZE_INVALID',
        'pageSize는 1 이상 20 이하의 정수여야 합니다.',
        400,
      )
    case 'query':
      return createErrorResponse(
        'BOOK_SEARCH_QUERY_MISSING',
        '도서명, 저자명, ISBN13 중 하나는 반드시 입력해야 합니다.',
        400,
      )
    default:
      return createErrorResponse(
        'BOOK_SEARCH_QUERY_INVALID',
        '도서 검색 요청이 올바르지 않습니다. 다시 확인해주세요.',
        400,
      )
  }
}

function parseBookSearchQuery(query: unknown): Result<BookSearchQuery> {
  const result = bookSearchQuerySchema.safeParse(query)

  if (result.success) {
    return {
      ok: true,
      value: result.data,
    }
  }

  return {
    ok: false,
    error: getBookSearchQueryError(result.error),
  }
}

async function fetchBookSearchPayload(
  query: BookSearchQuery,
): Promise<Result<unknown>> {
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
        error: createErrorResponse(
          'BOOK_SEARCH_UPSTREAM_ERROR',
          '도서 검색 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.',
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
        'BOOK_SEARCH_UPSTREAM_ERROR',
        '도서 검색 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.',
        502,
      ),
    }
  }
}

function isBookSearchItem(
  item: BookSearchItem | null,
): item is BookSearchItem {
  return item !== null
}

function normalizeBookSearchItem(
  record: Record<string, unknown>,
): BookSearchItem | null {
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

function normalizeBookSearchResponse(
  payload: unknown,
): Result<BookSearchResponse> {
  const responseRoot = getLibraryApiResponseRoot(payload)
  const totalCount = normalizeNullableNumber(responseRoot.numFound)

  if (totalCount === null) {
    return {
      ok: false,
      error: createErrorResponse(
        'BOOK_SEARCH_RESPONSE_INVALID',
        '도서 검색 응답을 처리하는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
        502,
      ),
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
    .filter(isBookSearchItem)

  if (items.length === 0) {
    return {
      ok: false,
      error: createErrorResponse(
        'BOOK_SEARCH_RESPONSE_INVALID',
        '도서 검색 응답을 처리하는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
        502,
      ),
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
      bookSearchPayload.value,
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
