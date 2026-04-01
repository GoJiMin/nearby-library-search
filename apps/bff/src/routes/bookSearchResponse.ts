import {
  getDocRecords,
  getLibraryApiResponseRoot,
} from '../utils/libraryApiResponse.js'
import {
  normalizeHttpUrl,
  normalizeNullableNumber,
  normalizeNullableString,
} from '../utils/normalize.js'

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

type BookSearchResponseResult =
  | {
      ok: true
      value: BookSearchResponse
    }
  | {
      ok: false
      error: ErrorResponse
    }

function createBookSearchResponseInvalidError() {
  return {
    detail: '도서 검색 응답을 처리하는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
    status: 502,
    title: 'BOOK_SEARCH_RESPONSE_INVALID',
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

export { normalizeBookSearchResponse }
