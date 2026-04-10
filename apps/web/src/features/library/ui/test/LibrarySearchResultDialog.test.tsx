import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it, vi} from 'vitest';
import {LibrarySearchResultDialog} from '@/features/library';

describe('LibrarySearchResultDialog', () => {
  it('selectedBook과 params가 있으면 도서관 검색 결과 3영역 shell을 렌더링한다', async () => {
    render(
      <LibrarySearchResultDialog
        onBackToRegionSelect={vi.fn()}
        onChangePage={vi.fn()}
        onCheckAvailability={vi.fn()}
        onOpenChange={vi.fn()}
        onSelectLibrary={vi.fn()}
        open
        params={{
          detailRegion: '11140',
          isbn: '9788954682155',
          page: 1,
          region: '11',
        }}
        selectedBook={{
          author: '이민진',
          isbn13: '9788954682155',
          title: '파친코',
        }}
        selectedLibraryCode={null}
      />,
    );

    const dialog = await screen.findByRole('dialog', {name: '도서관 검색 결과'});

    expect(dialog).toBeInTheDocument();
    expect(screen.getByRole('heading', {name: '검색 결과'})).toBeInTheDocument();
    expect(screen.getByLabelText('검색 결과 목록 패널')).toBeInTheDocument();
    expect(screen.getByLabelText('도서관 지도 패널')).toBeInTheDocument();
    expect(screen.getByLabelText('선택된 도서관 정보 패널')).toBeInTheDocument();
    expect(screen.getByRole('button', {name: '대출 가능 여부 조회'})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: '닫기'})).toBeInTheDocument();
  });

  it('닫기 버튼을 누르면 onOpenChange(false)를 호출한다', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <LibrarySearchResultDialog
        onBackToRegionSelect={vi.fn()}
        onChangePage={vi.fn()}
        onCheckAvailability={vi.fn()}
        onOpenChange={onOpenChange}
        onSelectLibrary={vi.fn()}
        open
        params={{
          isbn: '9788954682155',
          page: 1,
          region: '11',
        }}
        selectedBook={{
          author: '이민진',
          isbn13: '9788954682155',
          title: '파친코',
        }}
        selectedLibraryCode={null}
      />,
    );

    await user.click(await screen.findByRole('button', {name: '닫기'}));

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it('open이 true여도 params나 selectedBook이 없으면 렌더링하지 않는다', () => {
    const {rerender} = render(
      <LibrarySearchResultDialog
        onBackToRegionSelect={vi.fn()}
        onChangePage={vi.fn()}
        onCheckAvailability={vi.fn()}
        onOpenChange={vi.fn()}
        onSelectLibrary={vi.fn()}
        open
        params={null}
        selectedBook={{
          author: '이민진',
          isbn13: '9788954682155',
          title: '파친코',
        }}
        selectedLibraryCode={null}
      />,
    );

    expect(screen.queryByRole('dialog', {name: '도서관 검색 결과'})).not.toBeInTheDocument();

    rerender(
      <LibrarySearchResultDialog
        onBackToRegionSelect={vi.fn()}
        onChangePage={vi.fn()}
        onCheckAvailability={vi.fn()}
        onOpenChange={vi.fn()}
        onSelectLibrary={vi.fn()}
        open
        params={{
          isbn: '9788954682155',
          page: 1,
          region: '11',
        }}
        selectedBook={null}
        selectedLibraryCode={null}
      />,
    );

    expect(screen.queryByRole('dialog', {name: '도서관 검색 결과'})).not.toBeInTheDocument();
  });
});
