import {QueryErrorResetBoundary} from '@tanstack/react-query';
import {Component, type ReactNode} from 'react';

type QueryErrorBoundaryFallbackProps = {
  error: Error;
  reset: () => void;
};

type QueryErrorBoundaryProps = {
  children: ReactNode;
  fallback: (props: QueryErrorBoundaryFallbackProps) => ReactNode;
};

type QueryErrorBoundaryRootProps = QueryErrorBoundaryProps & {
  onReset: () => void;
};

type QueryErrorBoundaryRootState = {
  error: Error | null;
};

class QueryErrorBoundaryRoot extends Component<QueryErrorBoundaryRootProps, QueryErrorBoundaryRootState> {
  state: QueryErrorBoundaryRootState = {
    error: null,
  };

  static getDerivedStateFromError(error: Error) {
    return {error};
  }

  reset = () => {
    this.props.onReset();
    this.setState({
      error: null,
    });
  };

  render() {
    if (this.state.error) {
      return this.props.fallback({
        error: this.state.error,
        reset: this.reset,
      });
    }

    return this.props.children;
  }
}

function QueryErrorBoundary({children, fallback}: QueryErrorBoundaryProps) {
  return (
    <QueryErrorResetBoundary>
      {({reset}) => (
        <QueryErrorBoundaryRoot fallback={fallback} onReset={reset}>
          {children}
        </QueryErrorBoundaryRoot>
      )}
    </QueryErrorResetBoundary>
  );
}

export {QueryErrorBoundary};
export type {QueryErrorBoundaryFallbackProps, QueryErrorBoundaryProps};
