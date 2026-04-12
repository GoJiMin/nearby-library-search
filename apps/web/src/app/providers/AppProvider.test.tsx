import {act, render, screen} from '@testing-library/react';
import {afterEach, describe, expect, it} from 'vitest';
import {AppProvider} from './AppProvider';
import {RequestError, resetGlobalRequestError, updateGlobalRequestError} from '@/shared/request';
import {toast} from '@/shared/ui';

describe('AppProvider', () => {
  afterEach(() => {
    resetGlobalRequestError();
    toast.dismiss();
  });

  it('request error queue의 에러를 toast로 표시한다', async () => {
    render(
      <AppProvider>
        <div>app content</div>
      </AppProvider>,
    );

    act(() => {
      updateGlobalRequestError(
        new RequestError({
          endpoint: '/api/libraries',
          message: '대출 가능 여부를 다시 확인해주세요.',
          method: 'GET',
          name: 'LIBRARY_AVAILABILITY_UPSTREAM_ERROR',
          requestBody: null,
          status: 502,
        }),
      );
    });

    expect(await screen.findByText('요청을 완료하지 못했어요')).toBeInTheDocument();
    expect(screen.getByText('대출 가능 여부를 다시 확인해주세요.')).toBeInTheDocument();
    expect(screen.getByText('app content')).toBeInTheDocument();
  });

  it('unknown error queue를 global unexpected boundary로 보낸다', async () => {
    render(
      <AppProvider>
        <div>app content</div>
      </AppProvider>,
    );

    act(() => {
      updateGlobalRequestError(new Error('unexpected'));
    });

    expect(await screen.findByRole('heading', {name: '화면을 불러오지 못했어요'})).toBeInTheDocument();
    expect(screen.queryByText('app content')).not.toBeInTheDocument();
  });
});
