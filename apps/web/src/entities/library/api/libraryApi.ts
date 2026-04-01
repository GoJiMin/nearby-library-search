import type {LibrarySearchResponse} from '@nearby-library-search/contracts';
import {requestGet} from '@/shared/request';
import {LIBRARY_SEARCH_PAGE_SIZE, type LibrarySearchParams} from '../model/librarySchema';

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

export {getLibraries};
