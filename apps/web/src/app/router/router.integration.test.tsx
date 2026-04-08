import {act, render, screen, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {createMemoryRouter, RouterProvider} from 'react-router-dom';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {AppProvider} from '@/app/providers';
import {routes} from './router';

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

function renderRouter(initialEntries: string[]) {
  const router = createMemoryRouter(routes, {initialEntries});

  return {
    router,
    ...render(
      <AppProvider>
        <RouterProvider router={router} />
      </AppProvider>,
    ),
  };
}

describe('app router integration', () => {
  it('renders the home route with the app shell and search start feature', () => {
    renderRouter(['/']);

    expect(screen.getByRole('heading', {level: 1, name: /이 책,/})).toBeInTheDocument();
    expect(
      screen.getByText('궁금한 책의 제목이나 저자를 검색창에 입력해 보세요.', {exact: false}),
    ).toBeInTheDocument();
    expect(screen.getByRole('tablist', {name: '검색 기준 선택'})).toBeInTheDocument();
    expect(screen.getByPlaceholderText('찾고 싶은 책 제목을 입력해주세요')).toBeInTheDocument();
    expect(screen.getByRole('button', {name: '검색'})).toBeInTheDocument();
    expect(screen.queryByRole('link', {name: '메인으로'})).not.toBeInTheDocument();
  });

  it('navigates from the home route to the book result route after search submit', async () => {
    const user = userEvent.setup();
    const {router} = renderRouter(['/']);

    await user.type(screen.getByRole('textbox'), '파친코');
    await user.click(screen.getByRole('button', {name: '검색'}));

    expect(await screen.findByRole('form', {name: '도서 결과 재검색'})).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/books');
    expect(new URLSearchParams(router.state.location.search).get('title')).toBe('파친코');
    expect(new URLSearchParams(router.state.location.search).get('page')).toBe('1');
  });

  it('renders the book result route when the url has valid search params', () => {
    renderRouter(['/books?author=한강&page=2']);

    expect(screen.getByRole('link', {name: '메인으로'})).toHaveAttribute('href', '/');
    expect(screen.getByRole('region', {name: '도서 검색 결과 화면'})).toBeInTheDocument();
    expect(screen.getByRole('form', {name: '도서 결과 재검색'})).toBeInTheDocument();
    expect(screen.getByRole('tab', {name: '저자명'})).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByPlaceholderText('찾고 싶은 저자명을 입력해주세요')).toHaveValue('한강');
    expect(screen.getByRole('heading', {level: 1, name: '한강에 대한 12개의 검색 결과가 있습니다.'})).toBeInTheDocument();
  });

  it('updates the result route search params and resets page to 1 when re-searching', async () => {
    const user = userEvent.setup();
    const {router} = renderRouter(['/books?title=파친코&page=2']);

    const input = await screen.findByRole('textbox');

    await user.clear(input);
    await user.type(input, '채식주의자');
    await user.click(screen.getByRole('button', {name: '검색'}));

    expect(router.state.location.pathname).toBe('/books');
    expect(new URLSearchParams(router.state.location.search).get('title')).toBe('채식주의자');
    expect(new URLSearchParams(router.state.location.search).get('page')).toBe('1');
  });

  it('updates only the page search param when clicking pagination links and supports browser back', async () => {
    const user = userEvent.setup();
    const {router} = renderRouter(['/books?title=파친코&page=2']);

    await user.click(await screen.findByRole('link', {name: '1페이지'}));

    expect(router.state.location.pathname).toBe('/books');
    expect(new URLSearchParams(router.state.location.search).get('title')).toBe('파친코');
    expect(new URLSearchParams(router.state.location.search).get('page')).toBe('1');

    await act(async () => {
      await router.navigate(-1);
    });

    expect(new URLSearchParams(router.state.location.search).get('title')).toBe('파친코');
    expect(new URLSearchParams(router.state.location.search).get('page')).toBe('2');
    expect(
      within(screen.getByRole('navigation', {name: '도서 검색 결과 페이지네이션'})).getByText('2'),
    ).toHaveAttribute('aria-current', 'page');
  });

  it('moves forward and backward with previous/next pagination links while preserving the query', async () => {
    const user = userEvent.setup();
    const {router} = renderRouter(['/books?title=파친코&page=1']);

    await user.click(await screen.findByRole('link', {name: '다음 페이지'}));

    expect(router.state.location.pathname).toBe('/books');
    expect(new URLSearchParams(router.state.location.search).get('title')).toBe('파친코');
    expect(new URLSearchParams(router.state.location.search).get('page')).toBe('2');

    await user.click(await screen.findByRole('link', {name: '이전 페이지'}));

    expect(router.state.location.pathname).toBe('/books');
    expect(new URLSearchParams(router.state.location.search).get('title')).toBe('파친코');
    expect(new URLSearchParams(router.state.location.search).get('page')).toBe('1');
  });

  it('redirects the empty book result route to the home page', async () => {
    renderRouter(['/books']);

    expect(await screen.findByRole('heading', {level: 1, name: /이 책,/})).toBeInTheDocument();
    expect(screen.getByRole('tablist', {name: '검색 기준 선택'})).toBeInTheDocument();
  });

  it('renders an inline recovery state for invalid book result urls', () => {
    renderRouter(['/books?title=&page=abc']);

    expect(screen.getByRole('link', {name: '메인으로'})).toHaveAttribute('href', '/');
    expect(screen.getByRole('heading', {level: 1, name: '검색 결과를 불러올 수 없어요'})).toBeInTheDocument();
    expect(screen.getByRole('link', {name: '검색 다시 시작'})).toHaveAttribute('href', '/');
  });

  it('renders the not found route for an unknown path', () => {
    renderRouter(['/missing']);

    expect(screen.queryByRole('link', {name: '메인으로'})).not.toBeInTheDocument();
    expect(screen.getByRole('heading', {name: '페이지를 찾을 수 없어요'})).toBeInTheDocument();
    expect(screen.getByRole('link', {name: '홈으로 돌아가기'})).toHaveAttribute('href', '/');
  });
});
