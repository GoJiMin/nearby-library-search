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

    expect(await screen.findByRole('dialog', {name: '검색 지역 선택'})).toBeInTheDocument();
    expect(screen.getByText('선택한 책을 기준으로 지역을 고르는 단계를 연결하는 중이에요.')).toBeInTheDocument();
    expect(screen.getByText('"파친코" 소장 도서관을 찾기 위한 지역 선택 단계를 준비하고 있어요.')).toBeInTheDocument();
  });

  it('마지막 확정 선택이 있으면 복원 안내 문구를 보여준다', async () => {
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

    expect(await screen.findByRole('dialog', {name: '검색 지역 선택'})).toBeInTheDocument();
    expect(screen.getByText('이전에 확정한 지역 선택 상태를 다음 단계에서 다시 복원할 예정이에요.')).toBeInTheDocument();
  });

  it('닫기 버튼 클릭 시 onOpenChange(false)를 호출한다', async () => {
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

    await user.click(await screen.findByRole('button', {name: '닫기'}));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
