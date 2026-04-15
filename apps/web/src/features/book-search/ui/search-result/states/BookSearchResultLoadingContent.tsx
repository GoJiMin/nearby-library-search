import {Heading, Skeleton} from '@/shared/ui';

type BookSearchResultLoadingContentProps = {
  queryText: string;
};

function BookSearchResultLoadingCard() {
  return (
    <div className="border-line bg-surface-strong w-full rounded-3xl border px-4 py-4 shadow-[0_12px_32px_-8px_rgba(15,23,42,0.08)] sm:px-5 sm:py-5">
      <div className="flex gap-4 sm:gap-6">
        <Skeleton className="h-40 w-28 shrink-0 rounded-2xl sm:h-44 sm:w-32" />

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="space-y-3">
            <div className="space-y-1">
              <div className="space-y-2">
                <Skeleton className="h-5 w-5/6 rounded-full sm:h-6" />
                <Skeleton className="h-5 w-3/5 rounded-full sm:h-6" />
              </div>
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-2">
              <Skeleton className="h-5 w-32 rounded-full sm:w-40" />
              <Skeleton className="h-5 w-36 rounded-full sm:w-44" />
              <Skeleton className="h-5 w-24 rounded-full sm:w-30" />
            </div>
          </div>

          <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2">
            <Skeleton className="h-4 w-12 rounded-full sm:h-5 sm:w-16" />
            <Skeleton className="h-4 w-24 rounded-full sm:h-5 sm:w-28" />
          </div>
        </div>
      </div>
    </div>
  );
}

function BookSearchResultLoadingContent({queryText}: BookSearchResultLoadingContentProps) {
  return (
    <div className="flex w-full flex-col gap-5">
      <Heading as="h1" size="md">
        <span className="text-accent">{queryText}</span>에 대한 검색 결과를 불러오는 중이에요.
      </Heading>
      <ul aria-label="도서 검색 결과 로딩 목록" className="grid gap-4">
        {Array.from({length: 5}, (_, index) => (
          <li key={index}>
            <BookSearchResultLoadingCard />
          </li>
        ))}
      </ul>
    </div>
  );
}

export {BookSearchResultLoadingContent};
export type {BookSearchResultLoadingContentProps};
