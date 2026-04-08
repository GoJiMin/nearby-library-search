import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it, vi} from 'vitest';
import {MAX_BOOK_SEARCH_TERM_LENGTH} from '@/entities/book';
import {BookSearchStart} from '@/features/book';

describe('BookSearchStart', () => {
  it('기본 렌더에서 title 탭과 빈 검색 입력을 보여준다', () => {
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

  it('탭 전환 시 모드별 마지막 입력값을 따로 기억한다', async () => {
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

  it('키보드로 탭을 이동하고 선택 상태를 바꿀 수 있다', async () => {
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

  it('키보드 탭 순서로 세그먼트 탭, 입력, CTA에 접근할 수 있다', async () => {
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

  it('whitespace-only 입력에서는 CTA를 비활성 상태로 유지한다', async () => {
    const user = userEvent.setup();

    render(<BookSearchStart onSubmitSearch={vi.fn()} />);

    await user.type(screen.getByRole('textbox'), '   ');

    expect(screen.getByRole('button', {name: '검색'})).toBeDisabled();
  });

  it('유효 입력이면 CTA가 활성화되고 글자 수가 갱신된다', async () => {
    const user = userEvent.setup();

    render(<BookSearchStart onSubmitSearch={vi.fn()} />);

    await user.type(screen.getByRole('textbox'), '파친코');

    expect(screen.getByRole('button', {name: '검색'})).toBeEnabled();
    expect(screen.getByText(`3 / ${MAX_BOOK_SEARCH_TERM_LENGTH}`)).toBeInTheDocument();
  });

  it('버튼 클릭으로 title canonical payload를 제출한다', async () => {
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

  it('Enter 입력으로 author canonical payload를 제출한다', async () => {
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
