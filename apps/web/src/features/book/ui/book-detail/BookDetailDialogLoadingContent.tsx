import {Skeleton} from '@/shared/ui';

const bookDetailMetaFieldWidths = ['w-3/5', 'w-4/5', 'w-2/3', 'w-3/4'] as const;
const bookDetailAgeStatWidths = ['w-16', 'w-20', 'w-16', 'w-24'] as const;

function BookDetailDialogLoadingContent() {
  return (
    <div className="grid h-full min-h-0 grid-cols-1 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
      <aside className="border-line bg-surface-muted/35 flex items-center justify-center border-b px-6 py-8 lg:border-r lg:border-b-0 lg:px-8 lg:py-10">
        <Skeleton className="aspect-[3/4] w-full max-w-52 rounded-3xl sm:max-w-56" />
      </aside>
      <div className="min-h-0 overflow-y-auto">
        <div
          aria-label="도서 상세 정보를 불러오는 중"
          aria-live="polite"
          className="flex min-h-full flex-col px-6 py-8 sm:px-8 sm:py-10"
          role="status"
        >
          <section aria-hidden="true" className="border-line flex flex-col gap-3 border-b pb-6 pr-12 sm:pb-8">
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-10 w-4/5 rounded-full" />
            <Skeleton className="h-6 w-1/2 rounded-full" />
            <Skeleton className="h-5 w-3/5 rounded-full" />
          </section>

          <section aria-hidden="true" className="border-line flex flex-col gap-3 border-b py-6 sm:py-8">
            <Skeleton className="h-4 w-16 rounded-full" />
            <Skeleton className="h-5 w-full rounded-full" />
            <Skeleton className="h-5 w-11/12 rounded-full" />
            <Skeleton className="h-5 w-4/5 rounded-full" />
          </section>

          <section aria-hidden="true" className="border-line flex flex-col gap-5 border-b py-6 sm:py-8">
            <div className="grid gap-4 sm:grid-cols-2">
              {bookDetailMetaFieldWidths.map(widthClassName => (
                <div className="space-y-2" key={widthClassName}>
                  <Skeleton className="h-4 w-20 rounded-full" />
                  <Skeleton className={`h-6 rounded-full ${widthClassName}`} />
                </div>
              ))}
            </div>
          </section>

          <section aria-hidden="true" className="flex flex-col gap-5 py-6 sm:py-8">
            <div className="space-y-5">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24 rounded-full" />
                <Skeleton className="h-10 w-32 rounded-full" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-4 w-28 rounded-full" />
                <div className="flex flex-wrap gap-2">
                  {bookDetailAgeStatWidths.map(widthClassName => (
                    <Skeleton className={`h-9 rounded-full ${widthClassName}`} key={widthClassName} />
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export {BookDetailDialogLoadingContent};
