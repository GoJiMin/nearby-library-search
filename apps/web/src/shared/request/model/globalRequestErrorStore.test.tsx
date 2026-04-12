import {render, screen} from '@testing-library/react';
import {afterEach, describe, expect, it} from 'vitest';
import {
  clearGlobalRequestError,
  resetGlobalRequestError,
  updateGlobalRequestError,
  useGlobalRequestError,
  useUpdateGlobalRequestError,
} from '../index';

function ErrorHarness() {
  const error = useGlobalRequestError();

  return <div>{error ? error.message : 'empty'}</div>;
}

function UpdateHarness({error}: {error: Error | null}) {
  const updateError = useUpdateGlobalRequestError();

  return (
    <button onClick={() => updateError(error)} type="button">
      update
    </button>
  );
}

describe('globalRequestErrorStore', () => {
  afterEach(() => {
    resetGlobalRequestError();
  });

  it('마지막으로 업데이트된 에러를 노출한다', () => {
    updateGlobalRequestError(new Error('first'));
    updateGlobalRequestError(new Error('second'));

    render(<ErrorHarness />);

    expect(screen.getByText('second')).toBeInTheDocument();
  });

  it('clear 이후 에러를 비운다', () => {
    updateGlobalRequestError(new Error('first'));
    clearGlobalRequestError();

    render(<ErrorHarness />);

    expect(screen.getByText('empty')).toBeInTheDocument();
  });

  it('hook으로 updateError를 구독해 상태를 갱신할 수 있다', async () => {
    render(
      <>
        <ErrorHarness />
        <UpdateHarness error={new Error('hook update')} />
      </>,
    );

    screen.getByRole('button', {name: 'update'}).click();

    expect(await screen.findByText('hook update')).toBeInTheDocument();
  });
});
