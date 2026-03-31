import { createBrowserRouter } from 'react-router-dom'
import { RootLayout } from '@/app/layouts'
import { HomePage } from './HomePage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
    ],
  },
])

export { router }
