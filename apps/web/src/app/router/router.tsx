import type {RouteObject} from 'react-router-dom';
import {createBrowserRouter} from 'react-router-dom';
import {RootLayout} from '@/app/layouts';
import {BookSearchResultPage} from '@/pages/book-search-result';
import {HomePage} from '@/pages/home';
import {NotFoundPage} from '@/pages/not-found';
import {RouteErrorPage} from '@/pages/route-error';

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
        element: <BookSearchResultPage />,
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
