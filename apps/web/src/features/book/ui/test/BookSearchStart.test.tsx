import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it, vi} from 'vitest';
import {BookSearchStart} from '@/features/book';

describe('BookSearchStart', () => {
  it('기본 렌더에서 title 모드 입력과 비활성 helper를 보여준다', () => {
    const onSubmitSearch = vi.fn();

    render(<BookSearchStart onSubmitSearch={onSubmitSearch} />);

    expect(screen.getByRole('heading', {level: 2, name: '도서 검색 시작'})).toBeInTheDocument();
    expect(screen.getByRole('form', {name: '도서 검색 시작'})).toBeInTheDocument();
    expect(screen.getByRole('tablist', {name: '검색 기준 선택'})).toBeInTheDocument();
    expect(screen.getByRole('tab', {name: '책 제목'})).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', {name: '저자명'})).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByRole('textbox', {name: '책 제목'})).toHaveValue('');
    expect(screen.getByPlaceholderText('찾고 싶은 책 제목을 입력해주세요')).toBeInTheDocument();
    expect(screen.getByRole('button', {name: '검색 시작'})).toBeDisabled();
    expect(screen.getByText('검색을 시작하려면 책 제목을 입력해주세요.')).toBeInTheDocument();
    expect(onSubmitSearch).not.toHaveBeenCalled();
  });

  it('탭 전환 시 입력 라벨과 placeholder를 바꾸고 입력값은 유지한다', async () => {
    const user = userEvent.setup();

    render(<BookSearchStart onSubmitSearch={vi.fn()} />);

    const input = screen.getByRole('textbox', {name: '책 제목'});
    const titleTab = screen.getByRole('tab', {name: '책 제목'});
    const authorTab = screen.getByRole('tab', {name: '저자명'});

    await user.type(input, '파친코');
    await user.click(authorTab);

    expect(authorTab).toHaveAttribute('aria-selected', 'true');
    expect(titleTab).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByRole('textbox', {name: '저자명'})).toHaveValue('파친코');
    expect(screen.getByPlaceholderText('찾고 싶은 저자명을 입력해주세요')).toBeInTheDocument();

    await user.click(titleTab);

    expect(titleTab).toHaveAttribute('aria-selected', 'true');
    expect(authorTab).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByRole('textbox', {name: '책 제목'})).toHaveValue('파친코');
    expect(screen.getByPlaceholderText('찾고 싶은 책 제목을 입력해주세요')).toBeInTheDocument();
  });

  it('whitespace-only 입력에서는 CTA를 비활성 유지하고 helper를 노출한다', async () => {
    const user = userEvent.setup();

    render(<BookSearchStart onSubmitSearch={vi.fn()} />);

    const input = screen.getByRole('textbox', {name: '책 제목'});
    const submitButton = screen.getByRole('button', {name: '검색 시작'});

    await user.type(input, '   ');

    expect(submitButton).toBeDisabled();
    expect(screen.getByText('검색을 시작하려면 책 제목을 입력해주세요.')).toBeInTheDocument();
  });

  it('유효 입력이면 CTA가 활성화되고 helper는 사라진다', async () => {
    const user = userEvent.setup();

    render(<BookSearchStart onSubmitSearch={vi.fn()} />);

    const input = screen.getByRole('textbox', {name: '책 제목'});
    const submitButton = screen.getByRole('button', {name: '검색 시작'});

    await user.type(input, '파친코');

    expect(submitButton).toBeEnabled();
    expect(screen.queryByText('검색을 시작하려면 책 제목을 입력해주세요.')).not.toBeInTheDocument();
  });

  it('버튼 클릭으로 제출 흐름을 실행한다', async () => {
    const user = userEvent.setup();
    const onSubmitSearch = vi.fn();

    render(<BookSearchStart onSubmitSearch={onSubmitSearch} />);

    await user.type(screen.getByRole('textbox', {name: '책 제목'}), '파친코');
    await user.click(screen.getByRole('button', {name: '검색 시작'}));

    expect(onSubmitSearch).toHaveBeenCalledTimes(1);
  });

  it('Enter 입력으로도 제출 흐름을 실행한다', async () => {
    const user = userEvent.setup();
    const onSubmitSearch = vi.fn();

    render(<BookSearchStart onSubmitSearch={onSubmitSearch} />);

    await user.type(screen.getByRole('textbox', {name: '책 제목'}), '파친코{enter}');

    expect(onSubmitSearch).toHaveBeenCalledTimes(1);
  });
});
