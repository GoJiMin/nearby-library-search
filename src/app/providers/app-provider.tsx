import type { PropsWithChildren } from 'react'

function AppProvider({ children }: PropsWithChildren) {
  return <>{children}</>
}

export { AppProvider }
