import type {RouteObject} from 'react-router-dom';
import {createBrowserRouter} from 'react-router-dom';
import {RootLayout} from '@/app/layouts';
import {HomePage} from '@/pages/home';
import {NotFoundPage} from '@/pages/not-found';
import {RouteErrorPage} from '@/pages/route-error';
import {LoadingState} from '@/shared/feedback';

const routes = [
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'books',
        HydrateFallback: LoadingState,
        lazy: async () => {
          const {BookSearchResultPage} = await import('@/pages/book-search-result');

          return {
            Component: BookSearchResultPage,
          };
        },
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
] satisfies RouteObject[];

const router = createBrowserRouter(routes);

export {router, routes};
