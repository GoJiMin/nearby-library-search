import type {ErrorResponse, LibrarySearchItem, LibrarySearchResponse} from '@nearby-library-search/contracts';
import type {FastifyPluginAsync} from 'fastify';
import type {ZodError} from 'zod';
import {requestLibraryApi} from '../libraryApi/requestLibraryApi.js';
import {librarySearchQuerySchema} from '../schemas/library.js';
import type {LibrarySearchQuery} from '../schemas/library.js';
import {
  createErrorResponse,
  createRetryableUpstreamRequestError,
  createRetryableUpstreamResponseError,
  toLibraryApiErrorResponse,
} from '../utils/error.js';
import {getLibraryApiResponseRoot, getLibraryRecords, isLibraryApiRecord} from '../utils/libraryApiResponse.js';
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

function getLibrarySearchQueryError(error: ZodError): ErrorResponse {
  const [firstIssue] = error.issues;
  const [issuePath] = firstIssue?.path ?? [];

  switch (issuePath) {
    case 'isbn':
      return createErrorResponse('LIBRARY_SEARCH_ISBN_INVALID', 'isbn은 13자리 숫자 문자열이어야 합니다.', 400);
    case 'region':
      return createErrorResponse('LIBRARY_SEARCH_REGION_INVALID', 'region은 2자리 숫자 문자열이어야 합니다.', 400);
    case 'detailRegion':
      return createErrorResponse(
        'LIBRARY_SEARCH_DETAIL_REGION_INVALID',
        'detailRegion은 region에 속하는 5자리 숫자 문자열이어야 합니다.',
        400,
      );
    case 'page':
      return createErrorResponse('LIBRARY_SEARCH_PAGE_INVALID', 'page는 1 이상의 정수여야 합니다.', 400);
    case 'pageSize':
      return createErrorResponse(
        'LIBRARY_SEARCH_PAGE_SIZE_INVALID',
        'pageSize는 1 이상 20 이하의 정수여야 합니다.',
        400,
      );
    default:
      return createErrorResponse(
        'LIBRARY_SEARCH_QUERY_INVALID',
        '도서관 조회 요청이 올바르지 않습니다. 다시 확인해주세요.',
        400,
      );
  }
}

function parseLibrarySearchQuery(query: unknown): Result<LibrarySearchQuery> {
  const result = librarySearchQuerySchema.safeParse(query);

  if (result.success) {
    return {
      ok: true,
      value: result.data,
    };
  }

  return {
    ok: false,
    error: getLibrarySearchQueryError(result.error),
  };
}

async function fetchLibrarySearchPayload(query: LibrarySearchQuery): Promise<Result<unknown>> {
  const upstreamError = createRetryableUpstreamRequestError('LIBRARY_SEARCH_UPSTREAM_ERROR', '도서관 조회');

  try {
    const response = await requestLibraryApi({
      endpoint: '/libSrchByBook',
      queryParams: {
        dtl_region: query.detailRegion,
        isbn: query.isbn,
        pageNo: query.page,
        pageSize: query.pageSize,
        region: query.region,
      },
      requiredQueryParams: ['isbn', 'region'],
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

function isLibrarySearchItem(item: LibrarySearchItem | null): item is LibrarySearchItem {
  return item !== null;
}

function normalizeCoordinate(value: unknown, minimum: number, maximum: number) {
  const normalizedValue = normalizeNullableNumber(value);

  if (normalizedValue === null) {
    return null;
  }

  return normalizedValue >= minimum && normalizedValue <= maximum ? normalizedValue : null;
}

function normalizeLibrarySearchItem(record: Record<string, unknown>): LibrarySearchItem | null {
  const code = normalizeNullableString(record.libCode);
  const name = normalizeNullableString(record.libName);

  if (!code || !name) {
    return null;
  }

  return {
    address: normalizeNullableString(record.address),
    closedDays: normalizeNullableString(record.closed),
    code,
    fax: normalizeNullableString(record.fax),
    homepage: normalizeHttpUrl(record.homepage),
    latitude: normalizeCoordinate(record.latitude, -90, 90),
    longitude: normalizeCoordinate(record.longitude, -180, 180),
    name,
    operatingTime: normalizeNullableString(record.operatingTime),
    phone: normalizeNullableString(record.tel),
  };
}

function normalizeLibrarySearchResponse(payload: unknown, query: LibrarySearchQuery): Result<LibrarySearchResponse> {
  const invalidResponseError = createRetryableUpstreamResponseError('LIBRARY_SEARCH_RESPONSE_INVALID', '도서관 조회');
  const responseRoot = getLibraryApiResponseRoot(payload);

  if (!isLibraryApiRecord(responseRoot) || Object.keys(responseRoot).length === 0) {
    return {
      ok: false,
      error: invalidResponseError,
    };
  }

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
        detailRegion: query.detailRegion,
        isbn: query.isbn,
        items: [],
        page: normalizeNullableNumber(responseRoot.pageNo) ?? query.page,
        pageSize: normalizeNullableNumber(responseRoot.pageSize) ?? query.pageSize,
        region: query.region,
        resultCount: 0,
        totalCount: 0,
      },
    };
  }

  const items = getLibraryRecords(responseRoot).map(normalizeLibrarySearchItem).filter(isLibrarySearchItem);

  if (items.length === 0) {
    return {
      ok: false,
      error: invalidResponseError,
    };
  }

  return {
    ok: true,
    value: {
      detailRegion: query.detailRegion,
      isbn: query.isbn,
      items,
      page: normalizeNullableNumber(responseRoot.pageNo) ?? query.page,
      pageSize: normalizeNullableNumber(responseRoot.pageSize) ?? query.pageSize,
      region: query.region,
      resultCount: normalizeNullableNumber(responseRoot.resultNum) ?? items.length,
      totalCount,
    },
  };
}

export const librarySearchRoute: FastifyPluginAsync = async app => {
  app.get('/api/libraries/search', async (request, reply) => {
    const parsedQuery = parseLibrarySearchQuery(request.query);

    if (!parsedQuery.ok) {
      reply.status(parsedQuery.error.status);

      return parsedQuery.error;
    }

    const librarySearchPayload = await fetchLibrarySearchPayload(parsedQuery.value);

    if (!librarySearchPayload.ok) {
      app.log.warn({errorTitle: librarySearchPayload.error.title}, 'Library search upstream request failed');

      reply.status(librarySearchPayload.error.status);

      return librarySearchPayload.error;
    }

    const normalizedLibrarySearchResponse = normalizeLibrarySearchResponse(
      librarySearchPayload.value,
      parsedQuery.value,
    );

    if (!normalizedLibrarySearchResponse.ok) {
      app.log.warn(
        {errorTitle: normalizedLibrarySearchResponse.error.title},
        'Library search upstream response could not be normalized',
      );

      reply.status(normalizedLibrarySearchResponse.error.status);

      return normalizedLibrarySearchResponse.error;
    }

    return normalizedLibrarySearchResponse.value;
  });
};
