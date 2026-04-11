import {act, renderHook} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {useBookSearchResultPage} from '../useBookSearchResultPage';
import {useBookSearchResultFlowStore} from '../useBookSearchResultFlowStore';

describe('useBookSearchResultPage', () => {
  beforeEach(() => {
    useBookSearchResultFlowStore.getState().resetBookSearchResultFlow();
  });

  it('현재 검색 모드를 유지한 채 page href를 만든다', () => {
    const navigate = vi.fn();
    const {result} = renderHook(() =>
      useBookSearchResultPage({
        navigate,
        params: {
          page: 2,
          title: '파친코',
        },
      }),
    );

    expect(result.current.createPageHref(3)).toBe('/books?page=3&title=%ED%8C%8C%EC%B9%9C%EC%BD%94');
  });

  it('도서를 선택하면 selectedBook을 저장하고 dialog를 연다', () => {
    const navigate = vi.fn();
    const {result} = renderHook(() =>
      useBookSearchResultPage({
        navigate,
        params: {
          page: 1,
          title: '파친코',
        },
      }),
    );

    act(() => {
      result.current.handleSelectBook({
        author: '이민진',
        isbn13: '9788954682155',
        title: '파친코',
      });
    });

    expect(result.current.selectedBook).toEqual({
      author: '이민진',
      isbn13: '9788954682155',
      title: '파친코',
    });
    expect(result.current.isRegionDialogOpen).toBe(true);
  });

  it('dialog를 닫으면 선택된 도서와 open 상태를 함께 정리한다', () => {
    const navigate = vi.fn();
    const {result} = renderHook(() =>
      useBookSearchResultPage({
        navigate,
        params: {
          page: 1,
          title: '파친코',
        },
      }),
    );

    act(() => {
      result.current.handleSelectBook({
        author: '이민진',
        isbn13: '9788954682155',
        title: '파친코',
      });
    });

    act(() => {
      result.current.handleRegionDialogOpenChange(false);
    });

    expect(result.current.selectedBook).toBeNull();
    expect(result.current.isRegionDialogOpen).toBe(false);
  });

  it('선택 완료 시 마지막 확정 지역 선택을 저장하고 dialog를 닫는다', () => {
    const navigate = vi.fn();
    const {result} = renderHook(() =>
      useBookSearchResultPage({
        navigate,
        params: {
          page: 1,
          title: '파친코',
        },
      }),
    );

    act(() => {
      result.current.handleSelectBook({
        author: '이민진',
        isbn13: '9788954682155',
        title: '파친코',
      });
    });

    act(() => {
      result.current.handleConfirmRegion({
        detailRegion: '11140',
        isbn: '9788954682155',
        page: 1,
        region: '11',
      });
    });

    expect(result.current.lastRegionSelection).toEqual({
      detailRegion: '11140',
      region: '11',
    });
    expect(result.current.selectedBook).toBeNull();
    expect(result.current.isRegionDialogOpen).toBe(false);
    expect(result.current.libraryResultBook).toEqual({
      author: '이민진',
      isbn13: '9788954682155',
      title: '파친코',
    });
    expect(result.current.currentLibrarySearchParams).toEqual({
      detailRegion: '11140',
      isbn: '9788954682155',
      page: 1,
      region: '11',
    });
    expect(result.current.isLibraryResultDialogOpen).toBe(true);
    expect(result.current.selectedLibraryCode).toBeNull();
  });

  it('library result dialog를 닫으면 library dialog 상태만 정리한다', () => {
    const navigate = vi.fn();
    const {result} = renderHook(() =>
      useBookSearchResultPage({
        navigate,
        params: {
          page: 1,
          title: '파친코',
        },
      }),
    );

    act(() => {
      result.current.handleSelectBook({
        author: '이민진',
        isbn13: '9788954682155',
        title: '파친코',
      });
    });

    act(() => {
      result.current.handleConfirmRegion({
        detailRegion: '11140',
        isbn: '9788954682155',
        page: 3,
        region: '11',
      });
    });

    act(() => {
      result.current.handleLibraryResultDialogOpenChange(false);
    });

    expect(result.current.isLibraryResultDialogOpen).toBe(false);
    expect(result.current.currentLibrarySearchParams).toBeNull();
    expect(result.current.libraryResultBook).toBeNull();
    expect(result.current.selectedLibraryCode).toBeNull();
    expect(result.current.lastRegionSelection).toEqual({
      detailRegion: '11140',
      region: '11',
    });
  });

  it('library result dialog에서 지역 다시 선택을 누르면 같은 책으로 region dialog를 다시 연다', () => {
    const navigate = vi.fn();
    const {result} = renderHook(() =>
      useBookSearchResultPage({
        navigate,
        params: {
          page: 1,
          title: '파친코',
        },
      }),
    );

    act(() => {
      result.current.handleSelectBook({
        author: '이민진',
        isbn13: '9788954682155',
        title: '파친코',
      });
    });

    act(() => {
      result.current.handleConfirmRegion({
        detailRegion: '11140',
        isbn: '9788954682155',
        page: 1,
        region: '11',
      });
    });

    act(() => {
      result.current.handleBackToRegionSelect();
    });

    expect(result.current.isLibraryResultDialogOpen).toBe(false);
    expect(result.current.currentLibrarySearchParams).toBeNull();
    expect(result.current.libraryResultBook).toBeNull();
    expect(result.current.selectedLibraryCode).toBeNull();
    expect(result.current.isRegionDialogOpen).toBe(true);
    expect(result.current.selectedBook).toEqual({
      author: '이민진',
      isbn13: '9788954682155',
      title: '파친코',
    });
    expect(result.current.lastRegionSelection).toEqual({
      detailRegion: '11140',
      region: '11',
    });
  });

  it('도서관을 선택하면 selectedLibraryCode를 저장한다', () => {
    const navigate = vi.fn();
    const {result} = renderHook(() =>
      useBookSearchResultPage({
        navigate,
        params: {
          page: 1,
          title: '파친코',
        },
      }),
    );

    act(() => {
      result.current.handleSelectLibrary('LIB0002');
    });

    expect(result.current.selectedLibraryCode).toBe('LIB0002');
  });

  it('도서관 결과 페이지를 바꾸면 기존 검색 조건을 유지한 채 page만 갱신하고 선택을 초기화한다', () => {
    const navigate = vi.fn();
    const {result} = renderHook(() =>
      useBookSearchResultPage({
        navigate,
        params: {
          page: 1,
          title: '파친코',
        },
      }),
    );

    act(() => {
      result.current.handleSelectBook({
        author: '이민진',
        isbn13: '9788954682155',
        title: '파친코',
      });
    });

    act(() => {
      result.current.handleConfirmRegion({
        detailRegion: '11140',
        isbn: '9788954682155',
        page: 1,
        region: '11',
      });
    });

    act(() => {
      result.current.handleSelectLibrary('LIB0002');
    });

    act(() => {
      result.current.handleChangeLibraryResultPage(2);
    });

    expect(result.current.currentLibrarySearchParams).toEqual({
      detailRegion: '11140',
      isbn: '9788954682155',
      page: 2,
      region: '11',
    });
    expect(result.current.selectedLibraryCode).toBeNull();
  });

  it('재검색 제출 시 /books route로 navigate한다', () => {
    const navigate = vi.fn();
    const {result} = renderHook(() =>
      useBookSearchResultPage({
        navigate,
        params: {
          page: 1,
          title: '파친코',
        },
      }),
    );

    act(() => {
      result.current.handleSubmitSearch({
        author: '한강',
        page: 1,
      });
    });

    expect(navigate).toHaveBeenCalledWith({
      pathname: '/books',
      search: '?page=1&author=%ED%95%9C%EA%B0%95',
    });
  });
});
