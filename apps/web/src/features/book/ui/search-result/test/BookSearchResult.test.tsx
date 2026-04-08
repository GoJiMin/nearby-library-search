import {render, screen, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type {ReactElement} from 'react';
import {MemoryRouter} from 'react-router-dom';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {BookSearchResult} from '@/features/book';

const {mockBookSearchResponse, mockUseGetSearchBooks} = vi.hoisted(() => ({
  mockBookSearchResponse: {
    items: [
      {
        author: '이민진',
        detailUrl: null,
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
});

function createPageHref(page: number) {
  return `/books?title=${encodeURIComponent('파친코')}&page=${page}`;
}

function renderBookSearchResult(ui: ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('BookSearchResult', () => {
  it('책 제목 검색 params로 결과 검색 바를 초기화한다', () => {
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

  it('저자명 검색 params로 결과 검색 바를 초기화한다', () => {
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

  it('결과 요약과 단일 컬럼 결과 리스트를 렌더링한다', () => {
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
    expect(screen.getByRole('heading', {level: 2, name: '파친코'})).toBeInTheDocument();
    expect(screen.getByRole('heading', {level: 2, name: '아몬드'})).toBeInTheDocument();
    expect(screen.getByRole('heading', {level: 2, name: '채식주의자'})).toBeInTheDocument();
    expect(screen.getByText('이민진')).toBeInTheDocument();
    expect(screen.getByText('손원평')).toBeInTheDocument();
  });

  it('카드 메타 정보 우선순위와 필드 숨김 규칙을 따른다', () => {
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

  it('텍스트 액션 버튼을 메타 정보 아래에 렌더링하고 올바른 handoff payload를 전달한다', async () => {
    const user = userEvent.setup();
    const onOpenBookDetail = vi.fn();
    const onSelectBook = vi.fn();

    renderBookSearchResult(
      <BookSearchResult
        createPageHref={createPageHref}
        onOpenBookDetail={onOpenBookDetail}
        onSelectBook={onSelectBook}
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

    expect(onOpenBookDetail).not.toHaveBeenCalled();
    expect(onSelectBook).not.toHaveBeenCalled();

    await user.click(detailButton);
    await user.click(selectButton);

    expect(onOpenBookDetail).toHaveBeenCalledTimes(1);
    expect(onOpenBookDetail).toHaveBeenCalledWith({
      isbn13: '9788954682155',
    });
    expect(onSelectBook).toHaveBeenCalledTimes(1);
    expect(onSelectBook).toHaveBeenCalledWith({
      author: '이민진',
      isbn13: '9788954682155',
      title: '파친코',
    });
  });

  it('탭 전환 시 입력값을 유지한다', async () => {
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

    expect(screen.getByPlaceholderText('찾고 싶은 저자명을 입력해주세요')).toHaveValue('채식주의자');

    await user.click(screen.getByRole('tab', {name: '책 제목'}));

    expect(screen.getByPlaceholderText('찾고 싶은 책 제목을 입력해주세요')).toHaveValue('채식주의자');
  });

  it('재검색 제출 시 page를 1로 리셋한 canonical payload를 전달한다', async () => {
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

  it('전체 페이지 수와 현재 페이지에 맞는 페이지네이션을 렌더링한다', () => {
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
});
