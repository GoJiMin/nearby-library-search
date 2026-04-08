import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {createMemoryRouter, RouterProvider} from 'react-router-dom';
import {describe, expect, it} from 'vitest';
import {AppProvider} from '@/app/providers';
import {RouteErrorPage} from '@/pages/route-error';

function BrokenRoute(): never {
  throw new Error('route failure');
}

function renderRouteErrorPage() {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        children: [
          {
            index: true,
            element: <div>홈 화면</div>,
          },
          {
            path: 'broken',
            element: <BrokenRoute />,
            errorElement: <RouteErrorPage />,
          },
        ],
      },
    ],
    {
      initialEntries: ['/broken'],
    },
  );

  return {
    router,
    ...render(
      <AppProvider>
        <RouterProvider router={router} />
      </AppProvider>,
    ),
  };
}

describe('RouteErrorPage', () => {
  it('renders the simple fallback state and navigates back to home', async () => {
    const user = userEvent.setup();
    const {router} = renderRouteErrorPage();

    expect(screen.queryByRole('link', {name: '메인으로'})).not.toBeInTheDocument();
    expect(await screen.findByRole('heading', {name: '화면을 불러오지 못했어요'})).toBeInTheDocument();
    expect(screen.getByRole('link', {name: '홈으로 돌아가기'})).toHaveAttribute('href', '/');

    await user.click(screen.getByRole('link', {name: '홈으로 돌아가기'}));

    expect(router.state.location.pathname).toBe('/');
    expect(await screen.findByText('홈 화면')).toBeInTheDocument();
  });
});
