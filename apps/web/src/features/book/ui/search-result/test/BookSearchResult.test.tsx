import {render, screen, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type {ReactElement} from 'react';
import {MemoryRouter} from 'react-router-dom';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {BookSearchResult, useBookDetailDialogStore} from '@/features/book';
import {useFindLibraryStore} from '@/features/find-library';
import {RequestGetError} from '@/shared/request';

const {mockBookSearchResponse, mockUseGetSearchBooks} = vi.hoisted(() => ({
  mockBookSearchResponse: {
    items: [
      {
        author: '이민진',
        detailUrl: 'https://www.nl.go.kr/search/bookDetail.do?isbn=9788954682155',
        imageUrl: 'https://example.com/books/pachinko.jpg',
        isbn13: '9788954682155',
        loanCount: 12,
        publicationYear: '2018',
        publisher: '문학사상',
        title: '파친코',
      },
      {
        author: '손원평',
        detailUrl: null,
        imageUrl: null,
        isbn13: '9791196447182',
        loanCount: null,
        publicationYear: null,
        publisher: '창비',
        title: '아몬드',
      },
      {
        author: '한강',
        detailUrl: null,
        imageUrl: null,
        isbn13: '9788936434124',
        loanCount: 7,
        publicationYear: '2007',
        publisher: null,
        title: '채식주의자',
      },
    ],
    totalCount: 12,
  },
  mockUseGetSearchBooks: vi.fn(),
}));

vi.mock('@/entities/book', async importOriginal => {
  const actual = await importOriginal<typeof import('@/entities/book')>();

  return {
    ...actual,
    useGetSearchBooks: mockUseGetSearchBooks,
  };
});

beforeEach(() => {
  mockUseGetSearchBooks.mockReturnValue(mockBookSearchResponse);
  useBookDetailDialogStore.getState().resetBookDetailDialog();
  useFindLibraryStore.getState().resetFindLibraryFlow();
});

function createPageHref(page: number) {
  return `/books?title=${encodeURIComponent('파친코')}&page=${page}`;
}

function renderBookSearchResult(ui: ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('BookSearchResult', () => {
  it('결과를 불러오는 동안에도 다시 검색할 수 있다', async () => {
    const pendingPromise = new Promise(() => {});

    mockUseGetSearchBooks.mockImplementation(() => {
      throw pendingPromise;
    });

    renderBookSearchResult(
      <BookSearchResult
        createPageHref={createPageHref}
        onSubmitSearch={vi.fn()}
        params={{
          page: 2,
          title: '파친코',
        }}
      />,
    );

    expect(screen.getByRole('form', {name: '도서 결과 재검색'})).toBeInTheDocument();
    expect(await screen.findByRole('heading', {level: 1, name: '파친코 검색 결과를 불러오는 중이에요.'})).toBeInTheDocument();

    const loadingList = screen.getByRole('list', {name: '도서 검색 결과 로딩 목록'});

    expect(loadingList).toBeInTheDocument();
    expect(within(loadingList).getAllByRole('listitem')).toHaveLength(5);
  });

  it('책 제목으로 검색한 결과를 다시 확인할 수 있다', () => {
    renderBookSearchResult(
      <BookSearchResult
        createPageHref={createPageHref}
        onSubmitSearch={vi.fn()}
        params={{
          page: 2,
          title: '파친코',
        }}
      />,
    );

    expect(screen.getByRole('region', {name: '도서 검색 결과 화면'})).toBeInTheDocument();
    expect(screen.getByRole('form', {name: '도서 결과 재검색'})).toBeInTheDocument();
    expect(screen.getByRole('tab', {name: '책 제목'})).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', {name: '저자명'})).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByPlaceholderText('찾고 싶은 책 제목을 입력해주세요')).toHaveValue('파친코');
    expect(screen.getByRole('heading', {level: 1, name: '파친코에 대한 12개의 검색 결과가 있습니다.'})).toBeInTheDocument();
    expect(screen.queryByRole('heading', {name: '검색 결과'})).not.toBeInTheDocument();
  });

  it('저자명으로 검색한 결과를 다시 확인할 수 있다', () => {
    renderBookSearchResult(
      <BookSearchResult
        createPageHref={page => `/books?author=${encodeURIComponent('한강')}&page=${page}`}
        onSubmitSearch={vi.fn()}
        params={{
          author: '한강',
          page: 1,
        }}
      />,
    );

    expect(screen.getByRole('tab', {name: '저자명'})).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByPlaceholderText('찾고 싶은 저자명을 입력해주세요')).toHaveValue('한강');
  });

  it('검색한 책 목록과 요약을 함께 볼 수 있다', () => {
    renderBookSearchResult(
      <BookSearchResult
        createPageHref={createPageHref}
        onSubmitSearch={vi.fn()}
        params={{
          page: 1,
          title: '파친코',
        }}
      />,
    );

    expect(screen.getByRole('list', {name: '도서 검색 결과 목록'})).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(screen.getByRole('heading', {level: 3, name: '파친코'})).toBeInTheDocument();
    expect(screen.getByRole('heading', {level: 3, name: '아몬드'})).toBeInTheDocument();
    expect(screen.getByRole('heading', {level: 3, name: '채식주의자'})).toBeInTheDocument();
    expect(screen.getByText('이민진')).toBeInTheDocument();
    expect(screen.getByText('손원평')).toBeInTheDocument();
  });

  it('책마다 준비된 정보만 자연스럽게 보여준다', () => {
    renderBookSearchResult(
      <BookSearchResult
        createPageHref={createPageHref}
        onSubmitSearch={vi.fn()}
        params={{
          page: 1,
          title: '파친코',
        }}
      />,
    );

    const [firstItem, secondItem, thirdItem] = screen.getAllByRole('listitem');

    expect(within(firstItem).getByRole('img', {name: '파친코 표지 이미지'})).toBeInTheDocument();
    expect(within(firstItem).getByText('문학사상, 2018')).toBeInTheDocument();
    expect(within(firstItem).getByText('ISBN: 9788954682155')).toBeInTheDocument();
    expect(within(firstItem).getByText('총 대출 12건')).toBeInTheDocument();

    expect(within(secondItem).getByRole('img', {name: '아몬드 표지 없음'})).toBeInTheDocument();
    expect(within(secondItem).getByText('창비')).toBeInTheDocument();
    expect(within(secondItem).getByText('ISBN: 9791196447182')).toBeInTheDocument();
    expect(within(secondItem).queryByText(/^총 대출 /)).not.toBeInTheDocument();

    expect(within(thirdItem).getByRole('img', {name: '채식주의자 표지 없음'})).toBeInTheDocument();
    expect(within(thirdItem).getByText('2007')).toBeInTheDocument();
    expect(within(thirdItem).getByText('ISBN: 9788936434124')).toBeInTheDocument();
    expect(within(thirdItem).getByText('총 대출 7건')).toBeInTheDocument();
  });

  it('책 상세 보기와 소장 도서관 찾기를 바로 시작할 수 있다', async () => {
    const user = userEvent.setup();

    renderBookSearchResult(
      <BookSearchResult
        createPageHref={createPageHref}
        onSubmitSearch={vi.fn()}
        params={{
          page: 1,
          title: '파친코',
        }}
      />,
    );

    const [firstItem] = screen.getAllByRole('listitem');
    const firstItemQueries = within(firstItem);
    const detailButton = firstItemQueries.getByRole('button', {name: '상세 보기'});
    const selectButton = firstItemQueries.getByRole('button', {name: '소장 도서관 찾기'});

    expect(useBookDetailDialogStore.getState().selectedBookDetail).toBeNull();
    expect(useFindLibraryStore.getState().regionDialogBook).toBeNull();

    await user.click(detailButton);
    await user.click(selectButton);

    expect(useBookDetailDialogStore.getState().selectedBookDetail).toEqual({
      isbn13: '9788954682155',
    });
    expect(useFindLibraryStore.getState().regionDialogBook).toEqual({
      author: '이민진',
      isbn13: '9788954682155',
      title: '파친코',
    });
  });

  it('어떤 책이든 상세 보기를 시작할 수 있다', async () => {
    const user = userEvent.setup();

    renderBookSearchResult(
      <BookSearchResult
        createPageHref={createPageHref}
        onSubmitSearch={vi.fn()}
        params={{
          page: 1,
          title: '파친코',
        }}
      />,
    );

    const [, secondItem] = screen.getAllByRole('listitem');

    await user.click(within(secondItem).getByRole('button', {name: '상세 보기'}));

    expect(useBookDetailDialogStore.getState().selectedBookDetail).toEqual({
      isbn13: '9791196447182',
    });
  });

  it('검색 기준을 바꿔도 입력한 내용을 다시 이어서 볼 수 있다', async () => {
    const user = userEvent.setup();

    renderBookSearchResult(
      <BookSearchResult
        createPageHref={createPageHref}
        onSubmitSearch={vi.fn()}
        params={{
          page: 3,
          title: '채식주의자',
        }}
      />,
    );

    await user.click(screen.getByRole('tab', {name: '저자명'}));

    expect(screen.getByPlaceholderText('찾고 싶은 저자명을 입력해주세요')).toHaveValue('');

    await user.type(screen.getByPlaceholderText('찾고 싶은 저자명을 입력해주세요'), '한강');

    await user.click(screen.getByRole('tab', {name: '책 제목'}));

    expect(screen.getByPlaceholderText('찾고 싶은 책 제목을 입력해주세요')).toHaveValue('채식주의자');

    await user.click(screen.getByRole('tab', {name: '저자명'}));

    expect(screen.getByPlaceholderText('찾고 싶은 저자명을 입력해주세요')).toHaveValue('한강');
  });

  it('다시 검색하면 첫 페이지부터 결과를 본다', async () => {
    const user = userEvent.setup();
    const onSubmitSearch = vi.fn();

    renderBookSearchResult(
      <BookSearchResult
        createPageHref={createPageHref}
        onSubmitSearch={onSubmitSearch}
        params={{
          page: 2,
          title: '파친코',
        }}
      />,
    );

    const input = screen.getByRole('textbox');

    await user.clear(input);
    await user.type(input, '아몬드');
    await user.click(screen.getByRole('button', {name: '검색'}));

    expect(onSubmitSearch).toHaveBeenCalledTimes(1);
    expect(onSubmitSearch).toHaveBeenCalledWith({
      page: 1,
      title: '아몬드',
    });
  });

  it('찾는 책이 없으면 다시 검색할 수 있는 안내를 보여준다', () => {
    mockUseGetSearchBooks.mockReturnValueOnce({
      items: [],
      totalCount: 0,
    });

    renderBookSearchResult(
      <BookSearchResult
        createPageHref={createPageHref}
        onSubmitSearch={vi.fn()}
        params={{
          page: 1,
          title: '없는 책',
        }}
      />,
    );

    expect(screen.getByRole('heading', {level: 1, name: '없는 책에 대한 0개의 검색 결과가 있습니다.'})).toBeInTheDocument();
    expect(screen.getByText('검색 결과가 없어요. 검색어를 조금 바꿔 다시 검색해보세요.')).toBeInTheDocument();
    expect(screen.queryByRole('list', {name: '도서 검색 결과 목록'})).not.toBeInTheDocument();
    expect(screen.queryByRole('navigation', {name: '도서 검색 결과 페이지네이션'})).not.toBeInTheDocument();
  });

  it('검색 결과를 불러오지 못하면 다시 시도할 수 있는 안내를 보여준다', async () => {
    mockUseGetSearchBooks.mockImplementation(() => {
      throw new RequestGetError({
        endpoint: '/api/books/search?title=파친코&page=1',
        message: '도서 검색 정보를 불러오지 못했습니다.',
        method: 'GET',
        name: 'BOOK_SEARCH_UPSTREAM_ERROR',
        requestBody: null,
        status: 502,
      });
    });

    renderBookSearchResult(
      <BookSearchResult
        createPageHref={createPageHref}
        onSubmitSearch={vi.fn()}
        params={{
          page: 1,
          title: '파친코',
        }}
      />,
    );

    expect(screen.getByRole('form', {name: '도서 결과 재검색'})).toBeInTheDocument();
    expect(await screen.findByRole('heading', {level: 1, name: '데이터를 불러오지 못했어요'})).toBeInTheDocument();
    expect(screen.getByText('조용한 서고에서 길을 잃은 것 같습니다.')).toBeInTheDocument();
    expect(screen.getByText('도서 검색 서버와 연결이 원활하지 않아요. 잠시 후 다시 시도해주세요.')).toBeInTheDocument();
    expect(screen.getByRole('button', {name: '다시 시도'})).toBeInTheDocument();
  });

  it('검색 결과가 많으면 페이지를 이동할 수 있다', () => {
    mockUseGetSearchBooks.mockReturnValueOnce({
      ...mockBookSearchResponse,
      totalCount: 42,
    });

    renderBookSearchResult(
      <BookSearchResult
        createPageHref={createPageHref}
        onSubmitSearch={vi.fn()}
        params={{
          page: 2,
          title: '파친코',
        }}
      />,
    );

    expect(screen.getByRole('navigation', {name: '도서 검색 결과 페이지네이션'})).toBeInTheDocument();
    expect(screen.getByRole('link', {name: '이전 페이지'})).toHaveAttribute('href', '/books?title=%ED%8C%8C%EC%B9%9C%EC%BD%94&page=1');
    expect(screen.getByRole('link', {name: '다음 페이지'})).toHaveAttribute('href', '/books?title=%ED%8C%8C%EC%B9%9C%EC%BD%94&page=3');
    expect(screen.getByRole('link', {name: '1페이지'})).toHaveAttribute('href', '/books?title=%ED%8C%8C%EC%B9%9C%EC%BD%94&page=1');
    expect(screen.getByText('2')).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', {name: '3페이지'})).toHaveAttribute('href', '/books?title=%ED%8C%8C%EC%B9%9C%EC%BD%94&page=3');
    expect(screen.getByRole('link', {name: '5페이지'})).toHaveAttribute('href', '/books?title=%ED%8C%8C%EC%B9%9C%EC%BD%94&page=5');
  });

  it('검색 결과가 한 페이지면 페이지 이동을 보여주지 않는다', () => {
    mockUseGetSearchBooks.mockReturnValueOnce({
      ...mockBookSearchResponse,
      totalCount: 10,
    });

    renderBookSearchResult(
      <BookSearchResult
        createPageHref={createPageHref}
        onSubmitSearch={vi.fn()}
        params={{
          page: 1,
          title: '파친코',
        }}
      />,
    );

    expect(screen.queryByRole('navigation', {name: '도서 검색 결과 페이지네이션'})).not.toBeInTheDocument();
  });

  it('첫 페이지에서는 이전 페이지로 이동할 수 없다', () => {
    mockUseGetSearchBooks.mockReturnValueOnce({
      ...mockBookSearchResponse,
      totalCount: 100,
    });

    renderBookSearchResult(
      <BookSearchResult
        createPageHref={createPageHref}
        onSubmitSearch={vi.fn()}
        params={{
          page: 1,
          title: '파친코',
        }}
      />,
    );

    const pagination = screen.getByRole('navigation', {name: '도서 검색 결과 페이지네이션'});

    expect(within(pagination).getByLabelText('이전 페이지')).toHaveAttribute('aria-disabled', 'true');
    expect(within(pagination).getByRole('link', {name: '다음 페이지'})).toHaveAttribute(
      'href',
      '/books?title=%ED%8C%8C%EC%B9%9C%EC%BD%94&page=2',
    );
    expect(within(pagination).getAllByLabelText('페이지 생략')).toHaveLength(1);
    expect(within(pagination).getByText('1')).toHaveAttribute('aria-current', 'page');
    expect(within(pagination).getByRole('link', {name: '2페이지'})).toBeInTheDocument();
    expect(within(pagination).getByRole('link', {name: '3페이지'})).toBeInTheDocument();
    expect(within(pagination).getByRole('link', {name: '10페이지'})).toBeInTheDocument();
  });

  it('마지막 페이지에서는 다음 페이지로 이동할 수 없다', () => {
    mockUseGetSearchBooks.mockReturnValueOnce({
      ...mockBookSearchResponse,
      totalCount: 100,
    });

    renderBookSearchResult(
      <BookSearchResult
        createPageHref={page => `/books?title=${encodeURIComponent('파친코')}&page=${page}`}
        onSubmitSearch={vi.fn()}
        params={{
          page: 10,
          title: '파친코',
        }}
      />,
    );

    const pagination = screen.getByRole('navigation', {name: '도서 검색 결과 페이지네이션'});

    expect(within(pagination).getByRole('link', {name: '이전 페이지'})).toHaveAttribute(
      'href',
      '/books?title=%ED%8C%8C%EC%B9%9C%EC%BD%94&page=9',
    );
    expect(within(pagination).getByLabelText('다음 페이지')).toHaveAttribute('aria-disabled', 'true');
    expect(within(pagination).getAllByLabelText('페이지 생략')).toHaveLength(1);
    expect(within(pagination).getByRole('link', {name: '8페이지'})).toBeInTheDocument();
    expect(within(pagination).getByRole('link', {name: '9페이지'})).toBeInTheDocument();
    expect(within(pagination).getByText('10')).toHaveAttribute('aria-current', 'page');
  });

  it('중간 페이지에서는 앞뒤 페이지를 함께 볼 수 있다', () => {
    mockUseGetSearchBooks.mockReturnValueOnce({
      ...mockBookSearchResponse,
      totalCount: 100,
    });

    renderBookSearchResult(
      <BookSearchResult
        createPageHref={createPageHref}
        onSubmitSearch={vi.fn()}
        params={{
          page: 5,
          title: '파친코',
        }}
      />,
    );

    const pagination = screen.getByRole('navigation', {name: '도서 검색 결과 페이지네이션'});

    expect(within(pagination).getAllByLabelText('페이지 생략')).toHaveLength(2);
    expect(within(pagination).getByRole('link', {name: '1페이지'})).toBeInTheDocument();
    expect(within(pagination).getByRole('link', {name: '4페이지'})).toBeInTheDocument();
    expect(within(pagination).getByText('5')).toHaveAttribute('aria-current', 'page');
    expect(within(pagination).getByRole('link', {name: '6페이지'})).toBeInTheDocument();
    expect(within(pagination).getByRole('link', {name: '10페이지'})).toBeInTheDocument();
  });
});
