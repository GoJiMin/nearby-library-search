import {act, renderHook} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {useLibraryAvailabilityCtaState} from './useLibraryAvailabilityCtaState';

function createParams(overrides?: Partial<Parameters<typeof useLibraryAvailabilityCtaState>[0]>) {
  return {
    data: undefined,
    hasSelectedLibrary: true,
    isError: false,
    isFetching: false,
    ...overrides,
  };
}

describe('useLibraryAvailabilityCtaState', () => {
  it('선택된 도서관이 없으면 idle 상태다', () => {
    const {result} = renderHook(() =>
      useLibraryAvailabilityCtaState(
        createParams({
          hasSelectedLibrary: false,
        }),
      ),
    );

    expect(result.current.status).toBe('idle');
  });

  it('요청 전에는 성공 캐시가 있어도 idle 상태다', () => {
    const {result} = renderHook(() =>
      useLibraryAvailabilityCtaState(
        createParams({
          data: {
            hasBook: 'Y',
            isbn13: '9791190157551',
            libraryCode: 'LIB0001',
            loanAvailable: 'Y',
          },
        }),
      ),
    );

    expect(result.current.status).toBe('idle');
  });

  it('요청 후 fetch 중이면 pending 상태다', () => {
    const {result, rerender} = renderHook(
      params => useLibraryAvailabilityCtaState(params),
      {
        initialProps: createParams(),
      },
    );

    act(() => {
      result.current.markRequested();
    });

    rerender(
      createParams({
        isFetching: true,
      }),
    );

    expect(result.current.status).toBe('pending');
  });

  it('요청 후 대출 가능 응답이면 success-available 상태다', () => {
    const {result, rerender} = renderHook(
      params => useLibraryAvailabilityCtaState(params),
      {
        initialProps: createParams(),
      },
    );

    act(() => {
      result.current.markRequested();
    });

    rerender(
      createParams({
        data: {
          hasBook: 'Y',
          isbn13: '9791190157551',
          libraryCode: 'LIB0001',
          loanAvailable: 'Y',
        },
      }),
    );

    expect(result.current.status).toBe('success-available');
  });

  it('요청 후 대출 불가 응답이면 success-unavailable 상태다', () => {
    const {result, rerender} = renderHook(
      params => useLibraryAvailabilityCtaState(params),
      {
        initialProps: createParams(),
      },
    );

    act(() => {
      result.current.markRequested();
    });

    rerender(
      createParams({
        data: {
          hasBook: 'Y',
          isbn13: '9791190157551',
          libraryCode: 'LIB0001',
          loanAvailable: 'N',
        },
      }),
    );

    expect(result.current.status).toBe('success-unavailable');
  });

  it('요청 후 미소장 응답이면 success-not-owned 상태다', () => {
    const {result, rerender} = renderHook(
      params => useLibraryAvailabilityCtaState(params),
      {
        initialProps: createParams(),
      },
    );

    act(() => {
      result.current.markRequested();
    });

    rerender(
      createParams({
        data: {
          hasBook: 'N',
          isbn13: '9791190157551',
          libraryCode: 'LIB0001',
          loanAvailable: 'N',
        },
      }),
    );

    expect(result.current.status).toBe('success-not-owned');
  });

  it('요청 후 에러가 나면 error 상태다', () => {
    const {result, rerender} = renderHook(
      params => useLibraryAvailabilityCtaState(params),
      {
        initialProps: createParams(),
      },
    );

    act(() => {
      result.current.markRequested();
    });

    rerender(
      createParams({
        isError: true,
      }),
    );

    expect(result.current.status).toBe('error');
  });
});
