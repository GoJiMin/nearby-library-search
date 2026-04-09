import {act, renderHook} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {useBookSearchResultPage} from '../useBookSearchResultPage';

describe('useBookSearchResultPage', () => {
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

  it('dialog open 상태를 직접 닫을 수 있다', () => {
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

    expect(result.current.isRegionDialogOpen).toBe(false);
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
