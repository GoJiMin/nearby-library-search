import type { PropsWithChildren } from 'react'

function AppLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen w-full flex-col">{children}</div>
    </div>
  )
}

export { AppLayout }
