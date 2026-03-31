type EmptyStateProps = {
  description: string
  label?: string
  title: string
}

function EmptyState({
  title,
  description,
  label = '빈 상태',
}: EmptyStateProps) {
  return (
    <section className="border-line bg-surface shadow-soft rounded-panel w-full border border-dashed px-6 py-8 text-center sm:px-8 sm:py-10">
      <div className="bg-surface-muted text-text-muted rounded-pill mb-4 inline-flex px-3 py-2 text-sm font-medium">
        {label}
      </div>
      <strong className="text-text mb-3 block text-xl font-semibold tracking-[-0.03em]">
        {title}
      </strong>
      <p className="mx-auto max-w-xl text-sm leading-6 sm:text-base">
        {description}
      </p>
    </section>
  )
}

export { EmptyState }
