import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it, vi} from 'vitest';
import {MAX_BOOK_SEARCH_TERM_LENGTH} from '@/entities/book';
import {BookSearchStart} from '@/features/book-search';

describe('BookSearchStart', () => {
  it('처음 열면 책 제목으로 검색할 수 있다', () => {
    const onSubmitSearch = vi.fn();

    render(<BookSearchStart onSubmitSearch={onSubmitSearch} />);

    expect(screen.getByRole('form', {name: '도서 검색 시작'})).toBeInTheDocument();
    expect(screen.getByRole('tablist', {name: '검색 기준 선택'})).toBeInTheDocument();
    expect(screen.getByRole('tab', {name: '책 제목'})).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', {name: '저자명'})).toHaveAttribute('aria-selected', 'false');

    const input = screen.getByPlaceholderText('찾고 싶은 책 제목을 입력해주세요');

    expect(input).toHaveValue('');
    expect(input).toHaveProperty('maxLength', MAX_BOOK_SEARCH_TERM_LENGTH);
    expect(screen.getByRole('button', {name: '검색'})).toBeDisabled();
    expect(screen.getByText(`0 / ${MAX_BOOK_SEARCH_TERM_LENGTH}`)).toBeInTheDocument();
    expect(onSubmitSearch).not.toHaveBeenCalled();
  });

  it('검색 기준을 바꿔도 입력한 내용을 다시 이어서 볼 수 있다', async () => {
    const user = userEvent.setup();

    render(<BookSearchStart onSubmitSearch={vi.fn()} />);

    const titleTab = screen.getByRole('tab', {name: '책 제목'});
    const authorTab = screen.getByRole('tab', {name: '저자명'});
    const input = screen.getByPlaceholderText('찾고 싶은 책 제목을 입력해주세요');

    await user.type(input, '파친코');
    await user.click(authorTab);

    expect(authorTab).toHaveAttribute('aria-selected', 'true');
    expect(titleTab).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByPlaceholderText('찾고 싶은 저자명을 입력해주세요')).toHaveValue('');

    await user.type(screen.getByPlaceholderText('찾고 싶은 저자명을 입력해주세요'), '한강');

    await user.click(titleTab);

    expect(titleTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByPlaceholderText('찾고 싶은 책 제목을 입력해주세요')).toHaveValue('파친코');

    await user.click(authorTab);

    expect(screen.getByPlaceholderText('찾고 싶은 저자명을 입력해주세요')).toHaveValue('한강');
  });

  it('키보드로 검색 기준을 바꿀 수 있다', async () => {
    const user = userEvent.setup();

    render(<BookSearchStart onSubmitSearch={vi.fn()} />);

    const titleTab = screen.getByRole('tab', {name: '책 제목'});
    const authorTab = screen.getByRole('tab', {name: '저자명'});

    titleTab.focus();
    expect(titleTab).toHaveFocus();

    await user.keyboard('{ArrowRight}');
    expect(authorTab).toHaveFocus();
    expect(authorTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByPlaceholderText('찾고 싶은 저자명을 입력해주세요')).toBeInTheDocument();

    await user.keyboard('{Home}');
    expect(titleTab).toHaveFocus();
    expect(titleTab).toHaveAttribute('aria-selected', 'true');

    await user.keyboard('{End}');
    expect(authorTab).toHaveFocus();
    expect(authorTab).toHaveAttribute('aria-selected', 'true');
  });

  it('키보드로 검색 기준, 입력창, 검색 버튼까지 차례로 이동할 수 있다', async () => {
    const user = userEvent.setup();

    render(<BookSearchStart onSubmitSearch={vi.fn()} />);

    await user.tab();
    expect(screen.getByRole('tab', {name: '책 제목'})).toHaveFocus();

    await user.tab();
    expect(screen.getByRole('textbox')).toHaveFocus();

    await user.type(screen.getByRole('textbox'), '파친코');

    await user.tab();
    expect(screen.getByRole('button', {name: '검색'})).toHaveFocus();
  });

  it('공백만 입력하면 검색할 수 없다', async () => {
    const user = userEvent.setup();

    render(<BookSearchStart onSubmitSearch={vi.fn()} />);

    await user.type(screen.getByRole('textbox'), '   ');

    expect(screen.getByRole('button', {name: '검색'})).toBeDisabled();
  });

  it('검색어를 입력하면 검색할 수 있고 글자 수를 볼 수 있다', async () => {
    const user = userEvent.setup();

    render(<BookSearchStart onSubmitSearch={vi.fn()} />);

    await user.type(screen.getByRole('textbox'), '파친코');

    expect(screen.getByRole('button', {name: '검색'})).toBeEnabled();
    expect(screen.getByText(`3 / ${MAX_BOOK_SEARCH_TERM_LENGTH}`)).toBeInTheDocument();
  });

  it('책 제목으로 검색을 시작할 수 있다', async () => {
    const user = userEvent.setup();
    const onSubmitSearch = vi.fn();

    render(<BookSearchStart onSubmitSearch={onSubmitSearch} />);

    await user.type(screen.getByRole('textbox'), '파친코');
    await user.click(screen.getByRole('button', {name: '검색'}));

    expect(onSubmitSearch).toHaveBeenCalledTimes(1);
    expect(onSubmitSearch).toHaveBeenCalledWith({
      page: 1,
      title: '파친코',
    });
  });

  it('저자명으로도 검색을 시작할 수 있다', async () => {
    const user = userEvent.setup();
    const onSubmitSearch = vi.fn();

    render(<BookSearchStart onSubmitSearch={onSubmitSearch} />);

    await user.click(screen.getByRole('tab', {name: '저자명'}));
    await user.type(screen.getByPlaceholderText('찾고 싶은 저자명을 입력해주세요'), '한강{enter}');

    expect(onSubmitSearch).toHaveBeenCalledTimes(1);
    expect(onSubmitSearch).toHaveBeenCalledWith({
      author: '한강',
      page: 1,
    });
  });
});
