import {Skeleton} from '@/shared/ui';

const bookDetailMetaFieldWidths = ['w-3/5', 'w-4/5', 'w-2/3', 'w-3/4'] as const;
const bookDetailLoanBadgeWidths = ['w-24', 'w-28', 'w-24'] as const;

function BookDetailDialogLoadingContent() {
  return (
    <div className="grid h-full min-h-0 grid-cols-1 lg:grid-cols-[minmax(18rem,24rem)_minmax(0,1fr)]">
      <aside className="border-line/60 bg-surface-muted/35 border-b px-6 py-8 lg:border-r lg:border-b-0 lg:px-6 lg:py-10">
        <div aria-hidden="true" className="flex h-full flex-col gap-6 lg:gap-8">
          <div className="space-y-3 lg:pr-6">
            <Skeleton className="h-10 w-4/5 rounded-full" />
            <Skeleton className="h-6 w-1/2 rounded-full" />
          </div>
          <div className="flex flex-1 items-center justify-center lg:items-start">
            <Skeleton className="aspect-[3/4] w-full max-w-64 rounded-3xl sm:max-w-xs lg:max-w-full" />
          </div>
        </div>
      </aside>
      <div className="bg-surface min-h-0 overflow-y-auto">
        <div
          aria-label="도서 상세 정보를 불러오는 중"
          aria-live="polite"
          className="flex min-h-full flex-col gap-8 px-6 py-8 sm:px-8 sm:py-10"
          role="status"
        >
          <section aria-hidden="true" className="flex flex-col gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-full rounded-full" />
            <Skeleton className="h-5 w-11/12 rounded-full" />
            <Skeleton className="h-5 w-4/5 rounded-full" />
          </section>

          <section aria-hidden="true" className="flex flex-col gap-5">
            <div className="grid gap-4 sm:grid-cols-2">
              {bookDetailMetaFieldWidths.map(widthClassName => (
                <div className="space-y-2" key={widthClassName}>
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className={`h-6 rounded-full ${widthClassName}`} />
                </div>
              ))}
            </div>
          </section>

          <section aria-hidden="true" className="flex flex-col gap-4">
            <Skeleton className="h-5 w-20 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-7 w-52 rounded-full" />
              <Skeleton className="h-5 w-44 rounded-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-7 w-36 rounded-full" />
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>
            <div className="flex flex-wrap gap-2">
              {bookDetailLoanBadgeWidths.map(widthClassName => (
                <Skeleton className={`h-10 rounded-full ${widthClassName}`} key={widthClassName} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export {BookDetailDialogLoadingContent};
