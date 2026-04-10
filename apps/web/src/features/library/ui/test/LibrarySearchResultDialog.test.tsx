import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {AppProvider} from '@/app/providers';
import {LibrarySearchResultDialog} from '@/features/library';
import type {LibrarySearchResultDialogProps} from '../../model/librarySearchResultDialog.contract';

const {mockLibrarySearchResponse, mockUseGetSearchLibraries} = vi.hoisted(() => ({
  mockLibrarySearchResponse: {
    detailRegion: '11140',
    isbn: '9788954682155',
    items: [
      {
        address: '서울특별시 마포구 월드컵북로 1',
        closedDays: '둘째 주 월요일',
        code: 'LIB0001',
        fax: null,
        homepage: 'https://library.example.com',
        latitude: 37.5563,
        longitude: 126.9236,
        name: '마포중앙도서관',
        operatingTime: '09:00 - 22:00',
        phone: '02-1234-5678',
      },
      {
        address: '서울특별시 마포구 양화로 2',
        closedDays: '법정 공휴일',
        code: 'LIB0002',
        fax: null,
        homepage: null,
        latitude: null,
        longitude: null,
        name: '합정열람실',
        operatingTime: '10:00 - 20:00',
        phone: '02-2222-3333',
      },
    ],
    page: 1,
    pageSize: 10,
    region: '11',
    resultCount: 2,
    totalCount: 12,
  },
  mockUseGetSearchLibraries: vi.fn(),
}));

vi.mock('@/entities/library', async importOriginal => {
  const actual = await importOriginal<typeof import('@/entities/library')>();

  return {
    ...actual,
    useGetSearchLibraries: mockUseGetSearchLibraries,
  };
});

function renderLibrarySearchResultDialog() {
  return render(
    <AppProvider>
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
      />
    </AppProvider>,
  );
}

function renderLibrarySearchResultDialogWithProps({
  onOpenChange = vi.fn(),
  onSelectLibrary = vi.fn(),
  selectedLibraryCode = null,
}: {
  onOpenChange?: LibrarySearchResultDialogProps['onOpenChange'];
  onSelectLibrary?: LibrarySearchResultDialogProps['onSelectLibrary'];
  selectedLibraryCode?: LibrarySearchResultDialogProps['selectedLibraryCode'];
} = {}) {
  return render(
    <AppProvider>
      <LibrarySearchResultDialog
        onBackToRegionSelect={vi.fn()}
        onChangePage={vi.fn()}
        onCheckAvailability={vi.fn()}
        onOpenChange={onOpenChange}
        onSelectLibrary={onSelectLibrary}
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
        selectedLibraryCode={selectedLibraryCode}
      />
    </AppProvider>,
  );
}

