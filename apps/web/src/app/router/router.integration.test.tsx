import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {createMemoryRouter, RouterProvider} from 'react-router-dom';
import {describe, expect, it} from 'vitest';
import {AppProvider} from '@/app/providers';
import {routes} from './router';

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

    expect(screen.getByRole('region', {name: '도서 검색 결과 화면'})).toBeInTheDocument();
    expect(screen.getByRole('form', {name: '도서 결과 재검색'})).toBeInTheDocument();
    expect(screen.getByRole('tab', {name: '저자명'})).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByPlaceholderText('찾고 싶은 저자명을 입력해주세요')).toHaveValue('한강');
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

  it('redirects the empty book result route to the home page', async () => {
    renderRouter(['/books']);

    expect(await screen.findByRole('heading', {level: 1, name: /이 책,/})).toBeInTheDocument();
    expect(screen.getByRole('tablist', {name: '검색 기준 선택'})).toBeInTheDocument();
  });

  it('renders an inline recovery state for invalid book result urls', () => {
    renderRouter(['/books?title=&page=abc']);

    expect(screen.getByRole('heading', {level: 1, name: '검색 결과를 불러올 수 없어요'})).toBeInTheDocument();
    expect(screen.getByRole('link', {name: '검색 다시 시작'})).toHaveAttribute('href', '/');
  });

  it('renders the not found route for an unknown path', () => {
    renderRouter(['/missing']);

    expect(screen.getByRole('heading', {name: '페이지를 찾을 수 없습니다'})).toBeInTheDocument();
    expect(screen.getByRole('link', {name: '홈으로 돌아가기'})).toHaveAttribute('href', '/');
  });
});
