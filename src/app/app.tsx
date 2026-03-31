import { AppProvider } from '@/app/providers'
import { RouterProvider } from 'react-router-dom'
import { AppLoadingFallback, router } from '@/app/router'

function App() {
  return (
    <AppProvider>
      <RouterProvider fallbackElement={<AppLoadingFallback />} router={router} />
    </AppProvider>
  )
}

export { App }
