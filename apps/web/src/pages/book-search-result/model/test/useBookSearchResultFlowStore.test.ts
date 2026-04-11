import {beforeEach, describe, expect, it} from 'vitest';
import {useBookSearchResultFlowStore} from '../useBookSearchResultFlowStore';

const MOCK_BOOK = {
  author: '이민진',
  isbn13: '9788954682155',
  title: '파친코',
} as const;

describe('useBookSearchResultFlowStore', () => {
  beforeEach(() => {
    useBookSearchResultFlowStore.getState().resetBookSearchResultFlow();
  });

  it('도서를 선택하면 region dialog 상태를 연다', () => {
    useBookSearchResultFlowStore.getState().openRegionDialog(MOCK_BOOK);

    expect(useBookSearchResultFlowStore.getState().regionDialogBook).toEqual(MOCK_BOOK);
  });

  it('region dialog를 닫으면 선택된 도서를 정리한다', () => {
    useBookSearchResultFlowStore.getState().openRegionDialog(MOCK_BOOK);

    useBookSearchResultFlowStore.getState().closeRegionDialog();

    expect(useBookSearchResultFlowStore.getState().regionDialogBook).toBeNull();
  });

  it('지역 선택 완료 시 마지막 선택, library dialog book, page 1 검색 조건을 저장한다', () => {
    useBookSearchResultFlowStore.getState().openRegionDialog(MOCK_BOOK);

    useBookSearchResultFlowStore.getState().confirmRegion({
      detailRegion: '11140',
      isbn: MOCK_BOOK.isbn13,
      page: 3,
      region: '11',
    });

    expect(useBookSearchResultFlowStore.getState().lastRegionSelection).toEqual({
      detailRegion: '11140',
      region: '11',
    });
    expect(useBookSearchResultFlowStore.getState().libraryResultBook).toEqual(MOCK_BOOK);
    expect(useBookSearchResultFlowStore.getState().regionDialogBook).toBeNull();
    expect(useBookSearchResultFlowStore.getState().currentLibrarySearchParams).toEqual({
      detailRegion: '11140',
      isbn: MOCK_BOOK.isbn13,
      page: 1,
      region: '11',
    });
    expect(useBookSearchResultFlowStore.getState().selectedLibraryCode).toBeNull();
  });

  it('지역 다시 선택을 누르면 같은 책으로 region dialog로 돌아간다', () => {
    useBookSearchResultFlowStore.getState().openRegionDialog(MOCK_BOOK);
    useBookSearchResultFlowStore.getState().confirmRegion({
      detailRegion: '11140',
      isbn: MOCK_BOOK.isbn13,
      page: 1,
      region: '11',
    });

    useBookSearchResultFlowStore.getState().backToRegionSelect();

    expect(useBookSearchResultFlowStore.getState().regionDialogBook).toEqual(MOCK_BOOK);
    expect(useBookSearchResultFlowStore.getState().libraryResultBook).toBeNull();
    expect(useBookSearchResultFlowStore.getState().currentLibrarySearchParams).toBeNull();
    expect(useBookSearchResultFlowStore.getState().selectedLibraryCode).toBeNull();
  });

  it('도서관 결과 페이지를 바꾸면 page만 갱신하고 선택을 초기화한다', () => {
    useBookSearchResultFlowStore.getState().openRegionDialog(MOCK_BOOK);
    useBookSearchResultFlowStore.getState().confirmRegion({
      detailRegion: '11140',
      isbn: MOCK_BOOK.isbn13,
      page: 1,
      region: '11',
    });
    useBookSearchResultFlowStore.getState().selectLibrary('LIB0002');

    useBookSearchResultFlowStore.getState().changeLibraryResultPage(2);

    expect(useBookSearchResultFlowStore.getState().currentLibrarySearchParams).toEqual({
      detailRegion: '11140',
      isbn: MOCK_BOOK.isbn13,
      page: 2,
      region: '11',
    });
    expect(useBookSearchResultFlowStore.getState().selectedLibraryCode).toBeNull();
  });

  it('library result dialog를 닫으면 library 관련 상태만 정리한다', () => {
    useBookSearchResultFlowStore.getState().openRegionDialog(MOCK_BOOK);
    useBookSearchResultFlowStore.getState().confirmRegion({
      detailRegion: '11140',
      isbn: MOCK_BOOK.isbn13,
      page: 1,
      region: '11',
    });

    useBookSearchResultFlowStore.getState().closeLibraryResultDialog();

    expect(useBookSearchResultFlowStore.getState().currentLibrarySearchParams).toBeNull();
    expect(useBookSearchResultFlowStore.getState().libraryResultBook).toBeNull();
    expect(useBookSearchResultFlowStore.getState().selectedLibraryCode).toBeNull();
    expect(useBookSearchResultFlowStore.getState().lastRegionSelection).toEqual({
      detailRegion: '11140',
      region: '11',
    });
  });

  it('resetBookSearchResultFlow는 전체 흐름 상태를 초기화한다', () => {
    useBookSearchResultFlowStore.getState().openRegionDialog(MOCK_BOOK);
    useBookSearchResultFlowStore.getState().confirmRegion({
      detailRegion: '11140',
      isbn: MOCK_BOOK.isbn13,
      page: 1,
      region: '11',
    });
    useBookSearchResultFlowStore.getState().selectLibrary('LIB0002');

    useBookSearchResultFlowStore.getState().resetBookSearchResultFlow();

    expect(useBookSearchResultFlowStore.getState().regionDialogBook).toBeNull();
    expect(useBookSearchResultFlowStore.getState().libraryResultBook).toBeNull();
    expect(useBookSearchResultFlowStore.getState().lastRegionSelection).toBeNull();
    expect(useBookSearchResultFlowStore.getState().currentLibrarySearchParams).toBeNull();
    expect(useBookSearchResultFlowStore.getState().selectedLibraryCode).toBeNull();
  });
});
