import type {LibrarySearchResponse} from '@nearby-library-search/contracts';
import type {LibrarySearchQuery} from '../schemas/library.js';
import {librarySearchFixtureItems} from './librarySearchFixture.data.js';

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

export {createLibrarySearchFixtureResponse};
