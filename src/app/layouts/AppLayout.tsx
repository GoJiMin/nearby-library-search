import type { PropsWithChildren } from 'react'
import { AppHeader } from './AppHeader'

function AppLayout({ children }: PropsWithChildren) {
  return (
    <div className="from-surface-muted via-background to-background min-h-screen bg-linear-to-b">
      <div className="mx-auto flex min-h-screen w-full max-w-300 flex-col px-5 pt-5 pb-10 sm:px-8 sm:pt-7 sm:pb-14">
        <AppHeader />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}

export { AppLayout }
