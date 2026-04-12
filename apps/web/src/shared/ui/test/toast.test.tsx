import {render, screen} from '@testing-library/react';
import {afterEach, describe, expect, it} from 'vitest';
import {AppToaster, toast} from '@/shared/ui';

describe('toast', () => {
  if (!HTMLElement.prototype.setPointerCapture) {
    HTMLElement.prototype.setPointerCapture = () => {};
  }

  if (!HTMLElement.prototype.releasePointerCapture) {
    HTMLElement.prototype.releasePointerCapture = () => {};
  }

  afterEach(() => {
    toast.dismiss();
  });

  it('error toast가 title과 description을 렌더링한다', async () => {
    render(<AppToaster />);

    toast.error({
      description: '잠시 후 다시 시도해주세요.',
      title: '요청을 완료하지 못했어요',
    });

    expect(await screen.findByText('요청을 완료하지 못했어요')).toBeInTheDocument();
    expect(screen.getByText('잠시 후 다시 시도해주세요.')).toBeInTheDocument();
  });
});
