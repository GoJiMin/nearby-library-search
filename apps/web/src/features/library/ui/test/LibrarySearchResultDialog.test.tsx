import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {AppProvider} from '@/app/providers';
import {LibrarySearchResultDialog} from '@/features/library';

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
