import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {BookSearchResultScreen} from '@/features/book';

describe('BookSearchResultScreen', () => {
  it('책 제목 검색 params로 결과 화면 shell을 렌더링한다', () => {
    render(
      <BookSearchResultScreen
        params={{
          page: 2,
          title: '파친코',
        }}
      />,
    );

    expect(screen.getByRole('heading', {level: 1, name: '검색 결과'})).toBeInTheDocument();
    expect(screen.getByLabelText('현재 도서 검색 상태')).toBeInTheDocument();
    expect(screen.getByText('책 제목')).toBeInTheDocument();
    expect(screen.getByText('파친코')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('저자명 검색 params로 결과 화면 shell을 렌더링한다', () => {
    render(
      <BookSearchResultScreen
        params={{
          author: '한강',
          page: 1,
        }}
      />,
    );

    expect(screen.getByText('저자명')).toBeInTheDocument();
    expect(screen.getByText('한강')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });
});
