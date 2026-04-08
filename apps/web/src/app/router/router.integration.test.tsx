import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {createMemoryRouter, RouterProvider} from 'react-router-dom';
import {describe, expect, it} from 'vitest';
import {AppProvider} from '@/app/providers';
import {routes} from './router';

function renderRouter(initialEntries: string[]) {
  const router = createMemoryRouter(routes, {initialEntries});

  return render(
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>,
  );
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

    renderRouter(['/']);

    await user.type(screen.getByRole('textbox'), '파친코');
    await user.click(screen.getByRole('button', {name: '검색'}));

    expect(await screen.findByRole('heading', {level: 1, name: '검색 결과'})).toBeInTheDocument();
    expect(screen.getByText('책 제목')).toBeInTheDocument();
    expect(screen.getByText('파친코')).toBeInTheDocument();
  });

  it('renders the book result route when the url has valid search params', () => {
    renderRouter(['/books?author=한강&page=2']);

    expect(screen.getByRole('heading', {level: 1, name: '검색 결과'})).toBeInTheDocument();
    expect(screen.getByText('저자명')).toBeInTheDocument();
    expect(screen.getByText('한강')).toBeInTheDocument();
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
