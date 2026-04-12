import {Skeleton} from '@/shared/ui';

const bookDetailMetaFieldWidths = ['w-3/5', 'w-4/5', 'w-2/3', 'w-3/4'] as const;
const bookDetailLoanBadgeWidths = ['w-24', 'w-28', 'w-24'] as const;

function BookDetailDialogLoadingContent() {
  return (
    <div className="grid min-h-full grid-cols-1 lg:h-full lg:min-h-0 lg:grid-cols-[minmax(18rem,24rem)_minmax(0,1fr)]">
      <aside className="border-line/60 bg-surface-muted/35 border-b px-5 py-5 lg:border-r lg:border-b-0 lg:px-6 lg:py-10">
        <div aria-hidden="true" className="flex items-center justify-center lg:h-full lg:items-start">
          <Skeleton className="aspect-3/4 w-full rounded-3xl" />
        </div>
      </aside>
      <div className="bg-surface lg:min-h-0 lg:overflow-y-auto">
        <div
          aria-label="도서 상세 정보를 불러오는 중"
          aria-live="polite"
          className="flex flex-col gap-4 px-5 py-5 lg:min-h-full lg:gap-8 lg:px-8 lg:py-10"
          role="status"
        >
          <section aria-hidden="true" className="border-line/60 space-y-2.5 border-b pb-4 lg:pb-6">
            <Skeleton className="h-10 w-4/5 rounded-full" />
            <Skeleton className="h-6 w-1/2 rounded-full" />
          </section>

          <div aria-hidden="true" className="space-y-6 lg:space-y-8">
            <section className="flex flex-col gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-full rounded-full" />
              <Skeleton className="h-5 w-11/12 rounded-full" />
              <Skeleton className="h-5 w-4/5 rounded-full" />
            </section>

            <section className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {bookDetailMetaFieldWidths.map(widthClassName => (
                  <div className="space-y-2" key={widthClassName}>
                    <Skeleton className="h-5 w-20 rounded-full" />
                    <Skeleton className={`h-6 rounded-full ${widthClassName}`} />
                  </div>
                ))}
              </div>
            </section>
          </div>

          <section aria-hidden="true" className="border-line/60 flex flex-col gap-3 border-t pt-5 lg:gap-4 lg:pt-6">
            <Skeleton className="h-5 w-20 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-7 w-36 rounded-full" />
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-7 w-52 rounded-full" />
              <Skeleton className="h-5 w-44 rounded-full" />
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
