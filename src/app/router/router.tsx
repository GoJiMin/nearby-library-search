import { createBrowserRouter } from 'react-router-dom'
import { RootLayout } from '@/app/layouts'

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: null,
      },
    ],
  },
])

export { router }
