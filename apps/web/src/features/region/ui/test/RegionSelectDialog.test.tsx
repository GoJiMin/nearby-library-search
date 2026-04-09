import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it, vi} from 'vitest';
import {RegionSelectDialog} from '@/features/region';

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
    expect(screen.queryByRole('button', {name: '전체'})).not.toBeInTheDocument();
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
    expect(screen.getByText('세부 지역 없이 이 지역 전체를 검색합니다.')).toBeInTheDocument();
    expect(screen.queryByRole('button', {name: '세종시'})).not.toBeInTheDocument();
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
});
