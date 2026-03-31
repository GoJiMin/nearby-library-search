function HomePage() {
  return (
    <main className="flex min-h-[calc(100vh-96px)] items-center">
      <section className="w-full overflow-hidden rounded-[var(--radius-panel)] border border-[var(--color-line)] bg-[var(--color-surface-strong)] px-6 py-8 shadow-[var(--shadow-card)] sm:px-10 sm:py-12">
        <div className="mb-8 inline-flex items-center gap-2 rounded-[var(--radius-pill)] bg-[var(--color-accent-soft)] px-3 py-2 text-sm font-medium text-[var(--color-accent-strong)]">
          <span className="h-2 w-2 rounded-full bg-[var(--color-accent)]" />
          내 주변 도서관 검색 MVP
        </div>

        <div className="max-w-3xl">
          <h1 className="mb-5">책 제목만 입력하면 가까운 도서관을 바로 보여드릴게요</h1>
          <p className="mb-8 max-w-2xl">
            복잡한 설명 없이 바로 이해되는 검색 경험을 목표로 하고 있습니다.
            제목을 검색하고 지역을 고르면, 주변 도서관과 위치를 빠르게 확인할 수 있게 만들 예정입니다.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <article className="rounded-[24px] bg-[var(--color-surface-muted)] p-5">
            <strong className="mb-2 block text-sm font-semibold text-[var(--color-text)]">
              1. 도서 검색
            </strong>
            <p className="text-sm">
              제목 입력 후 ISBN 조회로 검색의 출발점을 단순하게 만듭니다.
            </p>
          </article>

          <article className="rounded-[24px] bg-[var(--color-surface-muted)] p-5">
            <strong className="mb-2 block text-sm font-semibold text-[var(--color-text)]">
              2. 지역 선택
            </strong>
            <p className="text-sm">
              시, 구, 동 깊이 선택으로 실제 생활 반경에 맞는 탐색을 제공합니다.
            </p>
          </article>

          <article className="rounded-[24px] bg-[var(--color-surface-muted)] p-5">
            <strong className="mb-2 block text-sm font-semibold text-[var(--color-text)]">
              3. 지도 확인
            </strong>
            <p className="text-sm">
              소장 도서관을 카드와 지도로 함께 보여줘 이동 판단을 빠르게 돕습니다.
            </p>
          </article>
        </div>
      </section>
    </main>
  )
}

export { HomePage }
