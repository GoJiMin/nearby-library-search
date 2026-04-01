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

type ErrorResponse = {
  detail: string
  status: number
  title: string
}

type BookSearchQueryParseResult =
  | {
      ok: true
      value: BookSearchQuery
    }
  | {
      ok: false
      error: ErrorResponse
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

function isQueryRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readOptionalScalarStringQuery(
  queryRecord: Record<string, unknown>,
  key: string,
  invalidTitle: string,
) {
  if (!(key in queryRecord)) {
    return {
      ok: true as const,
      value: undefined,
    }
  }

  const value = queryRecord[key]

  if (typeof value !== 'string') {
    return {
      ok: false as const,
      error: createErrorResponse({
        detail: `${key}은(는) 하나의 문자열 값만 허용합니다.`,
        status: 400,
        title: invalidTitle,
      }),
    }
  }

  const normalizedValue = value.trim()

  return {
    ok: true as const,
    value: normalizedValue.length > 0 ? normalizedValue : undefined,
  }
}

function readPositiveIntegerQuery({
  queryRecord,
  key,
  fallbackValue,
  invalidDetail,
  invalidTitle,
  maxValue,
}: {
  fallbackValue: number
  invalidDetail: string
  invalidTitle: string
  key: string
  maxValue?: number
  queryRecord: Record<string, unknown>
}) {
  const valueResult = readOptionalScalarStringQuery(
    queryRecord,
    key,
    invalidTitle,
  )

  if (!valueResult.ok) {
    return valueResult
  }

  if (!valueResult.value) {
    return {
      ok: true as const,
      value: fallbackValue,
    }
  }

  const parsedValue = Number(valueResult.value)

  if (!Number.isInteger(parsedValue) || parsedValue < 1) {
    return {
      ok: false as const,
      error: createErrorResponse({
        detail: invalidDetail,
        status: 400,
        title: invalidTitle,
      }),
    }
  }

  if (typeof maxValue === 'number' && parsedValue > maxValue) {
    return {
      ok: false as const,
      error: createErrorResponse({
        detail: invalidDetail,
        status: 400,
        title: invalidTitle,
      }),
    }
  }

  return {
    ok: true as const,
    value: parsedValue,
  }
}

function parseBookSearchQuery(query: unknown): BookSearchQueryParseResult {
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

  const title = titleResult.value
  const author = authorResult.value
  const isbn13 = isbn13Result.value

  if (!title && !author && !isbn13) {
    return {
      ok: false,
      error: createErrorResponse({
        detail: '도서명, 저자명, ISBN13 중 하나는 반드시 입력해야 합니다.',
        status: 400,
        title: 'BOOK_SEARCH_QUERY_MISSING',
      }),
    }
  }

  if (title && title.length > MAX_SEARCH_TERM_LENGTH) {
    return {
      ok: false,
      error: createErrorResponse({
        detail: '도서명은 100자 이하로 입력해야 합니다.',
        status: 400,
        title: 'BOOK_SEARCH_TITLE_INVALID',
      }),
    }
  }

  if (author && author.length > MAX_SEARCH_TERM_LENGTH) {
    return {
      ok: false,
      error: createErrorResponse({
        detail: '저자명은 100자 이하로 입력해야 합니다.',
        status: 400,
        title: 'BOOK_SEARCH_AUTHOR_INVALID',
      }),
    }
  }

  if (isbn13 && !/^\d{13}$/.test(isbn13)) {
    return {
      ok: false,
      error: createErrorResponse({
        detail: 'ISBN13은 13자리 숫자 문자열이어야 합니다.',
        status: 400,
        title: 'BOOK_SEARCH_ISBN13_INVALID',
      }),
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
