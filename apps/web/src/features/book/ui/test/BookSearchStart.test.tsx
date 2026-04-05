import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it, vi} from 'vitest';
import {BookSearchStart} from '@/features/book';

describe('BookSearchStart', () => {
  it('public API로 렌더링되고 기본 선택 탭을 보여준다', () => {
    const onSubmitSearch = vi.fn();

    render(<BookSearchStart onSubmitSearch={onSubmitSearch} />);

    expect(screen.getByRole('heading', {level: 2, name: '도서 검색 시작'})).toBeInTheDocument();
    expect(screen.getByRole('form', {name: '도서 검색 시작'})).toBeInTheDocument();
    expect(screen.getByRole('tablist', {name: '검색 기준 선택'})).toBeInTheDocument();
    expect(screen.getByRole('tab', {name: '책 제목'})).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', {name: '저자명'})).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByRole('textbox', {name: '검색어'})).toHaveValue('');
    expect(screen.getByRole('button', {name: '검색 시작'})).toBeDisabled();
    expect(onSubmitSearch).not.toHaveBeenCalled();
  });

  it('탭 전환 후에도 입력값을 유지한다', async () => {
    const user = userEvent.setup();

    render(<BookSearchStart onSubmitSearch={vi.fn()} />);

    const input = screen.getByRole('textbox', {name: '검색어'});
    const titleTab = screen.getByRole('tab', {name: '책 제목'});
    const authorTab = screen.getByRole('tab', {name: '저자명'});

    await user.type(input, '파친코');
    await user.click(authorTab);

    expect(authorTab).toHaveAttribute('aria-selected', 'true');
    expect(titleTab).toHaveAttribute('aria-selected', 'false');
    expect(input).toHaveValue('파친코');

    await user.click(titleTab);

    expect(titleTab).toHaveAttribute('aria-selected', 'true');
    expect(authorTab).toHaveAttribute('aria-selected', 'false');
    expect(input).toHaveValue('파친코');
  });
});
