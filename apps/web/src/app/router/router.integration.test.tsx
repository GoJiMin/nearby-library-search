import {render, screen} from '@testing-library/react';
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

  it('renders the not found route for an unknown path', () => {
    renderRouter(['/missing']);

    expect(screen.getByRole('heading', {name: '페이지를 찾을 수 없습니다'})).toBeInTheDocument();
    expect(screen.getByRole('link', {name: '홈으로 돌아가기'})).toHaveAttribute('href', '/');
  });
});
