type AppEmptyStateProps = {
  description: string
  label?: string
  title: string
}

function AppEmptyState({
  title,
  description,
  label = '빈 상태',
}: AppEmptyStateProps) {
  return (
    <section className="rounded-panel border-line bg-surface shadow-soft w-full border border-dashed px-6 py-8 text-center sm:px-8">
      <div className="rounded-pill bg-surface-muted text-text-muted mb-4 inline-flex px-3 py-2 text-sm font-medium">
        {label}
      </div>
      <strong className="text-text mb-3 block text-lg font-semibold">
        {title}
      </strong>
      <p className="mx-auto max-w-xl text-sm sm:text-base">{description}</p>
    </section>
  )
}

export { AppEmptyState }
