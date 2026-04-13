import type {
  BookDetail,
  BookDetailLoanInfo,
  BookDetailLoanStat,
  BookDetailResponse,
} from '@nearby-library-search/contracts';
import {createRetryableUpstreamResponseError} from '../../../utils/error.js';
import {getBookRecords, getLibraryApiResponseRoot, isLibraryApiRecord} from '../../../libraryApi/parseLibraryApiResponse.js';
import {normalizeHttpUrl, normalizeNullableNumber, normalizeNullableString} from '../../../utils/normalize.js';
import type {Result} from '../../../utils/result.types.js';

function isBookDetailLoanStat(value: BookDetailLoanStat | null): value is BookDetailLoanStat {
  return value !== null;
}

function normalizeBookDetailLoanStat(value: unknown): BookDetailLoanStat | null {
  if (!isLibraryApiRecord(value)) {
    return null;
  }

  const name = normalizeNullableString(value.name);

  if (!name) {
    return null;
  }

  return {
    loanCount: normalizeNullableNumber(value.loanCnt),
    name,
    rank: normalizeNullableNumber(value.ranking),
  };
}

function normalizeBookDetailTotalLoanStat(loanInfoRecords: Array<Record<string, unknown>>) {
  return loanInfoRecords.map(record => normalizeBookDetailLoanStat(record.Total)).find(isBookDetailLoanStat) ?? null;
}

function normalizeBookDetailAgeLoanStats(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(item => {
      if (!isLibraryApiRecord(item)) {
        return null;
      }

      return normalizeBookDetailLoanStat(item.age);
    })
    .filter(isBookDetailLoanStat);
}

function normalizeBookDetailRecord(value: Record<string, unknown>): BookDetail | null {
  const title = normalizeNullableString(value.bookname);
  const author = normalizeNullableString(value.authors);
  const isbn13 = normalizeNullableString(value.isbn13);

  if (!title || !author || !isbn13 || !/^\d{13}$/.test(isbn13)) {
    return null;
  }

  return {
    author,
    className: normalizeNullableString(value.class_nm),
    classNumber: normalizeNullableString(value.class_no),
    description: normalizeNullableString(value.description),
    imageUrl: normalizeHttpUrl(value.bookImageURL),
    isbn: normalizeNullableString(value.isbn),
    isbn13,
    publicationDate: normalizeNullableString(value.publication_date),
    publicationYear: normalizeNullableString(value.publication_year),
    publisher: normalizeNullableString(value.publisher),
    title,
  };
}

function normalizeBookDetailLoanInfo(responseRoot: Record<string, unknown>): BookDetailLoanInfo {
  const loanInfoRecords = Array.isArray(responseRoot.loanInfo) ? responseRoot.loanInfo.filter(isLibraryApiRecord) : [];

  return {
    byAge: loanInfoRecords.flatMap(record => normalizeBookDetailAgeLoanStats(record.ageResult)),
    total: normalizeBookDetailTotalLoanStat(loanInfoRecords),
  };
}

function normalizeBookDetailResponse(payload: unknown): Result<BookDetailResponse> {
  const invalidResponseError = createRetryableUpstreamResponseError('BOOK_DETAIL_RESPONSE_INVALID', '도서 상세');
  const responseRoot = getLibraryApiResponseRoot(payload);

  if (!isLibraryApiRecord(responseRoot) || Object.keys(responseRoot).length === 0) {
    return {
      ok: false,
      error: invalidResponseError,
    };
  }

  const book =
    getBookRecords(responseRoot)
      .map(normalizeBookDetailRecord)
      .find(item => item !== null) ?? null;

  return {
    ok: true,
    value: {
      book,
      loanInfo: normalizeBookDetailLoanInfo(responseRoot),
    },
  };
}

export {normalizeBookDetailResponse};
