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
import {
  getDocRecords,
  getLibraryApiResponseRoot,
} from '../utils/libraryApiResponse.js'
import {
  isQueryRecord,
  readOptionalScalarStringQuery,
  readPositiveIntegerQuery,
} from '../utils/query.js'
import {
  normalizeHttpUrl,
  normalizeNullableNumber,
  normalizeNullableString,
} from '../utils/normalize.js'

const DEFAULT_PAGE = 1
const DEFAULT_PAGE_SIZE = 10
const MAX_PAGE_SIZE = 20
const MAX_SEARCH_TERM_LENGTH = 100

type BookSearchQuery = {
  author?: string
  isbn13?: string
  page: number
  pageSize: number
  title?: string
}

type Result<T> =
  | {
      ok: true
      value: T
    }
  | {
      ok: false
      error: ErrorResponse
    }

function createErrorResponse(
  title: ErrorResponse['title'],
  detail: string,
  status: number,
): ErrorResponse {
  return {
    detail,
    status,
    title,
  }
}

function parseBookSearchQuery(query: unknown): Result<BookSearchQuery> {
  const queryRecord = isQueryRecord(query) ? query : {}

  const titleResult = readOptionalScalarStringQuery(
    queryRecord,
    'title',
    'BOOK_SEARCH_TITLE_INVALID',
  )

  if (!titleResult.ok) {
    return titleResult
  }

  const authorResult = readOptionalScalarStringQuery(
    queryRecord,
    'author',
    'BOOK_SEARCH_AUTHOR_INVALID',
  )

  if (!authorResult.ok) {
    return authorResult
  }

  const isbn13Result = readOptionalScalarStringQuery(
    queryRecord,
    'isbn13',
    'BOOK_SEARCH_ISBN13_INVALID',
  )

  if (!isbn13Result.ok) {
    return isbn13Result
  }

  const { value: title } = titleResult
  const { value: author } = authorResult
  const { value: isbn13 } = isbn13Result

  if (!title && !author && !isbn13) {
    return {
      ok: false,
      error: createErrorResponse(
        'BOOK_SEARCH_QUERY_MISSING',
        '도서명, 저자명, ISBN13 중 하나는 반드시 입력해야 합니다.',
        400,
      ),
    }
  }

  if (title && title.length > MAX_SEARCH_TERM_LENGTH) {
    return {
      ok: false,
      error: createErrorResponse(
        'BOOK_SEARCH_TITLE_INVALID',
        '도서명은 100자 이하로 입력해야 합니다.',
        400,
      ),
    }
  }

  if (author && author.length > MAX_SEARCH_TERM_LENGTH) {
    return {
      ok: false,
      error: createErrorResponse(
        'BOOK_SEARCH_AUTHOR_INVALID',
        '저자명은 100자 이하로 입력해야 합니다.',
        400,
      ),
    }
  }

  if (isbn13 && !/^\d{13}$/.test(isbn13)) {
    return {
      ok: false,
      error: createErrorResponse(
        'BOOK_SEARCH_ISBN13_INVALID',
        'ISBN13은 13자리 숫자 문자열이어야 합니다.',
        400,
      ),
    }
  }

  const pageResult = readPositiveIntegerQuery({
    fallbackValue: DEFAULT_PAGE,
    invalidDetail: 'page는 1 이상의 정수여야 합니다.',
    invalidTitle: 'BOOK_SEARCH_PAGE_INVALID',
    key: 'page',
    queryRecord,
  })

  if (!pageResult.ok) {
    return pageResult
  }

  const pageSizeResult = readPositiveIntegerQuery({
    fallbackValue: DEFAULT_PAGE_SIZE,
    invalidDetail: `pageSize는 1 이상 ${MAX_PAGE_SIZE} 이하의 정수여야 합니다.`,
    invalidTitle: 'BOOK_SEARCH_PAGE_SIZE_INVALID',
    key: 'pageSize',
    maxValue: MAX_PAGE_SIZE,
    queryRecord,
  })

  if (!pageSizeResult.ok) {
    return pageSizeResult
  }

  return {
    ok: true,
    value: {
      author,
      isbn13,
      page: pageResult.value,
      pageSize: pageSizeResult.value,
      title,
    },
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