describe('LibrarySearchResultDialog', () => {
  beforeEach(() => {
    mockUseGetSearchLibraries.mockReset();
    mockUseGetSearchLibraries.mockReturnValue(mockLibrarySearchResponse);
  });

  it('조회 성공 시 실제 결과 개수 summary와 3영역 shell을 렌더링한다', async () => {
    renderLibrarySearchResultDialog();

    const dialog = await screen.findByRole('dialog', {name: '도서관 검색 결과'});

    expect(dialog).toBeInTheDocument();
    expect(screen.getByRole('heading', {name: '검색 결과'})).toBeInTheDocument();
    expect(screen.getByText('총 12개의 도서관을 검색했어요.')).toBeInTheDocument();
    expect(screen.getByLabelText('검색 결과 목록 패널')).toBeInTheDocument();
    expect(screen.getByLabelText('도서관 지도 패널')).toBeInTheDocument();
    expect(screen.getByLabelText('선택된 도서관 정보 패널')).toBeInTheDocument();
    expect(screen.getByRole('button', {name: '대출 가능 여부 조회'})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: /마포중앙도서관/})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: /합정열람실/})).toBeInTheDocument();
  });

  it('selectedLibraryCode가 없으면 첫 번째 도서관을 기본 선택하고 onSelectLibrary로 동기화한다', async () => {
    const onSelectLibrary = vi.fn();

    renderLibrarySearchResultDialogWithProps({onSelectLibrary});

    const firstRow = await screen.findByRole('button', {name: /마포중앙도서관/});
    const secondRow = screen.getByRole('button', {name: /합정열람실/});

    expect(firstRow).toHaveAttribute('aria-pressed', 'true');
    expect(secondRow).toHaveAttribute('aria-pressed', 'false');

    await waitFor(() => {
      expect(onSelectLibrary).toHaveBeenCalledWith('LIB0001');
    });
  });

  it('현재 페이지에 없는 selectedLibraryCode가 들어오면 첫 번째 도서관으로 fallback한다', async () => {
    const onSelectLibrary = vi.fn();

    renderLibrarySearchResultDialogWithProps({
      onSelectLibrary,
      selectedLibraryCode: 'LIB9999',
    });

    const firstRow = await screen.findByRole('button', {name: /마포중앙도서관/});

    expect(firstRow).toHaveAttribute('aria-pressed', 'true');
    await waitFor(() => {
      expect(onSelectLibrary).toHaveBeenCalledWith('LIB0001');
    });
  });

  it('유효한 selectedLibraryCode가 있으면 해당 도서관을 active row로 유지한다', async () => {
    const onSelectLibrary = vi.fn();

    renderLibrarySearchResultDialogWithProps({
      onSelectLibrary,
      selectedLibraryCode: 'LIB0002',
    });

    const firstRow = await screen.findByRole('button', {name: /마포중앙도서관/});
    const secondRow = screen.getByRole('button', {name: /합정열람실/});

    expect(firstRow).toHaveAttribute('aria-pressed', 'false');
    expect(secondRow).toHaveAttribute('aria-pressed', 'true');
    expect(onSelectLibrary).not.toHaveBeenCalled();
  });

  it('리스트 row를 클릭하면 해당 code로 onSelectLibrary를 호출한다', async () => {
    const user = userEvent.setup();
    const onSelectLibrary = vi.fn();

    renderLibrarySearchResultDialogWithProps({
      onSelectLibrary,
      selectedLibraryCode: 'LIB0001',
    });

    await user.click(await screen.findByRole('button', {name: /합정열람실/}));

    expect(onSelectLibrary).toHaveBeenCalledWith('LIB0002');
  });

  it('리스트 row는 native button keyboard interaction으로 선택할 수 있다', async () => {
    const user = userEvent.setup();
    const onSelectLibrary = vi.fn();

    renderLibrarySearchResultDialogWithProps({
      onSelectLibrary,
      selectedLibraryCode: 'LIB0001',
    });

    const secondRow = await screen.findByRole('button', {name: /합정열람실/});

    secondRow.focus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');

    expect(onSelectLibrary).toHaveBeenCalledWith('LIB0002');
    expect(onSelectLibrary).toHaveBeenCalledTimes(2);
  });

  it('조회가 suspend되면 loading shell을 유지한다', async () => {
    mockUseGetSearchLibraries.mockImplementation(() => {
      throw new Promise(() => {});
    });

    renderLibrarySearchResultDialog();

    expect(await screen.findByRole('dialog', {name: '도서관 검색 결과'})).toBeInTheDocument();
    expect(screen.getByText('도서관 검색 결과를 불러오고 있어요.')).toBeInTheDocument();
    expect(screen.getByLabelText('검색 결과 목록 패널')).toBeInTheDocument();
    expect(screen.getByLabelText('도서관 지도 패널')).toBeInTheDocument();
    expect(screen.getByLabelText('선택된 도서관 정보 패널')).toBeInTheDocument();
  });

  it('빈 응답이면 empty state와 복구 CTA를 렌더링한다', async () => {
    mockUseGetSearchLibraries.mockReturnValue({
      detailRegion: '11140',
      isbn: '9788954682155',
      items: [],
      page: 1,
      pageSize: 10,
      region: '11',
      resultCount: 0,
      totalCount: 0,
    });

    renderLibrarySearchResultDialog();

    expect(await screen.findByText('선택한 지역에서 소장 도서관을 찾지 못했어요')).toBeInTheDocument();
    expect(screen.getByRole('button', {name: '지역 다시 선택'})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: '다른 책 다시 선택'})).toBeInTheDocument();
  });

  it('empty state의 지역 다시 선택 CTA는 onBackToRegionSelect를 호출한다', async () => {
    const user = userEvent.setup();
    const onBackToRegionSelect = vi.fn();

    mockUseGetSearchLibraries.mockReturnValue({
      detailRegion: '11140',
      isbn: '9788954682155',
      items: [],
      page: 1,
      pageSize: 10,
      region: '11',
      resultCount: 0,
      totalCount: 0,
    });

    render(
      <AppProvider>
        <LibrarySearchResultDialog
          onBackToRegionSelect={onBackToRegionSelect}
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
        />
      </AppProvider>,
    );

    await user.click(await screen.findByRole('button', {name: '지역 다시 선택'}));

    expect(onBackToRegionSelect).toHaveBeenCalledTimes(1);
  });

  it('empty state의 다른 책 다시 선택 CTA는 onOpenChange(false)를 호출한다', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    mockUseGetSearchLibraries.mockReturnValue({
      detailRegion: '11140',
      isbn: '9788954682155',
      items: [],
      page: 1,
      pageSize: 10,
      region: '11',
      resultCount: 0,
      totalCount: 0,
    });

    render(
      <AppProvider>
        <LibrarySearchResultDialog
          onBackToRegionSelect={vi.fn()}
          onChangePage={vi.fn()}
          onCheckAvailability={vi.fn()}
          onOpenChange={onOpenChange}
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
        />
      </AppProvider>,
    );

    await user.click(await screen.findByRole('button', {name: '다른 책 다시 선택'}));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('조회 에러면 recoverable error UI를 렌더링하고 다시 시도로 회복할 수 있다', async () => {
    const user = userEvent.setup();
    let shouldFail = true;

    mockUseGetSearchLibraries.mockImplementation(() => {
      if (shouldFail) {
        throw new Error('server exploded');
      }

      return mockLibrarySearchResponse;
    });

    renderLibrarySearchResultDialog();

    expect(await screen.findByText('도서관 검색 결과를 불러오지 못했어요')).toBeInTheDocument();
    expect(screen.getByRole('button', {name: '다시 시도'})).toBeInTheDocument();

    shouldFail = false;
    await user.click(screen.getByRole('button', {name: '다시 시도'}));

    expect(await screen.findByText('총 12개의 도서관을 검색했어요.')).toBeInTheDocument();
  });

  it('닫기 버튼을 누르면 onOpenChange(false)를 호출한다', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <AppProvider>
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
        />
      </AppProvider>,
    );

    await user.click(await screen.findByRole('button', {name: '닫기'}));

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it('open이 true여도 params나 selectedBook이 없으면 렌더링하지 않는다', () => {
    const {rerender} = render(
      <AppProvider>
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
        />
      </AppProvider>,
    );

    expect(screen.queryByRole('dialog', {name: '도서관 검색 결과'})).not.toBeInTheDocument();

    rerender(
      <AppProvider>
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
        />
      </AppProvider>,
    );

    expect(screen.queryByRole('dialog', {name: '도서관 검색 결과'})).not.toBeInTheDocument();
  });
});
