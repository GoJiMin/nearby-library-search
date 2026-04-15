import {QueryErrorResetBoundary} from '@tanstack/react-query';
import {ErrorBoundary, type FallbackProps} from 'react-error-boundary';
import type {ReactNode} from 'react';

type QueryErrorBoundaryFallbackProps = {
  error: Error;
  reset: () => void;
};

type QueryErrorBoundaryProps = {
  children: ReactNode;
  fallback: (props: QueryErrorBoundaryFallbackProps) => ReactNode;
  resetKeys?: Array<unknown>;
};

function QueryErrorBoundary({children, fallback, resetKeys}: QueryErrorBoundaryProps) {
  return (
    <QueryErrorResetBoundary>
      {({reset}) => (
        <ErrorBoundary
          fallbackRender={({error, resetErrorBoundary}: FallbackProps) =>
            fallback({
              error: error instanceof Error ? error : new Error('알 수 없는 오류가 발생했습니다.'),
              reset: resetErrorBoundary,
            })
          }
          onReset={reset}
          resetKeys={resetKeys}
        >
          {children}
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}

export {QueryErrorBoundary};
export type {QueryErrorBoundaryFallbackProps, QueryErrorBoundaryProps};
