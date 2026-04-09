import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it, vi} from 'vitest';
import {RegionSelectDialog} from '@/features/region';

async function tabUntilFocused(user: ReturnType<typeof userEvent.setup>, target: HTMLElement, maxSteps = 32) {
  for (let index = 0; index < maxSteps; index += 1) {
    if (target === document.activeElement) {
      return;
    }

    await user.tab();
  }

  throw new Error('target element was not focused within the expected tab sequence');
}

describe('RegionSelectDialog', () => {
  it('선택된 책이 있으면 지역 선택 dialog shell을 렌더링한다', async () => {
    render(
      <RegionSelectDialog
        lastSelection={null}
        onConfirm={vi.fn()}
        onOpenChange={vi.fn()}
        open
        selectedBook={{
          author: '이민진',
          isbn13: '9788954682155',
          title: '파친코',
        }}
      />,
    );

    const dialog = await screen.findByRole('dialog', {name: '검색 지역 선택'});

    expect(dialog).toBeInTheDocument();
    expect(document.querySelector('[data-slot="region-dialog-progress-rail"]')).toBeInstanceOf(HTMLElement);
    expect(screen.getByRole('heading', {name: '시/도'})).toBeInTheDocument();
    expect(screen.getByRole('heading', {name: '세부 지역'})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: '서울'})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: '닫기'})).toBeInTheDocument();
  });

  it('처음 열면 상위 지역이 선택되지 않아 세부 지역 영역이 비활성 상태다', async () => {
    render(
      <RegionSelectDialog
        lastSelection={null}
        onConfirm={vi.fn()}
        onOpenChange={vi.fn()}
        open
        selectedBook={{
          author: '이민진',
          isbn13: '9788954682155',
          title: '파친코',
        }}
      />,
    );

    const detailRegionSection = await screen.findByRole('region', {name: '세부 지역'});

    expect(detailRegionSection).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByText('시/도를 먼저 선택하면 세부 지역을 고를 수 있어요.')).toBeInTheDocument();
    expect(screen.getByText('지역을 선택해주세요')).toBeInTheDocument();
    expect(screen.queryByRole('button', {name: '전체'})).not.toBeInTheDocument();
    expect(screen.getByRole('button', {name: '선택 완료'})).toBeDisabled();
  });

  it('상위 지역을 선택하면 세부 지역 목록이 열리고 전체가 기본 선택된다', async () => {
    const user = userEvent.setup();

    render(
      <RegionSelectDialog
        lastSelection={null}
        onConfirm={vi.fn()}
        onOpenChange={vi.fn()}
        open
        selectedBook={{
          author: '이민진',
          isbn13: '9788954682155',
          title: '파친코',
        }}
      />,
    );

    await user.click(await screen.findByRole('button', {name: '서울'}));

    const detailRegionSection = screen.getByRole('region', {name: '세부 지역'});

    expect(detailRegionSection).toHaveAttribute('aria-disabled', 'false');
    expect(screen.getByRole('button', {name: '전체'})).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', {name: '마포구'})).toBeInTheDocument();
    expect(screen.queryByText('세부 지역 없이 이 지역 전체를 검색합니다.')).not.toBeInTheDocument();
    expect(screen.getByText('서울 전체')).toBeInTheDocument();
    expect(screen.getByRole('button', {name: '선택 완료'})).toBeEnabled();
  });

  it('상위 지역을 바꾸면 세부 지역 선택이 전체로 초기화된다', async () => {
    const user = userEvent.setup();

    render(
      <RegionSelectDialog
        lastSelection={null}
        onConfirm={vi.fn()}
        onOpenChange={vi.fn()}
        open
        selectedBook={{
          author: '이민진',
          isbn13: '9788954682155',
          title: '파친코',
        }}
      />,
    );

    await user.click(await screen.findByRole('button', {name: '서울'}));
    await user.click(screen.getByRole('button', {name: '마포구'}));

    expect(screen.getByRole('button', {name: '마포구'})).toHaveAttribute('aria-pressed', 'true');

    await user.click(screen.getByRole('button', {name: '부산'}));

    expect(screen.getByRole('button', {name: '전체'})).toHaveAttribute('aria-pressed', 'true');
    expect(screen.queryByRole('button', {name: '마포구'})).not.toBeInTheDocument();
  });

  it('세종처럼 실질적인 세부 지역이 없는 경우 전체만 유지하고 fallback 안내 문구를 보여준다', async () => {
    const user = userEvent.setup();

    render(
      <RegionSelectDialog
        lastSelection={null}
        onConfirm={vi.fn()}
        onOpenChange={vi.fn()}
        open
        selectedBook={{
          author: '이민진',
          isbn13: '9788954682155',
          title: '파친코',
        }}
      />,
    );

    await user.click(await screen.findByRole('button', {name: '세종'}));

    expect(screen.getByRole('button', {name: '전체'})).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('세종시는 세부 지역 구분이 없어 전체 지역으로 검색합니다.')).toBeInTheDocument();
    expect(screen.queryByRole('button', {name: '세종시'})).not.toBeInTheDocument();
    expect(screen.getByRole('button', {name: '선택 완료'})).toBeEnabled();
  });

  it('세부 지역을 선택하면 현재 선택 요약이 서울 > 마포구로 갱신된다', async () => {
    const user = userEvent.setup();

    render(
      <RegionSelectDialog
        lastSelection={null}
        onConfirm={vi.fn()}
        onOpenChange={vi.fn()}
        open
        selectedBook={{
          author: '이민진',
          isbn13: '9788954682155',
          title: '파친코',
        }}
      />,
    );

    await user.click(await screen.findByRole('button', {name: '서울'}));
    await user.click(screen.getByRole('button', {name: '마포구'}));

    expect(screen.getByText('서울 > 마포구')).toBeInTheDocument();
  });

  it('현재 선택 요약은 live region으로 제공된다', async () => {
    const user = userEvent.setup();

    render(
      <RegionSelectDialog
        lastSelection={null}
        onConfirm={vi.fn()}
        onOpenChange={vi.fn()}
        open
        selectedBook={{
          author: '이민진',
          isbn13: '9788954682155',
          title: '파친코',
        }}
      />,
    );

    await user.click(await screen.findByRole('button', {name: '서울'}));

    const summaryWrapper = screen.getByText('서울 전체').closest('div');

    expect(summaryWrapper).toHaveAttribute('aria-live', 'polite');
    expect(summaryWrapper).toHaveAttribute('aria-atomic', 'true');
  });

  it('마지막 확정 선택이 있으면 처음부터 해당 region과 detail을 복원한다', async () => {
    render(
      <RegionSelectDialog
        lastSelection={{
          detailRegion: '11140',
          region: '11',
        }}
        onConfirm={vi.fn()}
        onOpenChange={vi.fn()}
        open
        selectedBook={{
          author: '이민진',
          isbn13: '9788954682155',
          title: '파친코',
        }}
      />,
    );

    await screen.findByRole('dialog', {name: '검색 지역 선택'});

    expect(screen.getByRole('button', {name: '서울'})).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', {name: '마포구'})).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('서울 > 마포구')).toBeInTheDocument();
  });

  it('마지막 확정 선택에 detailRegion이 없으면 전체 선택 상태로 복원한다', async () => {
    render(
      <RegionSelectDialog
        lastSelection={{
          region: '11',
        }}
        onConfirm={vi.fn()}
        onOpenChange={vi.fn()}
        open
        selectedBook={{
          author: '이민진',
          isbn13: '9788954682155',
          title: '파친코',
        }}
      />,
    );

    await screen.findByRole('dialog', {name: '검색 지역 선택'});

    expect(screen.getByRole('button', {name: '서울'})).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', {name: '전체'})).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('서울 전체')).toBeInTheDocument();
  });

  it('초기화를 누르면 draft를 비선택 상태로 되돌린다', async () => {
    const user = userEvent.setup();

    render(
      <RegionSelectDialog
        lastSelection={null}
        onConfirm={vi.fn()}
        onOpenChange={vi.fn()}
        open
        selectedBook={{
          author: '이민진',
          isbn13: '9788954682155',
          title: '파친코',
        }}
      />,
    );

    await user.click(await screen.findByRole('button', {name: '서울'}));
    await user.click(screen.getByRole('button', {name: '초기화'}));

    expect(screen.getByText('지역을 선택해주세요')).toBeInTheDocument();
    expect(screen.getByText('시/도를 먼저 선택하면 세부 지역을 고를 수 있어요.')).toBeInTheDocument();
    expect(screen.getByRole('button', {name: '선택 완료'})).toBeDisabled();
  });

  it('전체 선택 후 선택 완료를 누르면 detailRegion 없는 params를 전달한다', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();

    render(
      <RegionSelectDialog
        lastSelection={null}
        onConfirm={onConfirm}
        onOpenChange={vi.fn()}
        open
        selectedBook={{
          author: '이민진',
          isbn13: '9788954682155',
          title: '파친코',
        }}
      />,
    );

    await user.click(await screen.findByRole('button', {name: '서울'}));
    await user.click(screen.getByRole('button', {name: '선택 완료'}));

    expect(onConfirm).toHaveBeenCalledWith({
      isbn: '9788954682155',
      page: 1,
      region: '11',
    });
  });

  it('세부 지역 선택 후 선택 완료를 누르면 detailRegion 포함 params를 전달한다', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();

    render(
      <RegionSelectDialog
        lastSelection={null}
        onConfirm={onConfirm}
        onOpenChange={vi.fn()}
        open
        selectedBook={{
          author: '이민진',
          isbn13: '9788954682155',
          title: '파친코',
        }}
      />,
    );

    await user.click(await screen.findByRole('button', {name: '서울'}));
    await user.click(screen.getByRole('button', {name: '마포구'}));
    await user.click(screen.getByRole('button', {name: '선택 완료'}));

    expect(onConfirm).toHaveBeenCalledWith({
      detailRegion: '11140',
      isbn: '9788954682155',
      page: 1,
      region: '11',
    });
  });

  it('세종 fallback 상태에서도 선택 완료가 동작한다', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();

    render(
      <RegionSelectDialog
        lastSelection={null}
        onConfirm={onConfirm}
        onOpenChange={vi.fn()}
        open
        selectedBook={{
          author: '이민진',
          isbn13: '9788954682155',
          title: '파친코',
        }}
      />,
    );

    await user.click(await screen.findByRole('button', {name: '세종'}));
    await user.click(screen.getByRole('button', {name: '선택 완료'}));

    expect(onConfirm).toHaveBeenCalledWith({
      isbn: '9788954682155',
      page: 1,
      region: '29',
    });
  });

  it('닫기 버튼 클릭 시 onOpenChange(false)를 호출한다', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <RegionSelectDialog
        lastSelection={{
          detailRegion: '11140',
          region: '11',
        }}
        onConfirm={vi.fn()}
        onOpenChange={onOpenChange}
        open
        selectedBook={{
          author: '이민진',
          isbn13: '9788954682155',
          title: '파친코',
        }}
      />,
    );

    await user.click(await screen.findByRole('button', {name: '닫기'}));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('escape 입력 시 onOpenChange(false)를 호출한다', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <RegionSelectDialog
        lastSelection={null}
        onConfirm={vi.fn()}
        onOpenChange={onOpenChange}
        open
        selectedBook={{
          author: '이민진',
          isbn13: '9788954682155',
          title: '파친코',
        }}
      />,
    );

    await screen.findByRole('dialog', {name: '검색 지역 선택'});
    await user.keyboard('{Escape}');

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('overlay dismiss 시 onOpenChange(false)를 호출한다', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <RegionSelectDialog
        lastSelection={null}
        onConfirm={vi.fn()}
        onOpenChange={onOpenChange}
        open
        selectedBook={{
          author: '이민진',
          isbn13: '9788954682155',
          title: '파친코',
        }}
      />,
    );

    await screen.findByRole('dialog', {name: '검색 지역 선택'});

    const overlay = document.querySelector('[data-slot="dialog-overlay"]');

    expect(overlay).toBeInstanceOf(HTMLElement);

    if (!(overlay instanceof HTMLElement)) {
      throw new Error('dialog overlay not found');
    }

    await user.click(overlay);

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('dialog 안에서 키보드 탭 이동으로 region, detail, footer까지 접근하고 포커스를 가둔다', async () => {
    const user = userEvent.setup();

    render(
      <RegionSelectDialog
        lastSelection={{
          detailRegion: '11140',
          region: '11',
        }}
        onConfirm={vi.fn()}
        onOpenChange={vi.fn()}
        open
        selectedBook={{
          author: '이민진',
          isbn13: '9788954682155',
          title: '파친코',
        }}
      />,
    );

    const dialog = await screen.findByRole('dialog', {name: '검색 지역 선택'});
    const closeButton = screen.getByRole('button', {name: '닫기'});
    const seoulButton = screen.getByRole('button', {name: '서울'});
    const mapoButton = screen.getByRole('button', {name: '마포구'});
    const resetButton = screen.getByRole('button', {name: '초기화'});
    const confirmButton = screen.getByRole('button', {name: '선택 완료'});

    await waitFor(() => {
      expect(dialog.contains(document.activeElement)).toBe(true);
    });

    await tabUntilFocused(user, seoulButton);
    expect(seoulButton).toHaveFocus();

    await tabUntilFocused(user, mapoButton);
    expect(mapoButton).toHaveFocus();

    await tabUntilFocused(user, resetButton);
    expect(resetButton).toHaveFocus();

    await user.tab();
    expect(confirmButton).toHaveFocus();

    await user.tab();
    expect(closeButton).toHaveFocus();
  });
});
