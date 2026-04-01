import type {LibrarySearchItem, LibrarySearchResponse} from '@nearby-library-search/contracts';
import {describe, expect, it} from 'vitest';
import {hasLibraryCoordinates, isEmptyLibrarySearchResult} from '@/entities/library';

const librarySearchItem: LibrarySearchItem = {
  address: '서울시 종로구',
  closedDays: null,
  code: '111007' as const,
  fax: null,
  homepage: null,
  latitude: 37.57295,
  longitude: 126.97936,
  name: '종로도서관',
  operatingTime: null,
  phone: null,
};

const librarySearchResponse: LibrarySearchResponse = {
  detailRegion: '11010',
  isbn: '9791190157551',
  items: [],
  page: 1,
  pageSize: 10,
  region: '11',
  resultCount: 0,
  totalCount: 0,
};

describe('entities/library', () => {
  it('hasLibraryCoordinates는 위도와 경도가 모두 있을 때만 true를 반환한다', () => {
    expect(hasLibraryCoordinates(librarySearchItem)).toBe(true);
    expect(
      hasLibraryCoordinates({
        ...librarySearchItem,
        latitude: null,
      }),
    ).toBe(false);
    expect(
      hasLibraryCoordinates({
        ...librarySearchItem,
        longitude: null,
      }),
    ).toBe(false);
  });

  it('isEmptyLibrarySearchResult는 완전히 빈 결과만 true를 반환한다', () => {
    expect(isEmptyLibrarySearchResult(librarySearchResponse)).toBe(true);
    expect(
      isEmptyLibrarySearchResult({
        ...librarySearchResponse,
        items: [librarySearchItem],
        resultCount: 1,
        totalCount: 1,
      }),
    ).toBe(false);
    expect(
      isEmptyLibrarySearchResult({
        ...librarySearchResponse,
        totalCount: 1,
      }),
    ).toBe(false);
  });
});
