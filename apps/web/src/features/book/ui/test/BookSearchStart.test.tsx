import {render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {BookSearchStart} from '@/features/book';

describe('BookSearchStart', () => {
  it('public API로 렌더링되고 기본 검색 시작 shell을 보여준다', () => {
    const onSubmitSearch = vi.fn();

    render(<BookSearchStart onSubmitSearch={onSubmitSearch} />);

    expect(screen.getByRole('heading', {level: 2, name: '도서 검색 시작'})).toBeInTheDocument();
    expect(screen.getByRole('form', {name: '도서 검색 시작'})).toBeInTheDocument();
    expect(screen.getByText('검색 기준: 책 제목')).toBeInTheDocument();
    expect(screen.getByRole('textbox', {name: '검색어'})).toHaveValue('');
    expect(screen.getByRole('button', {name: '검색 시작'})).toBeDisabled();
    expect(onSubmitSearch).not.toHaveBeenCalled();
  });
});
