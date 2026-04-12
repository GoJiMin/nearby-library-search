import type {PropsWithChildren} from 'react';
import {act, renderHook} from '@testing-library/react';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {useGetLibraryAvailability} from './useGetLibraryAvailability';

const {getLibraryAvailabilityMock} = vi.hoisted(() => ({
  getLibraryAvailabilityMock: vi.fn(),
}));

vi.mock('../api/libraryApi', async importOriginal => {
  const actual = await importOriginal<typeof import('../api/libraryApi')>();

  return {
    ...actual,
    getLibraryAvailability: getLibraryAvailabilityMock,
  };
});

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
      },
    },
  });

  return function Wrapper({children}: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useGetLibraryAvailability', () => {
  beforeEach(() => {
    getLibraryAvailabilityMock.mockReset();
  });

  it('초기 렌더에서는 자동 요청하지 않고 refetch할 때만 조회한다', async () => {
    getLibraryAvailabilityMock.mockResolvedValue({
      hasBook: 'Y',
      isbn13: '9791190157551',
      libraryCode: 'LIB0001',
      loanAvailable: 'Y',
    });

    const {result} = renderHook(
      () =>
        useGetLibraryAvailability({
          isbn13: '9791190157551',
          libraryCode: 'LIB0001',
        }),
      {
        wrapper: createWrapper(),
      },
    );

    expect(getLibraryAvailabilityMock).not.toHaveBeenCalled();
    expect(result.current.fetchStatus).toBe('idle');

    await act(async () => {
      await result.current.refetch();
    });

    expect(getLibraryAvailabilityMock).toHaveBeenCalledTimes(1);
    expect(getLibraryAvailabilityMock).toHaveBeenCalledWith({
      isbn13: '9791190157551',
      libraryCode: 'LIB0001',
    });
  });

  it('실패해도 retry하지 않는다', async () => {
    getLibraryAvailabilityMock.mockRejectedValue(new Error('availability failed'));

    const {result} = renderHook(
      () =>
        useGetLibraryAvailability({
          isbn13: '9791190157551',
          libraryCode: 'LIB0001',
        }),
      {
        wrapper: createWrapper(),
      },
    );

    await act(async () => {
      const refetchResult = await result.current.refetch();

      expect(refetchResult.status).toBe('error');
    });

    expect(getLibraryAvailabilityMock).toHaveBeenCalledTimes(1);
  });
});
