import {render, screen, within} from '@testing-library/react';
import {beforeEach, describe, expect, it} from 'vitest';
import {useFindLibraryStore} from '@/features/find-library';
import {LibrarySearchResultPagination} from '../LibrarySearchResultPagination';

function renderPagination({page, pageSize = 10, totalCount}: {page: number; pageSize?: number; totalCount: number}) {
  return render(<LibrarySearchResultPagination page={page} pageSize={pageSize} totalCount={totalCount} />);
}

describe('LibrarySearchResultPagination', () => {
  beforeEach(() => {
    useFindLibraryStore.getState().resetFindLibraryFlow();
  });

  it('총 페이지가 5 이하면 모든 페이지를 표시한다', () => {
    renderPagination({
      page: 2,
      totalCount: 50,
    });

    const pagination = screen.getByRole('navigation', {name: '도서관 검색 결과 페이지네이션'});

    expect(within(pagination).getByRole('button', {name: '1페이지'})).toBeInTheDocument();
    expect(within(pagination).getByText('2')).toHaveAttribute('aria-current', 'page');
    expect(within(pagination).getByRole('button', {name: '3페이지'})).toBeInTheDocument();
    expect(within(pagination).getByRole('button', {name: '4페이지'})).toBeInTheDocument();
    expect(within(pagination).getByRole('button', {name: '5페이지'})).toBeInTheDocument();
    expect(within(pagination).queryByLabelText('페이지 생략')).not.toBeInTheDocument();
  });

  it('첫 구간에서는 1 2 3 ... 마지막 페이지를 표시한다', () => {
    renderPagination({
      page: 1,
      totalCount: 100,
    });

    const pagination = screen.getByRole('navigation', {name: '도서관 검색 결과 페이지네이션'});

    expect(within(pagination).getByText('1')).toHaveAttribute('aria-current', 'page');
    expect(within(pagination).getByRole('button', {name: '2페이지'})).toBeInTheDocument();
    expect(within(pagination).getByRole('button', {name: '3페이지'})).toBeInTheDocument();
    expect(within(pagination).getByRole('button', {name: '10페이지'})).toBeInTheDocument();
    expect(within(pagination).getAllByLabelText('페이지 생략')).toHaveLength(1);
  });

  it('중간 구간에서는 1 ... 현재 ... 마지막 페이지를 표시한다', () => {
    renderPagination({
      page: 5,
      totalCount: 100,
    });

    const pagination = screen.getByRole('navigation', {name: '도서관 검색 결과 페이지네이션'});

    expect(within(pagination).getByRole('button', {name: '1페이지'})).toBeInTheDocument();
    expect(within(pagination).getByText('5')).toHaveAttribute('aria-current', 'page');
    expect(within(pagination).getByRole('button', {name: '10페이지'})).toBeInTheDocument();
    expect(within(pagination).getAllByLabelText('페이지 생략')).toHaveLength(2);
    expect(within(pagination).queryByRole('button', {name: '4페이지'})).not.toBeInTheDocument();
    expect(within(pagination).queryByRole('button', {name: '6페이지'})).not.toBeInTheDocument();
  });

  it('마지막 구간에서는 1 ... 마지막 3개 페이지를 표시한다', () => {
    renderPagination({
      page: 10,
      totalCount: 100,
    });

    const pagination = screen.getByRole('navigation', {name: '도서관 검색 결과 페이지네이션'});

    expect(within(pagination).getByRole('button', {name: '1페이지'})).toBeInTheDocument();
    expect(within(pagination).getAllByLabelText('페이지 생략')).toHaveLength(1);
    expect(within(pagination).getByRole('button', {name: '8페이지'})).toBeInTheDocument();
    expect(within(pagination).getByRole('button', {name: '9페이지'})).toBeInTheDocument();
    expect(within(pagination).getByText('10')).toHaveAttribute('aria-current', 'page');
  });
});
