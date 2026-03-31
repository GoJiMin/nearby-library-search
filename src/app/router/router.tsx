import { createBrowserRouter } from 'react-router-dom'
import { RootLayout } from '@/app/layouts'
import { HomePage } from '@/pages/home'
import { NotFoundPage } from '@/pages/not-found'

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
])

export { router }
