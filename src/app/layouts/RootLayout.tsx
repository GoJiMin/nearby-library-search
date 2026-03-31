import { Outlet } from 'react-router-dom'

function RootLayout() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-[1200px] flex-col px-5 pb-10 pt-5 sm:px-8 sm:pb-14 sm:pt-7">
        <header className="flex items-center justify-between">
          <div className="inline-flex items-center gap-3 rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-2 shadow-[var(--shadow-soft)]">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-accent)] text-sm font-semibold text-white">
              T
            </span>
            <div className="flex flex-col">
              <strong className="text-sm font-semibold text-[var(--color-text)]">
                동네 도서관 찾기
              </strong>
              <span className="text-xs text-[var(--color-text-muted)]">
                간결한 금융 앱 스타일의 MVP 셸
              </span>
            </div>
          </div>
        </header>

        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export { RootLayout }
