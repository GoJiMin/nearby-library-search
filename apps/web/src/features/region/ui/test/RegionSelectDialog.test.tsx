import {act, fireEvent, render, screen, waitFor, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {useFindLibraryStore} from '@/features/find-library';
import {useRegionSelectionStore} from '../../model/useRegionSelectionStore';
import {RegionSelectDialog} from '../RegionSelectDialog';

const {mockPreloadLibrarySearchResultDialog} = vi.hoisted(() => ({
  mockPreloadLibrarySearchResultDialog: vi.fn(async () => undefined),
}));

vi.mock('@/features/library', async importOriginal => {
  const actual = await importOriginal<typeof import('@/features/library')>();

  return {
    ...actual,
    preloadLibrarySearchResultDialog: mockPreloadLibrarySearchResultDialog,
  };
});

const MOCK_BOOK = {
  author: '이민진',
  isbn13: '9788954682155',
  title: '파친코',
} as const;

async function tabUntilFocused(user: ReturnType<typeof userEvent.setup>, target: HTMLElement, maxSteps = 32) {
  for (let index = 0; index < maxSteps; index += 1) {
    if (target === document.activeElement) {
      return;
    }

    await user.tab();
  }

  throw new Error('target element was not focused within the expected tab sequence');
}

function renderRegionSelectDialog({
  lastSelection = null,
}: {
  lastSelection?: {
    detailRegion?: string;
    region: string;
  } | null;
} = {}) {
  useFindLibraryStore.getState().resetFindLibraryFlow();
  useFindLibraryStore.setState({
    lastRegionSelection: lastSelection,
  });
  useFindLibraryStore.getState().openRegionDialog(MOCK_BOOK);

  return render(<RegionSelectDialog />);
}

describe('RegionSelectDialog', () => {
  beforeEach(() => {
    mockPreloadLibrarySearchResultDialog.mockClear();
    useFindLibraryStore.getState().resetFindLibraryFlow();
    useRegionSelectionStore.getState().resetSelection();
  });

  it('소장 도서관을 찾을 책이 정해지면 지역 선택 창이 열린다', async () => {
    renderRegionSelectDialog();

    const dialog = await screen.findByRole('dialog', {name: '검색 지역 선택'});

    expect(dialog).toBeInTheDocument();
    expect(document.querySelector('[data-slot="region-dialog-progress-rail"]')).toBeInstanceOf(HTMLElement);
    expect(screen.getByRole('heading', {name: '시/도'})).toBeInTheDocument();
    expect(screen.getByRole('heading', {name: '세부 지역'})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: '서울'})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: '닫기'})).toBeInTheDocument();
  });

  it('처음 열면 시도를 먼저 골라야 세부 지역을 선택할 수 있다', async () => {
    renderRegionSelectDialog();

    const detailRegionSection = await screen.findByRole('region', {name: '세부 지역'});

    expect(detailRegionSection).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByText('시/도를 먼저 선택하면 세부 지역을 고를 수 있어요.')).toBeInTheDocument();
    expect(screen.getByText('지역을 선택해주세요')).toBeInTheDocument();
    expect(screen.queryByRole('button', {name: '전체'})).not.toBeInTheDocument();
    expect(screen.getByRole('button', {name: '선택 완료'})).toBeDisabled();
  });

  it('시도를 고르면 세부 지역을 바로 선택할 수 있다', async () => {
    const user = userEvent.setup();

    renderRegionSelectDialog();

    await user.click(await screen.findByRole('button', {name: '서울'}));

    const detailRegionSection = screen.getByRole('region', {name: '세부 지역'});

    expect(detailRegionSection).toHaveAttribute('aria-disabled', 'false');
    expect(screen.getByRole('button', {name: '전체'})).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', {name: '마포구'})).toBeInTheDocument();
    expect(screen.queryByText('세부 지역 없이 이 지역 전체를 검색합니다.')).not.toBeInTheDocument();
    expect(screen.getByText('서울 전체')).toBeInTheDocument();
    expect(screen.getByRole('button', {name: '선택 완료'})).toBeEnabled();
  });

  it('시도를 바꾸면 세부 지역 선택이 다시 전체로 돌아간다', async () => {
    const user = userEvent.setup();

    renderRegionSelectDialog();

    await user.click(await screen.findByRole('button', {name: '서울'}));
    await user.click(screen.getByRole('button', {name: '마포구'}));

    expect(screen.getByRole('button', {name: '마포구'})).toHaveAttribute('aria-pressed', 'true');

    await user.click(screen.getByRole('button', {name: '부산'}));

    expect(screen.getByRole('button', {name: '전체'})).toHaveAttribute('aria-pressed', 'true');
    expect(screen.queryByRole('button', {name: '마포구'})).not.toBeInTheDocument();
  });

  it('세종처럼 세부 지역 구분이 없는 곳은 전체 지역으로 바로 검색할 수 있다', async () => {
    const user = userEvent.setup();

    renderRegionSelectDialog();

    await user.click(await screen.findByRole('button', {name: '세종'}));

    expect(screen.getByRole('button', {name: '전체'})).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('세종시는 세부 지역 구분이 없어 전체 지역으로 검색합니다.')).toBeInTheDocument();
    expect(screen.queryByRole('button', {name: '세종시'})).not.toBeInTheDocument();
    expect(screen.getByRole('button', {name: '선택 완료'})).toBeEnabled();
  });

  it('세부 지역을 고르면 현재 선택한 지역을 바로 확인할 수 있다', async () => {
    const user = userEvent.setup();

    renderRegionSelectDialog();

    await user.click(await screen.findByRole('button', {name: '서울'}));
    await user.click(screen.getByRole('button', {name: '마포구'}));

    expect(screen.getByText('서울 > 마포구')).toBeInTheDocument();
  });

  it('현재 고른 지역은 보조기기에도 바로 전달된다', async () => {
    const user = userEvent.setup();

    renderRegionSelectDialog();

    await user.click(await screen.findByRole('button', {name: '서울'}));

    const summaryWrapper = screen.getByText('서울 전체').closest('div');

    expect(summaryWrapper).toHaveAttribute('aria-live', 'polite');
    expect(summaryWrapper).toHaveAttribute('aria-atomic', 'true');
  });

  it('다시 열면 마지막으로 고른 지역을 이어서 볼 수 있다', async () => {
    renderRegionSelectDialog({
      lastSelection: {
        detailRegion: '11140',
        region: '11',
      },
    });

    await screen.findByRole('dialog', {name: '검색 지역 선택'});

    expect(screen.getByRole('button', {name: '서울'})).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', {name: '마포구'})).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('서울 > 마포구')).toBeInTheDocument();
  });

  it('다시 열면 마지막으로 고른 전체 지역을 이어서 볼 수 있다', async () => {
    renderRegionSelectDialog({
      lastSelection: {
        region: '11',
      },
    });

    await screen.findByRole('dialog', {name: '검색 지역 선택'});

    expect(screen.getByRole('button', {name: '서울'})).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', {name: '전체'})).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('서울 전체')).toBeInTheDocument();
  });

  it('초기화를 누르면 지역 선택을 처음부터 다시 할 수 있다', async () => {
    const user = userEvent.setup();

    renderRegionSelectDialog();

    await user.click(await screen.findByRole('button', {name: '서울'}));
    await user.click(screen.getByRole('button', {name: '초기화'}));

    expect(screen.getByText('지역을 선택해주세요')).toBeInTheDocument();
    expect(screen.getByText('시/도를 먼저 선택하면 세부 지역을 고를 수 있어요.')).toBeInTheDocument();
    expect(screen.getByRole('button', {name: '선택 완료'})).toBeDisabled();
  });

  it('확정하지 않고 닫았다가 다시 열면 임시로 고른 지역은 남지 않는다', async () => {
    const user = userEvent.setup();

    renderRegionSelectDialog();

    await user.click(await screen.findByRole('button', {name: '서울'}));
    await user.click(screen.getByRole('button', {name: '닫기'}));

    await waitFor(() => {
      expect(useFindLibraryStore.getState().regionDialogBook).toBeNull();
    });

    act(() => {
      useFindLibraryStore.getState().openRegionDialog(MOCK_BOOK);
    });

    const reopenedDialog = await screen.findByRole('dialog', {name: '검색 지역 선택'});

    expect(screen.getByText('지역을 선택해주세요')).toBeInTheDocument();
    expect(within(reopenedDialog).getByRole('button', {name: '서울'})).toHaveAttribute('aria-pressed', 'false');
    expect(screen.queryByRole('button', {name: '전체'})).not.toBeInTheDocument();
  });

  it('확정하지 않고 닫았다가 다시 열면 마지막 확정 선택으로 다시 시작한다', async () => {
    const user = userEvent.setup();

    renderRegionSelectDialog({
      lastSelection: {
        detailRegion: '11140',
        region: '11',
      },
    });

    await user.click(await screen.findByRole('button', {name: '부산'}));
    await user.click(screen.getByRole('button', {name: '닫기'}));

    await waitFor(() => {
      expect(useFindLibraryStore.getState().regionDialogBook).toBeNull();
    });

    act(() => {
      useFindLibraryStore.getState().openRegionDialog(MOCK_BOOK);
    });

    const reopenedDialog = await screen.findByRole('dialog', {name: '검색 지역 선택'});

    expect(within(reopenedDialog).getByRole('button', {name: '서울'})).toHaveAttribute('aria-pressed', 'true');
    expect(within(reopenedDialog).getByRole('button', {name: '마포구'})).toHaveAttribute('aria-pressed', 'true');
    expect(within(reopenedDialog).getByRole('button', {name: '부산'})).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByText('서울 > 마포구')).toBeInTheDocument();
  });

  it('전체 지역으로 소장 도서관 찾기를 시작할 수 있다', async () => {
    const user = userEvent.setup();

    renderRegionSelectDialog();

    await user.click(await screen.findByRole('button', {name: '서울'}));
    await user.click(screen.getByRole('button', {name: '선택 완료'}));

    expect(useFindLibraryStore.getState().currentLibrarySearchParams).toEqual({
      isbn: '9788954682155',
      page: 1,
      region: '11',
    });
    expect(useFindLibraryStore.getState().libraryResultBook).toEqual(MOCK_BOOK);
    expect(useFindLibraryStore.getState().regionDialogBook).toBeNull();
  });

  it('세부 지역까지 고른 뒤 소장 도서관 찾기를 시작할 수 있다', async () => {
    const user = userEvent.setup();

    renderRegionSelectDialog();

    await user.click(await screen.findByRole('button', {name: '서울'}));
    await user.click(screen.getByRole('button', {name: '마포구'}));
    await user.click(screen.getByRole('button', {name: '선택 완료'}));

    expect(useFindLibraryStore.getState().currentLibrarySearchParams).toEqual({
      detailRegion: '11140',
      isbn: '9788954682155',
      page: 1,
      region: '11',
    });
    expect(useFindLibraryStore.getState().libraryResultBook).toEqual(MOCK_BOOK);
  });

  it('세종에서도 바로 소장 도서관 찾기를 시작할 수 있다', async () => {
    const user = userEvent.setup();

    renderRegionSelectDialog();

    await user.click(await screen.findByRole('button', {name: '세종'}));
    await user.click(screen.getByRole('button', {name: '선택 완료'}));

    expect(useFindLibraryStore.getState().currentLibrarySearchParams).toEqual({
      isbn: '9788954682155',
      page: 1,
      region: '29',
    });
  });

  it('선택 완료 버튼에 진입하면 도서관 결과 dialog preload를 먼저 시작한다', async () => {
    const user = userEvent.setup();

    renderRegionSelectDialog();

    await user.click(await screen.findByRole('button', {name: '서울'}));

    const confirmButton = screen.getByRole('button', {name: '선택 완료'});

    await user.hover(confirmButton);
    confirmButton.focus();
    fireEvent.touchStart(confirmButton, {
      changedTouches: [{clientX: 0, clientY: 0}],
      touches: [{clientX: 0, clientY: 0}],
    });

    expect(mockPreloadLibrarySearchResultDialog).toHaveBeenCalledTimes(3);
  });

  it('선택 완료를 누르면 도서관 결과 dialog preload를 다시 시도한 뒤 검색을 시작한다', async () => {
    const user = userEvent.setup();

    renderRegionSelectDialog();

    await user.click(await screen.findByRole('button', {name: '서울'}));
    mockPreloadLibrarySearchResultDialog.mockClear();

    fireEvent.click(screen.getByRole('button', {name: '선택 완료'}));

    expect(mockPreloadLibrarySearchResultDialog).toHaveBeenCalledTimes(1);
    expect(useFindLibraryStore.getState().currentLibrarySearchParams).toEqual({
      isbn: '9788954682155',
      page: 1,
      region: '11',
    });
    expect(useFindLibraryStore.getState().libraryResultBook).toEqual(MOCK_BOOK);
  });

  it('선택 완료 직전 preload가 실패해도 도서관 검색을 계속 시작할 수 있다', async () => {
    const user = userEvent.setup();

    mockPreloadLibrarySearchResultDialog.mockRejectedValueOnce(new Error('library preload failed'));

    renderRegionSelectDialog();

    await user.click(await screen.findByRole('button', {name: '서울'}));
    fireEvent.click(screen.getByRole('button', {name: '선택 완료'}));

    expect(mockPreloadLibrarySearchResultDialog).toHaveBeenCalledTimes(1);
    expect(useFindLibraryStore.getState().currentLibrarySearchParams).toEqual({
      isbn: '9788954682155',
      page: 1,
      region: '11',
    });
    expect(useFindLibraryStore.getState().libraryResultBook).toEqual(MOCK_BOOK);
  });

  it('닫기 버튼으로 지역 선택 창을 닫을 수 있다', async () => {
    const user = userEvent.setup();

    renderRegionSelectDialog({
      lastSelection: {
        detailRegion: '11140',
        region: '11',
      },
    });

    await user.click(await screen.findByRole('button', {name: '닫기'}));

    await waitFor(() => {
      expect(useFindLibraryStore.getState().regionDialogBook).toBeNull();
    });
  });

  it('Esc 키로 지역 선택 창을 닫을 수 있다', async () => {
    const user = userEvent.setup();

    renderRegionSelectDialog();

    await screen.findByRole('dialog', {name: '검색 지역 선택'});
    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(useFindLibraryStore.getState().regionDialogBook).toBeNull();
    });
  });

  it('창 바깥을 눌러 지역 선택 창을 닫을 수 있다', async () => {
    const user = userEvent.setup();

    renderRegionSelectDialog();

    await screen.findByRole('dialog', {name: '검색 지역 선택'});

    const overlay = document.querySelector('[data-slot="dialog-overlay"]');

    expect(overlay).toBeInstanceOf(HTMLElement);

    if (!(overlay instanceof HTMLElement)) {
      throw new Error('dialog overlay not found');
    }

    await user.click(overlay);

    await waitFor(() => {
      expect(useFindLibraryStore.getState().regionDialogBook).toBeNull();
    });
  });

  it('키보드만으로 지역 선택 창의 주요 버튼을 이동할 수 있다', async () => {
    const user = userEvent.setup();

    renderRegionSelectDialog({
      lastSelection: {
        detailRegion: '11140',
        region: '11',
      },
    });

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
