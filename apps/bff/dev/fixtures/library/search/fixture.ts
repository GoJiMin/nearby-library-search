import type {LibrarySearchResponse} from '@nearby-library-search/contracts';
import {z} from 'zod';
import type {LibrarySearchQuery} from '../../../../src/routes/library/search/librarySearchQuerySchema.js';
import {createRetryableUpstreamResponseError} from '../../../../src/utils/error.js';
import type {Result} from '../../../../src/utils/result.types.js';
import {librarySearchFixtureLibraries} from './libraries.js';

type LibrarySearchFixtureOptions = {
  createResponse?: (query: LibrarySearchQuery) => unknown;
};

const librarySearchFixtureLibrarySchema = z.object({
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
  items: z.array(librarySearchFixtureLibrarySchema),
  page: z.number().int().positive().nullable(),
  pageSize: z.number().int().positive().nullable(),
  region: z.string().regex(/^\d{2}$/),
  resultCount: z.number().int().nonnegative(),
  totalCount: z.number().int().nonnegative(),
});

function matchesLibrarySearchFixtureLibrary(
  library: (typeof librarySearchFixtureLibraries)[number],
  query: LibrarySearchQuery,
) {
  if (library.isbn !== query.isbn || library.region !== query.region) {
    return false;
  }

  if (query.detailRegion) {
    return library.detailRegion === query.detailRegion;
  }

  return true;
}

function createLibrarySearchFixtureResponse(query: LibrarySearchQuery): LibrarySearchResponse {
  const filteredLibraries = librarySearchFixtureLibraries.filter(library =>
    matchesLibrarySearchFixtureLibrary(library, query),
  );
  const startIndex = (query.page - 1) * query.pageSize;
  const endIndex = startIndex + query.pageSize;
  const pagedLibraries = filteredLibraries
    .slice(startIndex, endIndex)
    .map(({detailRegion, isbn, region, ...library}) => library);

  return {
    detailRegion: query.detailRegion,
    isbn: query.isbn,
    items: pagedLibraries,
    page: query.page,
    pageSize: query.pageSize,
    region: query.region,
    resultCount: pagedLibraries.length,
    totalCount: filteredLibraries.length,
  };
}

function getLibrarySearchFixtureResult(
  query: LibrarySearchQuery,
  options: LibrarySearchFixtureOptions = {},
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

export {getLibrarySearchFixtureResult};
