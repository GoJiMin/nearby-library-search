import type {LibrarySearchItem, LibrarySearchResponse} from '@nearby-library-search/contracts';

type LibrarySearchItemWithCoordinates = LibrarySearchItem & {
  latitude: number;
  longitude: number;
};

function hasLibraryCoordinates(item: LibrarySearchItem): item is LibrarySearchItemWithCoordinates {
  return item.latitude !== null && item.longitude !== null;
}

function isEmptyLibrarySearchResult(response: LibrarySearchResponse) {
  return response.items.length === 0 && response.resultCount === 0 && response.totalCount === 0;
}

export {hasLibraryCoordinates, isEmptyLibrarySearchResult};
export type {LibrarySearchItemWithCoordinates};
