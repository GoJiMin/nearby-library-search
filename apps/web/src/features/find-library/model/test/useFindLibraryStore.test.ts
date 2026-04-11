import {beforeEach, describe, expect, it} from 'vitest';
import {useFindLibraryStore} from '../useFindLibraryStore';

const MOCK_BOOK = {
  author: '이민진',
  isbn13: '9788954682155',
  title: '파친코',
} as const;

describe('useFindLibraryStore', () => {
  beforeEach(() => {
    useFindLibraryStore.getState().resetFindLibraryFlow();
  });

  it('도서를 선택하면 region dialog 상태를 연다', () => {
    useFindLibraryStore.getState().openRegionDialog(MOCK_BOOK);

    expect(useFindLibraryStore.getState().regionDialogBook).toEqual(MOCK_BOOK);
  });

  it('region dialog를 닫으면 선택된 도서를 정리한다', () => {
    useFindLibraryStore.getState().openRegionDialog(MOCK_BOOK);

    useFindLibraryStore.getState().closeRegionDialog();

    expect(useFindLibraryStore.getState().regionDialogBook).toBeNull();
  });

  it('지역 선택 완료 시 마지막 선택, library dialog book, page 1 검색 조건을 저장한다', () => {
    useFindLibraryStore.getState().openRegionDialog(MOCK_BOOK);

    useFindLibraryStore.getState().confirmRegion({
      detailRegion: '11140',
      isbn: MOCK_BOOK.isbn13,
      page: 3,
      region: '11',
    });

    expect(useFindLibraryStore.getState().lastRegionSelection).toEqual({
      detailRegion: '11140',
      region: '11',
    });
    expect(useFindLibraryStore.getState().libraryResultBook).toEqual(MOCK_BOOK);
    expect(useFindLibraryStore.getState().regionDialogBook).toBeNull();
    expect(useFindLibraryStore.getState().currentLibrarySearchParams).toEqual({
      detailRegion: '11140',
      isbn: MOCK_BOOK.isbn13,
      page: 1,
      region: '11',
    });
    expect(useFindLibraryStore.getState().selectedLibraryCode).toBeNull();
  });

  it('지역 다시 선택을 누르면 같은 책으로 region dialog로 돌아간다', () => {
    useFindLibraryStore.getState().openRegionDialog(MOCK_BOOK);
    useFindLibraryStore.getState().confirmRegion({
      detailRegion: '11140',
      isbn: MOCK_BOOK.isbn13,
      page: 1,
      region: '11',
    });

    useFindLibraryStore.getState().backToRegionSelect();

    expect(useFindLibraryStore.getState().regionDialogBook).toEqual(MOCK_BOOK);
    expect(useFindLibraryStore.getState().libraryResultBook).toBeNull();
    expect(useFindLibraryStore.getState().currentLibrarySearchParams).toBeNull();
    expect(useFindLibraryStore.getState().selectedLibraryCode).toBeNull();
  });

  it('도서관 결과 페이지를 바꾸면 page만 갱신하고 선택을 초기화한다', () => {
    useFindLibraryStore.getState().openRegionDialog(MOCK_BOOK);
    useFindLibraryStore.getState().confirmRegion({
      detailRegion: '11140',
      isbn: MOCK_BOOK.isbn13,
      page: 1,
      region: '11',
    });
    useFindLibraryStore.getState().selectLibrary('LIB0002');

    useFindLibraryStore.getState().changeLibraryResultPage(2);

    expect(useFindLibraryStore.getState().currentLibrarySearchParams).toEqual({
      detailRegion: '11140',
      isbn: MOCK_BOOK.isbn13,
      page: 2,
      region: '11',
    });
    expect(useFindLibraryStore.getState().selectedLibraryCode).toBeNull();
  });

  it('library result dialog를 닫으면 library 관련 상태만 정리한다', () => {
    useFindLibraryStore.getState().openRegionDialog(MOCK_BOOK);
    useFindLibraryStore.getState().confirmRegion({
      detailRegion: '11140',
      isbn: MOCK_BOOK.isbn13,
      page: 1,
      region: '11',
    });

    useFindLibraryStore.getState().closeLibraryResultDialog();

    expect(useFindLibraryStore.getState().currentLibrarySearchParams).toBeNull();
    expect(useFindLibraryStore.getState().libraryResultBook).toBeNull();
    expect(useFindLibraryStore.getState().selectedLibraryCode).toBeNull();
    expect(useFindLibraryStore.getState().lastRegionSelection).toEqual({
      detailRegion: '11140',
      region: '11',
    });
  });

  it('지역 다시 선택 후 새 confirm은 항상 page 1과 초기 선택 상태로 다시 시작한다', () => {
    useFindLibraryStore.getState().openRegionDialog(MOCK_BOOK);
    useFindLibraryStore.getState().confirmRegion({
      detailRegion: '11140',
      isbn: MOCK_BOOK.isbn13,
      page: 1,
      region: '11',
    });
    useFindLibraryStore.getState().selectLibrary('LIB0002');
    useFindLibraryStore.getState().changeLibraryResultPage(2);

    useFindLibraryStore.getState().backToRegionSelect();
    useFindLibraryStore.getState().confirmRegion({
      isbn: MOCK_BOOK.isbn13,
      page: 9,
      region: '26',
    });

    expect(useFindLibraryStore.getState().currentLibrarySearchParams).toEqual({
      isbn: MOCK_BOOK.isbn13,
      page: 1,
      region: '26',
    });
    expect(useFindLibraryStore.getState().selectedLibraryCode).toBeNull();
    expect(useFindLibraryStore.getState().lastRegionSelection).toEqual({
      detailRegion: undefined,
      region: '26',
    });
  });

  it('resetFindLibraryFlow는 전체 흐름 상태를 초기화한다', () => {
    useFindLibraryStore.getState().openRegionDialog(MOCK_BOOK);
    useFindLibraryStore.getState().confirmRegion({
      detailRegion: '11140',
      isbn: MOCK_BOOK.isbn13,
      page: 1,
      region: '11',
    });
    useFindLibraryStore.getState().selectLibrary('LIB0002');

    useFindLibraryStore.getState().resetFindLibraryFlow();

    expect(useFindLibraryStore.getState().regionDialogBook).toBeNull();
    expect(useFindLibraryStore.getState().libraryResultBook).toBeNull();
    expect(useFindLibraryStore.getState().lastRegionSelection).toBeNull();
    expect(useFindLibraryStore.getState().currentLibrarySearchParams).toBeNull();
    expect(useFindLibraryStore.getState().selectedLibraryCode).toBeNull();
  });
});
