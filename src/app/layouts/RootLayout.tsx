import { Outlet, useNavigation } from 'react-router-dom'
import { AppLoadingFallback } from '@/app/router/AppLoadingFallback'
import { AppLayout } from './AppLayout'

function RootLayout() {
  const navigation = useNavigation()

  return (
    <AppLayout>
      {navigation.state === 'idle' ? <Outlet /> : <AppLoadingFallback />}
    </AppLayout>
  )
}

export { RootLayout }
