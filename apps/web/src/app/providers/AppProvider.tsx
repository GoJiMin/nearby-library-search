import type { PropsWithChildren } from 'react'
import { ReactQueryProvider } from './ReactQueryProvider'

function AppProvider({ children }: PropsWithChildren) {
  return <ReactQueryProvider>{children}</ReactQueryProvider>
}

export { AppProvider }
