import {act, renderHook} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {useLibraryAvailabilityCtaState} from './useLibraryAvailabilityCtaState';

function createParams(overrides?: Partial<Parameters<typeof useLibraryAvailabilityCtaState>[0]>) {
  return {
    data: undefined,
    hasSelectedLibrary: true,
    isError: false,
    isFetching: false,
    requestIdentity: 'LIB0001:9791190157551',
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
    expect(result.current.buttonLabel).toBe('대출 가능 여부 조회');
    expect(result.current.disabled).toBe(true);
    expect(result.current.showSpinner).toBe(false);
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
    expect(result.current.buttonLabel).toBe('대출 가능 여부 조회');
    expect(result.current.disabled).toBe(false);
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
    expect(result.current.buttonLabel).toBe('대출 가능 여부 조회');
    expect(result.current.disabled).toBe(true);
    expect(result.current.showSpinner).toBe(true);
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
    expect(result.current.buttonLabel).toBe('대출이 가능해요');
    expect(result.current.disabled).toBe(false);
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
    expect(result.current.buttonLabel).toBe('대출이 불가능해요');
    expect(result.current.disabled).toBe(false);
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
    expect(result.current.buttonLabel).toBe('소장하지 않아요');
    expect(result.current.disabled).toBe(false);
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
    expect(result.current.buttonLabel).toBe('재시도');
    expect(result.current.disabled).toBe(false);
    expect(result.current.showSpinner).toBe(false);
  });

  it('hasRequested를 local state로 관리하고 resetRequested로 초기화한다', () => {
    const {result} = renderHook(() =>
      useLibraryAvailabilityCtaState(createParams()),
    );

    expect(result.current.hasRequested).toBe(false);
    expect(result.current.status).toBe('idle');

    act(() => {
      result.current.markRequested();
    });

    expect(result.current.hasRequested).toBe(true);
    expect(result.current.status).toBe('pending');

    act(() => {
      result.current.resetRequested();
    });

    expect(result.current.hasRequested).toBe(false);
    expect(result.current.status).toBe('idle');
  });

  it('request identity가 바뀌면 이전 요청 상태를 재사용하지 않고 idle로 돌아간다', () => {
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
          libraryCode: 'LIB0002',
          loanAvailable: 'Y',
        },
        requestIdentity: 'LIB0002:9791190157551',
      }),
    );

    expect(result.current.hasRequested).toBe(false);
    expect(result.current.status).toBe('idle');
    expect(result.current.buttonLabel).toBe('대출 가능 여부 조회');
  });
});
