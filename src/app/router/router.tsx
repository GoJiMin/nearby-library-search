import { createBrowserRouter } from 'react-router-dom'
import { RootLayout } from '@/app/layouts'
import { HomePage } from './HomePage'
import { NotFoundPage } from './NotFoundPage'

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
