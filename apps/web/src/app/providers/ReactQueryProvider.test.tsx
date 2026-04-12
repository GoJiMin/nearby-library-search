import {render, screen, waitFor} from '@testing-library/react';
import {ErrorBoundary} from 'react-error-boundary';
import {useEffect, type ReactNode} from 'react';
import {useMutation, useQuery} from '@tanstack/react-query';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {ReactQueryProvider} from './ReactQueryProvider';
import {RequestError, RequestGetError, resetRequestErrorQueue, useNextRequestError} from '@/shared/request';

function QueueObserver() {
  const queuedError = useNextRequestError();

  return <div>{queuedError ? queuedError.error.message : 'empty'}</div>;
}

function renderWithProvider(children: ReactNode) {
  return render(
    <ReactQueryProvider>
      <QueueObserver />
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
    resetRequestErrorQueue();
  });

  it('errorBoundary GET 에러는 queue에 넣지 않고 boundary로 throw한다', async () => {
    renderWithProvider(
      <ErrorBoundary fallbackRender={() => <div>boundary fallback</div>}>
        <BoundaryQueryHarness />
      </ErrorBoundary>,
    );

    expect(await screen.findByText('boundary fallback')).toBeInTheDocument();
    expect(screen.getByText('empty')).toBeInTheDocument();
  });

  it('toast GET 에러는 boundary로 throw하지 않고 queue에 넣는다', async () => {
    renderWithProvider(<ToastQueryHarness />);

    expect(await screen.findByText('toast query error')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('toast error')).toBeInTheDocument();
    });
  });

  it('mutation 에러를 queue에 넣는다', async () => {
    renderWithProvider(<MutationHarness />);

    await waitFor(() => {
      expect(screen.getByText('mutation error')).toBeInTheDocument();
    });
  });
});
