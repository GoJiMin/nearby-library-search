import type {LibraryAvailabilityResponse, LibrarySearchResponse} from '@nearby-library-search/contracts';
import {requestGet} from '@/shared/request';
import {LIBRARY_SEARCH_PAGE_SIZE, type LibraryAvailabilityParams, type LibrarySearchParams} from '../model/librarySchema';

async function getLibraries({detailRegion, isbn, page, region}: LibrarySearchParams) {
  return requestGet<LibrarySearchResponse>({
    endpoint: '/api/libraries/search',
    queryParams: {
      detailRegion,
      isbn,
      page,
      pageSize: LIBRARY_SEARCH_PAGE_SIZE,
      region,
    },
  });
}

async function getLibraryAvailability({libraryCode, isbn13}: LibraryAvailabilityParams) {
  return requestGet<LibraryAvailabilityResponse>({
    endpoint: `/api/libraries/${libraryCode}/books/${isbn13}/availability`,
  });
}

export {getLibraries, getLibraryAvailability};
