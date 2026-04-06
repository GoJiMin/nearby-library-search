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

    expect(screen.getByText('동네 도서관 찾기')).toBeInTheDocument();
    expect(screen.getByRole('heading', {level: 1, name: /찾고 싶은 책을\s*가까운 도서관으로/})).toBeInTheDocument();
    expect(
      screen.getByText('책 제목이나 저자명으로 먼저 검색해보세요. 원하는 책을 고른 뒤, 지금 갈 수 있는 가까운 도서관을 빠르게 찾을 수 있어요.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('tablist', {name: '검색 기준 선택'})).toBeInTheDocument();
    expect(screen.getByRole('textbox', {name: '책 제목'})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: '검색'})).toBeInTheDocument();
    expect(screen.queryByText('책 제목만 입력하면 가까운 도서관을 바로 보여드릴게요')).not.toBeInTheDocument();
    expect(screen.queryByText('초기 상태')).not.toBeInTheDocument();
  });

  it('renders the not found route for an unknown path', () => {
    renderRouter(['/missing']);

    expect(screen.getByRole('heading', {name: '페이지를 찾을 수 없습니다'})).toBeInTheDocument();
    expect(screen.getByRole('link', {name: '홈으로 돌아가기'})).toHaveAttribute('href', '/');
  });
});
