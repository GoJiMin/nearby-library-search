function LoadingState() {
  return (
    <div className="flex min-h-[calc(100vh-112px)] items-center">
      <section className="rounded-panel border-line bg-surface-strong shadow-card w-full border px-6 py-8 sm:px-10 sm:py-12">
        <div className="rounded-pill bg-accent-soft text-accent-strong mb-6 inline-flex items-center gap-2 px-3 py-2 text-sm font-medium">
          <span className="bg-accent h-2 w-2 animate-pulse rounded-full" />
          화면을 준비하고 있습니다
        </div>

        <div className="space-y-3">
          <div className="bg-surface-muted h-6 w-2/3 animate-pulse rounded-full" />
          <div className="bg-surface-muted h-4 w-full animate-pulse rounded-full" />
          <div className="bg-surface-muted h-4 w-5/6 animate-pulse rounded-full" />
        </div>
      </section>
    </div>
  )
}

export { LoadingState }
