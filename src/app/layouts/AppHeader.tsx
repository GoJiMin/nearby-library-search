function AppHeader() {
  return (
    <header className="mb-6 flex items-center justify-between sm:mb-8">
      <div className="border-line bg-surface shadow-soft inline-flex items-center gap-3 rounded-full border px-4 py-2">
        <span className="bg-accent flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold text-white">
          L
        </span>
        <div className="flex flex-col">
          <strong className="text-text text-sm font-semibold">
            동네 도서관 찾기
          </strong>
          <span className="text-text-muted text-xs">
            가까운 소장 도서관을 빠르게 찾는 MVP
          </span>
        </div>
      </div>
    </header>
  )
}

export { AppHeader }
