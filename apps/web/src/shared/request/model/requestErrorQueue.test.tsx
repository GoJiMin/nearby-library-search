import {render, screen} from '@testing-library/react';
import {afterEach, describe, expect, it} from 'vitest';
import {consumeRequestError, enqueueRequestError, resetRequestErrorQueue, useNextRequestError} from '../index';

function QueueHarness() {
  const queuedError = useNextRequestError();

  return <div>{queuedError ? `${queuedError.id}:${queuedError.error.message}` : 'empty'}</div>;
}

describe('requestErrorQueue', () => {
  afterEach(() => {
    resetRequestErrorQueue();
  });

  it('enqueue 순서대로 첫 번째 에러를 노출한다', () => {
    enqueueRequestError(new Error('first'));
    enqueueRequestError(new Error('second'));

    render(<QueueHarness />);

    expect(screen.getByText('1:first')).toBeInTheDocument();
  });

  it('consume 이후 다음 에러를 노출한다', () => {
    enqueueRequestError(new Error('first'));
    enqueueRequestError(new Error('second'));

    consumeRequestError(1);

    render(<QueueHarness />);

    expect(screen.getByText('2:second')).toBeInTheDocument();
  });

  it('reset 이후 queue를 비운다', () => {
    enqueueRequestError(new Error('first'));

    resetRequestErrorQueue();

    render(<QueueHarness />);

    expect(screen.getByText('empty')).toBeInTheDocument();
  });
});
