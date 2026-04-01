import {
  isQueryRecord,
  readOptionalScalarStringQuery,
  readPositiveIntegerQuery,
} from '../utils/query.js'

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

export { parseBookSearchQuery }
export type { BookSearchQuery }
