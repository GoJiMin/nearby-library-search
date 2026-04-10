import {act, render, screen, waitFor, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {createMemoryRouter, RouterProvider} from 'react-router-dom';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {AppProvider} from '@/app/providers';
import {routes} from './router';

const {mockBookSearchResponse, mockUseGetSearchBooks} = vi.hoisted(() => ({
  mockBookSearchResponse: {
    items: [
      {
        author: '이민진',
        detailUrl: null,
        imageUrl: null,
        isbn13: '9788954682155',
        loanCount: 12,
        publicationYear: '2018',
        publisher: '문학사상',
        title: '파친코',
      },
    ],
    totalCount: 12,
  },
  mockUseGetSearchBooks: vi.fn(),
}));

const {mockLibrarySearchResponse, mockSecondPageLibrarySearchResponse, mockUseGetSearchLibraries} = vi.hoisted(
  () => ({
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
  mockSecondPageLibrarySearchResponse: {
    detailRegion: '11140',
    isbn: '9788954682155',
    items: [
      {
        address: '서울특별시 마포구 독막로 11',
        closedDays: '매주 일요일',
        code: 'LIB0011',
        fax: null,
        homepage: null,
        latitude: 37.5491,
        longitude: 126.9132,
        name: '상수문화도서관',
        operatingTime: '08:00 - 18:00',
        phone: '02-7777-1111',
      },
      {
        address: '서울특별시 마포구 성지길 12',
        closedDays: '명절 휴관',
        code: 'LIB0012',
        fax: null,
        homepage: 'https://seongsan.example.com',
        latitude: 37.5631,
        longitude: 126.9084,
        name: '성산열람실',
        operatingTime: '11:00 - 21:00',
        phone: '02-8888-2222',
      },
    ],
    page: 2,
    pageSize: 10,
    region: '11',
    resultCount: 2,
    totalCount: 12,
  },
  mockUseGetSearchLibraries: vi.fn(),
}),
);

vi.mock('@/entities/book', async importOriginal => {
  const actual = await importOriginal<typeof import('@/entities/book')>();

  return {
    ...actual,
    useGetSearchBooks: mockUseGetSearchBooks,
  };
});

vi.mock('@/entities/library', async importOriginal => {
  const actual = await importOriginal<typeof import('@/entities/library')>();

  return {
    ...actual,
    useGetSearchLibraries: mockUseGetSearchLibraries,
  };
});

beforeEach(() => {
  mockUseGetSearchBooks.mockReset();
  mockUseGetSearchBooks.mockReturnValue(mockBookSearchResponse);
  mockUseGetSearchLibraries.mockReset();
  mockUseGetSearchLibraries.mockImplementation(params =>
    params.page === 2 ? mockSecondPageLibrarySearchResponse : mockLibrarySearchResponse,
  );
});

function renderRouter(initialEntries: string[]) {
  const router = createMemoryRouter(routes, {initialEntries});

  return {
    router,
    ...render(
      <AppProvider>
        <RouterProvider router={router} />
      </AppProvider>,
    ),
  };
}

describe('app router integration', () => {
  it('renders the home route with the app shell and search start feature', () => {
    renderRouter(['/']);

    expect(screen.getByRole('heading', {level: 1, name: /이 책,/})).toBeInTheDocument();
    expect(
      screen.getByText('궁금한 책의 제목이나 저자를 검색창에 입력해 보세요.', {exact: false}),
    ).toBeInTheDocument();
    expect(screen.getByRole('tablist', {name: '검색 기준 선택'})).toBeInTheDocument();
    expect(screen.getByPlaceholderText('찾고 싶은 책 제목을 입력해주세요')).toBeInTheDocument();
    expect(screen.getByRole('button', {name: '검색'})).toBeInTheDocument();
    expect(screen.queryByRole('link', {name: '메인으로'})).not.toBeInTheDocument();
  });

  it('navigates from the home route to the book result route after search submit', async () => {
    const user = userEvent.setup();
    const {router} = renderRouter(['/']);

    await user.type(screen.getByRole('textbox'), '파친코');
    await user.click(screen.getByRole('button', {name: '검색'}));

    expect(await screen.findByRole('form', {name: '도서 결과 재검색'})).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/books');
    expect(new URLSearchParams(router.state.location.search).get('title')).toBe('파친코');
    expect(new URLSearchParams(router.state.location.search).get('page')).toBe('1');
  });

  it('renders the book result route when the url has valid search params', () => {
    renderRouter(['/books?author=한강&page=2']);

    expect(screen.getByRole('link', {name: '메인으로'})).toHaveAttribute('href', '/');
    expect(screen.getByRole('region', {name: '도서 검색 결과 화면'})).toBeInTheDocument();
    expect(screen.getByRole('form', {name: '도서 결과 재검색'})).toBeInTheDocument();
    expect(screen.getByRole('tab', {name: '저자명'})).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByPlaceholderText('찾고 싶은 저자명을 입력해주세요')).toHaveValue('한강');
    expect(screen.getByRole('heading', {level: 1, name: '한강에 대한 12개의 검색 결과가 있습니다.'})).toBeInTheDocument();
  });

  it('updates the result route search params and resets page to 1 when re-searching', async () => {
    const user = userEvent.setup();
    const {router} = renderRouter(['/books?title=파친코&page=2']);

    const input = await screen.findByRole('textbox');

    await user.clear(input);
    await user.type(input, '채식주의자');
    await user.click(screen.getByRole('button', {name: '검색'}));

    expect(router.state.location.pathname).toBe('/books');
    expect(new URLSearchParams(router.state.location.search).get('title')).toBe('채식주의자');
    expect(new URLSearchParams(router.state.location.search).get('page')).toBe('1');
  });

  it('updates only the page search param when clicking pagination links and supports browser back', async () => {
    const user = userEvent.setup();
    const {router} = renderRouter(['/books?title=파친코&page=2']);

    await user.click(await screen.findByRole('link', {name: '1페이지'}));

    expect(router.state.location.pathname).toBe('/books');
    expect(new URLSearchParams(router.state.location.search).get('title')).toBe('파친코');
    expect(new URLSearchParams(router.state.location.search).get('page')).toBe('1');

    await act(async () => {
      await router.navigate(-1);
    });

    expect(new URLSearchParams(router.state.location.search).get('title')).toBe('파친코');
    expect(new URLSearchParams(router.state.location.search).get('page')).toBe('2');
    expect(
      within(screen.getByRole('navigation', {name: '도서 검색 결과 페이지네이션'})).getByText('2'),
    ).toHaveAttribute('aria-current', 'page');
  });

  it('moves forward and backward with previous/next pagination links while preserving the query', async () => {
    const user = userEvent.setup();
    const {router} = renderRouter(['/books?title=파친코&page=1']);

    await user.click(await screen.findByRole('link', {name: '다음 페이지'}));

    expect(router.state.location.pathname).toBe('/books');
    expect(new URLSearchParams(router.state.location.search).get('title')).toBe('파친코');
    expect(new URLSearchParams(router.state.location.search).get('page')).toBe('2');

    await user.click(await screen.findByRole('link', {name: '이전 페이지'}));

    expect(router.state.location.pathname).toBe('/books');
    expect(new URLSearchParams(router.state.location.search).get('title')).toBe('파친코');
    expect(new URLSearchParams(router.state.location.search).get('page')).toBe('1');
  });

  it('opens the region selection dialog when clicking the primary card CTA and closes it again', async () => {
    const user = userEvent.setup();

    renderRouter(['/books?title=파친코&page=1']);

    await user.click(await screen.findByRole('button', {name: '소장 도서관 찾기'}));

    expect(await screen.findByRole('dialog', {name: '검색 지역 선택'})).toBeInTheDocument();
    expect(screen.getByRole('heading', {name: '시/도'})).toBeInTheDocument();
    expect(screen.getByRole('heading', {name: '세부 지역'})).toBeInTheDocument();

    await user.click(screen.getByRole('button', {name: '닫기'}));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', {name: '검색 지역 선택'})).not.toBeInTheDocument();
    });
    expect(screen.getByRole('form', {name: '도서 결과 재검색'})).toBeInTheDocument();
  });

  it('restores the last confirmed region selection when reopening the dialog, even for a different book', async () => {
    const user = userEvent.setup();

    mockUseGetSearchBooks.mockReturnValue({
      items: [
        {
          author: '이민진',
          detailUrl: null,
          imageUrl: null,
          isbn13: '9788954682155',
          loanCount: 12,
          publicationYear: '2018',
          publisher: '문학사상',
          title: '파친코',
        },
        {
          author: '한강',
          detailUrl: null,
          imageUrl: null,
          isbn13: '9788936434124',
          loanCount: 8,
          publicationYear: '2007',
          publisher: '창비',
          title: '채식주의자',
        },
      ],
      totalCount: 2,
    });

    renderRouter(['/books?title=파친코&page=1']);

    const resultList = screen.getByRole('list', {name: '도서 검색 결과 목록'});
    const libraryButtons = within(resultList).getAllByRole('button', {name: '소장 도서관 찾기'});

    await user.click(libraryButtons[0]);
    await user.click(await screen.findByRole('button', {name: '서울'}));
    await user.click(screen.getByRole('button', {name: '마포구'}));
    await user.click(screen.getByRole('button', {name: '선택 완료'}));

    expect(await screen.findByRole('dialog', {name: '도서관 검색 결과'})).toBeInTheDocument();
    expect(screen.queryByRole('dialog', {name: '검색 지역 선택'})).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', {name: '닫기'}));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', {name: '도서관 검색 결과'})).not.toBeInTheDocument();
    });

    await user.click(libraryButtons[0]);

    expect(await screen.findByText('서울 > 마포구')).toBeInTheDocument();
    expect(screen.getByRole('button', {name: '서울'})).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', {name: '마포구'})).toHaveAttribute('aria-pressed', 'true');

    await user.click(screen.getByRole('button', {name: '부산'}));
    expect(screen.getByText('부산 전체')).toBeInTheDocument();

    await user.click(screen.getByRole('button', {name: '닫기'}));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', {name: '검색 지역 선택'})).not.toBeInTheDocument();
    });

    await user.click(libraryButtons[0]);

    expect(await screen.findByText('서울 > 마포구')).toBeInTheDocument();
    expect(screen.getByRole('button', {name: '서울'})).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', {name: '마포구'})).toHaveAttribute('aria-pressed', 'true');

    await user.click(screen.getByRole('button', {name: '닫기'}));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', {name: '검색 지역 선택'})).not.toBeInTheDocument();
    });

    await user.click(libraryButtons[1]);

    expect(await screen.findByText('서울 > 마포구')).toBeInTheDocument();
    expect(screen.getByRole('button', {name: '서울'})).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', {name: '마포구'})).toHaveAttribute('aria-pressed', 'true');
  });

  it('opens the library result dialog after confirming a region selection and closes it independently', async () => {
    const user = userEvent.setup();

    renderRouter(['/books?title=파친코&page=1']);

    await user.click(await screen.findByRole('button', {name: '소장 도서관 찾기'}));
    await user.click(await screen.findByRole('button', {name: '서울'}));
    await user.click(screen.getByRole('button', {name: '선택 완료'}));

    const libraryResultDialog = await screen.findByRole('dialog', {name: '도서관 검색 결과'});

    expect(libraryResultDialog).toBeInTheDocument();
    expect(screen.queryByRole('dialog', {name: '검색 지역 선택'})).not.toBeInTheDocument();
    expect(within(libraryResultDialog).getByRole('heading', {name: '검색 결과'})).toBeInTheDocument();
    expect(within(libraryResultDialog).getByText('총 12개의 도서관을 검색했어요.')).toBeInTheDocument();
    expect(within(libraryResultDialog).getByLabelText('검색 결과 목록 패널')).toBeInTheDocument();
    expect(within(libraryResultDialog).getByLabelText('도서관 지도 패널')).toBeInTheDocument();
    expect(within(libraryResultDialog).getByLabelText('선택된 도서관 정보 패널')).toBeInTheDocument();
    expect(within(libraryResultDialog).getByRole('button', {name: '대출 가능 여부 조회'})).toBeInTheDocument();

    const firstLibraryRow = within(libraryResultDialog).getByRole('button', {name: /마포중앙도서관/});
    const secondLibraryRow = within(libraryResultDialog).getByRole('button', {name: /합정열람실/});
    const detailPanel = within(libraryResultDialog).getByLabelText('선택된 도서관 정보 패널');

    expect(firstLibraryRow).toHaveAttribute('aria-pressed', 'true');
    expect(secondLibraryRow).toHaveAttribute('aria-pressed', 'false');
    expect(within(detailPanel).getByRole('heading', {name: '마포중앙도서관'})).toBeInTheDocument();
    expect(within(detailPanel).getByText('서울특별시 마포구 월드컵북로 1')).toBeInTheDocument();

    await user.click(secondLibraryRow);

    await waitFor(() => {
      expect(firstLibraryRow).toHaveAttribute('aria-pressed', 'false');
      expect(secondLibraryRow).toHaveAttribute('aria-pressed', 'true');
      expect(within(detailPanel).getByRole('heading', {name: '합정열람실'})).toBeInTheDocument();
      expect(within(detailPanel).getByText('서울특별시 마포구 양화로 2')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', {name: '닫기'}));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', {name: '도서관 검색 결과'})).not.toBeInTheDocument();
    });

    expect(screen.getByRole('form', {name: '도서 결과 재검색'})).toBeInTheDocument();
  });

  it('도서관 결과 페이지네이션을 바꾸면 새 페이지 첫 항목이 기본 선택되고 detail panel도 함께 갱신된다', async () => {
    const user = userEvent.setup();

    renderRouter(['/books?title=파친코&page=1']);

    await user.click(await screen.findByRole('button', {name: '소장 도서관 찾기'}));
    await user.click(await screen.findByRole('button', {name: '서울'}));
    await user.click(screen.getByRole('button', {name: '선택 완료'}));

    const libraryResultDialog = await screen.findByRole('dialog', {name: '도서관 검색 결과'});
    const pagination = within(libraryResultDialog).getByRole('navigation', {
      name: '도서관 검색 결과 페이지네이션',
    });

    expect(within(pagination).getByText('1')).toHaveAttribute('aria-current', 'page');

    await user.click(within(pagination).getByRole('button', {name: '2페이지'}));

    await waitFor(() => {
      expect(within(pagination).getByText('2')).toHaveAttribute('aria-current', 'page');
    });

    const detailPanel = within(libraryResultDialog).getByLabelText('선택된 도서관 정보 패널');
    const firstSecondPageRow = within(libraryResultDialog).getByRole('button', {name: /상수문화도서관/});
    const secondSecondPageRow = within(libraryResultDialog).getByRole('button', {name: /성산열람실/});

    expect(firstSecondPageRow).toHaveAttribute('aria-pressed', 'true');
    expect(secondSecondPageRow).toHaveAttribute('aria-pressed', 'false');
    expect(within(detailPanel).getByRole('heading', {name: '상수문화도서관'})).toBeInTheDocument();
    expect(within(detailPanel).getByText('서울특별시 마포구 독막로 11')).toBeInTheDocument();
  });

  it('library search가 비어 있으면 지역 다시 선택 CTA로 region dialog를 다시 연다', async () => {
    const user = userEvent.setup();

    mockUseGetSearchLibraries.mockReturnValue({
      isbn: '9788954682155',
      items: [],
      page: 1,
      pageSize: 10,
      region: '11',
      resultCount: 0,
      totalCount: 0,
    });

    renderRouter(['/books?title=파친코&page=1']);

    await user.click(await screen.findByRole('button', {name: '소장 도서관 찾기'}));
    await user.click(await screen.findByRole('button', {name: '서울'}));
    await user.click(screen.getByRole('button', {name: '선택 완료'}));

    expect(await screen.findByText('선택한 지역에서 소장 도서관을 찾지 못했어요')).toBeInTheDocument();

    await user.click(screen.getByRole('button', {name: '지역 다시 선택'}));

    expect(await screen.findByRole('dialog', {name: '검색 지역 선택'})).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByRole('dialog', {name: '도서관 검색 결과'})).not.toBeInTheDocument();
    });
  });

  it('library search가 비어 있으면 다른 책 다시 선택 CTA로 dialog만 닫는다', async () => {
    const user = userEvent.setup();

    mockUseGetSearchLibraries.mockReturnValue({
      isbn: '9788954682155',
      items: [],
      page: 1,
      pageSize: 10,
      region: '11',
      resultCount: 0,
      totalCount: 0,
    });

    renderRouter(['/books?title=파친코&page=1']);

    await user.click(await screen.findByRole('button', {name: '소장 도서관 찾기'}));
    await user.click(await screen.findByRole('button', {name: '서울'}));
    await user.click(screen.getByRole('button', {name: '선택 완료'}));

    expect(await screen.findByText('선택한 지역에서 소장 도서관을 찾지 못했어요')).toBeInTheDocument();

    await user.click(screen.getByRole('button', {name: '다른 책 다시 선택'}));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', {name: '도서관 검색 결과'})).not.toBeInTheDocument();
    });
    expect(screen.getByRole('form', {name: '도서 결과 재검색'})).toBeInTheDocument();
  });

  it('redirects the empty book result route to the home page', async () => {
    renderRouter(['/books']);

    expect(await screen.findByRole('heading', {level: 1, name: /이 책,/})).toBeInTheDocument();
    expect(screen.getByRole('tablist', {name: '검색 기준 선택'})).toBeInTheDocument();
  });

  it('renders an inline recovery state for invalid book result urls', () => {
    renderRouter(['/books?title=&page=abc']);

    expect(screen.getByRole('link', {name: '메인으로'})).toHaveAttribute('href', '/');
    expect(screen.getByRole('heading', {level: 1, name: '검색 결과를 불러올 수 없어요'})).toBeInTheDocument();
    expect(screen.getByRole('link', {name: '검색 다시 시작'})).toHaveAttribute('href', '/');
  });

  it('renders the not found route for an unknown path', () => {
    renderRouter(['/missing']);

    expect(screen.queryByRole('link', {name: '메인으로'})).not.toBeInTheDocument();
    expect(screen.getByRole('heading', {name: '페이지를 찾을 수 없어요'})).toBeInTheDocument();
    expect(screen.getByRole('link', {name: '홈으로 돌아가기'})).toHaveAttribute('href', '/');
  });
});
