import type {ErrorResponse, LibrarySearchResponse} from '@nearby-library-search/contracts';
import {z} from 'zod';
import type {LibrarySearchQuery} from '../schemas/library.js';
import {createRetryableUpstreamResponseError} from '../utils/error.js';
import {librarySearchFixtureItems} from './librarySearchFixture.data.js';

type Result<T> =
  | {
      ok: true;
      value: T;
    }
  | {
      ok: false;
      error: ErrorResponse;
    };

type LibrarySearchFixtureResolverOptions = {
  createResponse?: (query: LibrarySearchQuery) => unknown;
};

const librarySearchFixtureItemSchema = z.object({
  address: z.string().nullable(),
  closedDays: z.string().nullable(),
  code: z.string(),
  fax: z.string().nullable(),
  homepage: z.string().nullable(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  name: z.string(),
  operatingTime: z.string().nullable(),
  phone: z.string().nullable(),
});

const librarySearchFixtureResponseSchema = z.object({
  detailRegion: z.string().regex(/^\d{5}$/).optional(),
  isbn: z.string().regex(/^\d{13}$/),
  items: z.array(librarySearchFixtureItemSchema),
  page: z.number().int().positive().nullable(),
  pageSize: z.number().int().positive().nullable(),
  region: z.string().regex(/^\d{2}$/),
  resultCount: z.number().int().nonnegative(),
  totalCount: z.number().int().nonnegative(),
});

function matchesLibrarySearchFixtureItem(
  item: (typeof librarySearchFixtureItems)[number],
  query: LibrarySearchQuery,
) {
  if (item.isbn !== query.isbn || item.region !== query.region) {
    return false;
  }

  if (query.detailRegion) {
    return item.detailRegion === query.detailRegion;
  }

  return true;
}

function createLibrarySearchFixtureResponse(query: LibrarySearchQuery): LibrarySearchResponse {
  const filteredItems = librarySearchFixtureItems.filter(item => matchesLibrarySearchFixtureItem(item, query));
  const startIndex = (query.page - 1) * query.pageSize;
  const endIndex = startIndex + query.pageSize;
  const pagedItems = filteredItems.slice(startIndex, endIndex).map(({detailRegion, isbn, region, ...item}) => item);

  return {
    detailRegion: query.detailRegion,
    isbn: query.isbn,
    items: pagedItems,
    page: query.page,
    pageSize: query.pageSize,
    region: query.region,
    resultCount: pagedItems.length,
    totalCount: filteredItems.length,
  };
}

function resolveLibrarySearchFixtureResult(
  query: LibrarySearchQuery,
  options: LibrarySearchFixtureResolverOptions = {},
): Result<LibrarySearchResponse> {
  const createResponse = options.createResponse ?? createLibrarySearchFixtureResponse;

  try {
    const response = createResponse(query);
    const parsedResponse = librarySearchFixtureResponseSchema.safeParse(response);

    if (!parsedResponse.success) {
      return {
        ok: false,
        error: createRetryableUpstreamResponseError('LIBRARY_SEARCH_RESPONSE_INVALID', '도서관 조회'),
      };
    }

    return {
      ok: true,
      value: parsedResponse.data,
    };
  } catch {
    return {
      ok: false,
      error: createRetryableUpstreamResponseError('LIBRARY_SEARCH_RESPONSE_INVALID', '도서관 조회'),
    };
  }
}

export {resolveLibrarySearchFixtureResult};
