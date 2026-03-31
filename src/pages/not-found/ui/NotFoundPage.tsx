import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <main className="flex min-h-[calc(100vh-96px)] items-center">
      <section className="w-full rounded-[var(--radius-panel)] border border-[var(--color-line)] bg-[var(--color-surface-strong)] px-6 py-8 shadow-[var(--shadow-card)] sm:px-10 sm:py-12">
        <div className="mb-4 inline-flex rounded-[var(--radius-pill)] bg-[var(--color-accent-soft)] px-3 py-2 text-sm font-medium text-[var(--color-accent-strong)]">
          404
        </div>
        <h1 className="mb-4">페이지를 찾을 수 없습니다</h1>
        <p className="mb-8 max-w-xl">
          요청한 경로가 존재하지 않거나 아직 준비되지 않았습니다. 홈으로 돌아가서 다시 탐색해 주세요.
        </p>
        <Link
          className="inline-flex items-center rounded-[var(--radius-pill)] bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-white"
          to="/"
        >
          홈으로 돌아가기
        </Link>
      </section>
    </main>
  )
}

export { NotFoundPage }
