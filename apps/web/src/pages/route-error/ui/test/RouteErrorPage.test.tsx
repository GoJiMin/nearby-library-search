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
  it('renders the shared secondary header and navigates back to home', async () => {
    const user = userEvent.setup();
    const {router} = renderRouteErrorPage();

    expect(await screen.findByRole('link', {name: '메인으로'})).toHaveAttribute('href', '/');
    expect(screen.getByRole('heading', {name: '화면을 불러오지 못했습니다'})).toBeInTheDocument();

    await user.click(screen.getByRole('link', {name: '메인으로'}));

    expect(router.state.location.pathname).toBe('/');
    expect(await screen.findByText('홈 화면')).toBeInTheDocument();
  });
});
