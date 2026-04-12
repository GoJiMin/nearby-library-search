import type {
  BookDetail,
  BookDetailLoanInfo,
  BookDetailLoanStat,
  BookDetailResponse,
  ErrorResponse,
} from '@nearby-library-search/contracts';
import {requestLibraryApi} from '../libraryApi/requestLibraryApi.js';
import type {FastifyPluginAsync} from 'fastify';
import type {ZodError} from 'zod';
import {bookDetailParamsSchema} from '../schemas/book.js';
import {
  createErrorResponse,
  createRetryableUpstreamRequestError,
  createRetryableUpstreamResponseError,
  toLibraryApiErrorResponse,
} from '../utils/error.js';
import {getBookRecords, getLibraryApiResponseRoot, isLibraryApiRecord} from '../utils/libraryApiResponse.js';
import {normalizeHttpUrl, normalizeNullableNumber, normalizeNullableString} from '../utils/normalize.js';

type Result<T> =
  | {
      ok: true;
      value: T;
    }
  | {
      ok: false;
      error: ErrorResponse;
    };

function getBookDetailParamsError(error: ZodError): ErrorResponse {
  const [firstIssue] = error.issues;

  if (firstIssue?.path[0] === 'isbn13') {
    return createErrorResponse('BOOK_DETAIL_ISBN13_INVALID', 'isbn13은 13자리 숫자 문자열이어야 합니다.', 400);
  }

  return createErrorResponse('BOOK_DETAIL_PARAMS_INVALID', '도서 상세 요청 경로가 올바르지 않습니다.', 400);
}

function parseBookDetailParams(params: unknown): Result<{isbn13: string}> {
  const result = bookDetailParamsSchema.safeParse(params);

  if (result.success) {
    return {
      ok: true,
      value: result.data,
    };
  }

  return {
    ok: false,
    error: getBookDetailParamsError(result.error),
  };
}

async function fetchBookDetailPayload(isbn13: string): Promise<Result<unknown>> {
  const upstreamError = createRetryableUpstreamRequestError('BOOK_DETAIL_UPSTREAM_ERROR', '도서 상세');

  try {
    const response = await requestLibraryApi({
      endpoint: '/srchDtlList',
      queryParams: {
        isbn13,
        loaninfoYN: 'Y',
      },
      requiredQueryParams: ['isbn13'],
    });

    if (!response.ok) {
      return {
        ok: false,
        error: upstreamError,
      };
    }

    return {
      ok: true,
      value: await response.json(),
    };
  } catch (error) {
    return {
      ok: false,
      error: toLibraryApiErrorResponse(error, upstreamError),
    };
  }
}

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

function normalizeBookDetailLoanStats(value: unknown, key: 'age' | 'gender' | 'region') {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(item => {
      if (!isLibraryApiRecord(item)) {
        return null;
      }

      return normalizeBookDetailLoanStat(item[key]);
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
    byAge: loanInfoRecords.flatMap(record => normalizeBookDetailLoanStats(record.ageResult, 'age')),
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

  return {
    ok: true,
    value: {
      book:
        getBookRecords(responseRoot)
          .map(normalizeBookDetailRecord)
          .find(item => item !== null) ?? null,
      loanInfo: normalizeBookDetailLoanInfo(responseRoot),
    },
  };
}

export const bookDetailRoute: FastifyPluginAsync = async app => {
  app.get('/api/books/:isbn13', async (request, reply) => {
    const parsedParams = parseBookDetailParams(request.params);

    if (!parsedParams.ok) {
      reply.status(parsedParams.error.status);

      return parsedParams.error;
    }

    const bookDetailPayload = await fetchBookDetailPayload(parsedParams.value.isbn13);

    if (!bookDetailPayload.ok) {
      app.log.warn({errorTitle: bookDetailPayload.error.title}, 'Book detail upstream request failed');

      reply.status(bookDetailPayload.error.status);

      return bookDetailPayload.error;
    }

    const normalizedBookDetailResponse = normalizeBookDetailResponse(bookDetailPayload.value);

    if (!normalizedBookDetailResponse.ok) {
      app.log.warn(
        {errorTitle: normalizedBookDetailResponse.error.title},
        'Book detail upstream response could not be normalized',
      );

      reply.status(normalizedBookDetailResponse.error.status);

      return normalizedBookDetailResponse.error;
    }

    return normalizedBookDetailResponse.value;
  });
};
