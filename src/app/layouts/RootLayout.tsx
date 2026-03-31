import { Outlet } from 'react-router-dom'
import { AppLayout } from './AppLayout'

function RootLayout() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  )
}

export { RootLayout }
