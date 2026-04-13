import type {BookSearchItem, BookSearchResponse} from '@nearby-library-search/contracts';
import {createRetryableUpstreamResponseError} from '../../../utils/error.js';
import {getDocRecords, getLibraryApiResponseRoot} from '../../../utils/libraryApiResponse.js';
import {normalizeHttpUrl, normalizeNullableNumber, normalizeNullableString} from '../../../utils/normalize.js';
import type {Result} from '../../../utils/result.types.js';

function isBookSearchItem(item: BookSearchItem | null): item is BookSearchItem {
  return item !== null;
}

function normalizeBookSearchItem(record: Record<string, unknown>): BookSearchItem | null {
  const title = normalizeNullableString(record.bookname);
  const author = normalizeNullableString(record.authors);
  const isbn13 = normalizeNullableString(record.isbn13);

  if (!title || !author || !isbn13 || !/^\d{13}$/.test(isbn13)) {
    return null;
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
  };
}

function normalizeBookSearchResponse(payload: unknown): Result<BookSearchResponse> {
  const invalidResponseError = createRetryableUpstreamResponseError('BOOK_SEARCH_RESPONSE_INVALID', '도서 검색');
  const responseRoot = getLibraryApiResponseRoot(payload);
  const totalCount = normalizeNullableNumber(responseRoot.numFound);

  if (totalCount === null) {
    return {
      ok: false,
      error: invalidResponseError,
    };
  }

  if (totalCount === 0) {
    return {
      ok: true,
      value: {
        items: [],
        totalCount: 0,
      },
    };
  }

  const items = getDocRecords(responseRoot).map(normalizeBookSearchItem).filter(isBookSearchItem);

  if (items.length === 0) {
    return {
      ok: false,
      error: invalidResponseError,
    };
  }

  return {
    ok: true,
    value: {
      items,
      totalCount,
    },
  };
}

export {normalizeBookSearchResponse};
