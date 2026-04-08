import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {BookSearchResult} from '@/features/book';

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
      {
        author: '손원평',
        detailUrl: null,
        imageUrl: null,
        isbn13: '9791196447182',
        loanCount: 8,
        publicationYear: '2017',
        publisher: '창비',
        title: '아몬드',
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

describe('BookSearchResult', () => {
  it('책 제목 검색 params로 결과 검색 바를 초기화한다', () => {
    render(
      <BookSearchResult
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
    expect(screen.getByRole('heading', {level: 1, name: '"파친코"에 대한 12개의 검색 결과가 있습니다.'})).toBeInTheDocument();
    expect(screen.queryByRole('heading', {name: '검색 결과'})).not.toBeInTheDocument();
  });

  it('저자명 검색 params로 결과 검색 바를 초기화한다', () => {
    render(
      <BookSearchResult
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
    render(
      <BookSearchResult
        onSubmitSearch={vi.fn()}
        params={{
          page: 1,
          title: '파친코',
        }}
      />,
    );

    expect(screen.getByRole('list', {name: '도서 검색 결과 목록'})).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByRole('heading', {level: 2, name: '파친코'})).toBeInTheDocument();
    expect(screen.getByRole('heading', {level: 2, name: '아몬드'})).toBeInTheDocument();
    expect(screen.getByText('이민진')).toBeInTheDocument();
    expect(screen.getByText('손원평')).toBeInTheDocument();
  });

  it('탭 전환 시 입력값을 유지한다', async () => {
    const user = userEvent.setup();

    render(
      <BookSearchResult
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

    render(
      <BookSearchResult
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
});
