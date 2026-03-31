import { Outlet } from 'react-router-dom'

function RootLayout() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-300 flex-col px-5 pt-5 pb-10 sm:px-8 sm:pt-7 sm:pb-14">
        <header className="flex items-center justify-between">
          <div className="border-line bg-surface shadow-soft inline-flex items-center gap-3 rounded-full border px-4 py-2">
            <span className="bg-accent flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold text-white">
              T
            </span>
            <div className="flex flex-col">
              <strong className="text-text text-sm font-semibold">
                동네 도서관 찾기
              </strong>
              <span className="text-text-muted text-xs">
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
