import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {useState} from 'react';
import {describe, expect, it} from 'vitest';
import {ReactQueryProvider} from '@/app/providers';
import {QueryErrorBoundary} from '../QueryErrorBoundary';

function QueryErrorBoundaryTestHarness() {
  const [shouldThrow, setShouldThrow] = useState(true);

  return (
    <ReactQueryProvider>
      <QueryErrorBoundary
        fallback={({error, reset}) => (
          <div>
            <p>{error.message}</p>
            <button
              type="button"
              onClick={() => {
                setShouldThrow(false);
                reset();
              }}
            >
              다시 시도
            </button>
          </div>
        )}
      >
        {shouldThrow ? <QueryErrorThrower /> : <p>정상 렌더링</p>}
      </QueryErrorBoundary>
    </ReactQueryProvider>
  );
}

function QueryErrorThrower(): null {
  throw new Error('쿼리 실패');
}

type QueryErrorBoundaryResetKeysHarnessProps = {
  resetKey: string;
  shouldThrow: boolean;
};

function QueryErrorBoundaryResetKeysHarness({resetKey, shouldThrow}: QueryErrorBoundaryResetKeysHarnessProps) {
  return (
    <ReactQueryProvider>
      <QueryErrorBoundary
        fallback={({error}) => <p>{error.message}</p>}
        resetKeys={[resetKey]}
      >
        {shouldThrow ? <QueryErrorThrower /> : <p>정상 렌더링</p>}
      </QueryErrorBoundary>
    </ReactQueryProvider>
  );
}

describe('QueryErrorBoundary', () => {
  it('예외를 fallback으로 전환하고 reset 후 다시 렌더링할 수 있다', async () => {
    const user = userEvent.setup();

    render(<QueryErrorBoundaryTestHarness />);

    expect(screen.getByText('쿼리 실패')).toBeInTheDocument();

    await user.click(screen.getByRole('button', {name: '다시 시도'}));

    expect(screen.getByText('정상 렌더링')).toBeInTheDocument();
  });

  it('reset key가 바뀌면 fallback 상태를 해제하고 다시 렌더링할 수 있다', () => {
    const {rerender} = render(<QueryErrorBoundaryResetKeysHarness resetKey="title:파친코" shouldThrow />);

    expect(screen.getByText('쿼리 실패')).toBeInTheDocument();

    rerender(<QueryErrorBoundaryResetKeysHarness resetKey="title:채식주의자" shouldThrow={false} />);

    expect(screen.getByText('정상 렌더링')).toBeInTheDocument();
  });
});
