import {render, screen, waitFor} from '@testing-library/react';
import {ErrorBoundary} from 'react-error-boundary';
import {useEffect, type ReactNode} from 'react';
import {useMutation, useQuery} from '@tanstack/react-query';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {ReactQueryProvider} from './ReactQueryProvider';
import {RequestError, RequestGetError, useGlobalRequestError, useGlobalRequestErrorStore} from '@/shared/request';

function ErrorObserver() {
  const error = useGlobalRequestError();

  return <div>{error ? error.message : 'empty'}</div>;
}

function renderWithProvider(children: ReactNode) {
  return render(
    <ReactQueryProvider>
      <ErrorObserver />
      {children}
    </ReactQueryProvider>,
  );
}

function BoundaryQueryHarness() {
  useQuery({
    queryFn: async () => {
      throw new RequestGetError({
        endpoint: '/api/libraries',
        errorHandlingType: 'errorBoundary',
        message: 'boundary error',
        method: 'GET',
        name: 'BOUNDARY_ERROR',
        requestBody: null,
        status: 500,
      });
    },
    queryKey: ['boundary-query'],
    retry: false,
  });

  return <div>content</div>;
}

function ToastQueryHarness() {
  const {isError} = useQuery({
    queryFn: async () => {
      throw new RequestGetError({
        endpoint: '/api/libraries',
        errorHandlingType: 'toast',
        message: 'toast error',
        method: 'GET',
        name: 'TOAST_ERROR',
        requestBody: null,
        status: 500,
      });
    },
    queryKey: ['toast-query'],
    retry: false,
  });

  return <div>{isError ? 'toast query error' : 'loading'}</div>;
}

function MutationHarness() {
  const {mutate} = useMutation({
    mutationFn: async () => {
      throw new RequestError({
        endpoint: '/api/libraries',
        message: 'mutation error',
        method: 'POST',
        name: 'MUTATION_ERROR',
        requestBody: null,
        status: 500,
      });
    },
  });

  useEffect(() => {
    mutate();
  }, [mutate]);

  return <div>mutation pending</div>;
}

describe('ReactQueryProvider', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    useGlobalRequestErrorStore.getState().reset();
  });

  it('errorBoundary GET 에러는 global error를 건드리지 않고 boundary로 throw한다', async () => {
    renderWithProvider(
      <ErrorBoundary fallbackRender={() => <div>boundary fallback</div>}>
        <BoundaryQueryHarness />
      </ErrorBoundary>,
    );

    expect(await screen.findByText('boundary fallback')).toBeInTheDocument();
    expect(screen.getByText('empty')).toBeInTheDocument();
  });

  it('toast GET 에러는 boundary로 throw하지 않고 마지막 global error로 기록한다', async () => {
    renderWithProvider(<ToastQueryHarness />);

    expect(await screen.findByText('toast query error')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('toast error')).toBeInTheDocument();
    });
  });

  it('mutation 에러를 마지막 global error로 기록한다', async () => {
    renderWithProvider(<MutationHarness />);

    await waitFor(() => {
      expect(screen.getByText('mutation error')).toBeInTheDocument();
    });
  });
});
