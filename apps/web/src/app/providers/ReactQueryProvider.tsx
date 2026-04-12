import type {PropsWithChildren} from 'react';
import {useState} from 'react';
import {MutationCache, QueryCache, QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {RequestGetError, useUpdateGlobalRequestError} from '@/shared/request';

function shouldThrowToErrorBoundary(error: unknown) {
  return error instanceof RequestGetError && error.errorHandlingType === 'errorBoundary';
}

function normalizeError(error: unknown) {
  if (error instanceof Error) {
    return error;
  }

  return new Error('예상하지 못한 문제가 발생했습니다.');
}

function ReactQueryProvider({children}: PropsWithChildren) {
  const updateGlobalRequestError = useUpdateGlobalRequestError();

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 60 * 1000,
            throwOnError: error => shouldThrowToErrorBoundary(error),
          },
        },
        mutationCache: new MutationCache({
          onError: error => {
            updateGlobalRequestError(normalizeError(error));
          },
        }),
        queryCache: new QueryCache({
          onError: error => {
            if (shouldThrowToErrorBoundary(error)) {
              return;
            }

            updateGlobalRequestError(normalizeError(error));
          },
        }),
      }),
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

export {ReactQueryProvider};
