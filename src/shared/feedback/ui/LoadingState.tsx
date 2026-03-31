type LoadingStateProps = {
  description?: string
  label?: string
  title?: string
}

function LoadingState({
  title = '화면을 준비하고 있습니다',
  description = '다음 화면에 필요한 정보를 불러오는 중입니다. 잠시만 기다려 주세요.',
  label = '로딩 중',
}: LoadingStateProps) {
  return (
    <div className="flex min-h-[calc(100vh-112px)] items-center">
      <section className="border-line bg-surface-strong shadow-card rounded-panel w-full border px-6 py-8 sm:px-10 sm:py-12">
        <div className="bg-accent-soft text-accent-strong rounded-pill mb-6 inline-flex items-center gap-2 px-3 py-2 text-sm font-medium">
          <span className="bg-accent h-2 w-2 animate-pulse rounded-full" />
          {label}
        </div>

        <div className="mb-8 max-w-2xl space-y-3">
          <h2 className="text-text text-3xl font-semibold tracking-[-0.04em]">
            {title}
          </h2>
          <p className="text-base leading-7">{description}</p>
        </div>

        <div className="space-y-5">
          <div className="space-y-3">
            <div className="bg-surface-muted h-7 w-1/2 animate-pulse rounded-full" />
            <div className="bg-surface-muted h-4 w-full animate-pulse rounded-full" />
            <div className="bg-surface-muted h-4 w-5/6 animate-pulse rounded-full" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="bg-surface-muted min-h-28 animate-pulse rounded-3xl" />
            <div className="bg-surface-muted min-h-28 animate-pulse rounded-3xl" />
          </div>
        </div>
      </section>
    </div>
  )
}

export { LoadingState }
export type { LoadingStateProps }
