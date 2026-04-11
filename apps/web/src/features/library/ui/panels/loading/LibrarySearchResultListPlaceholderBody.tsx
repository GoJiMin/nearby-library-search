import {Skeleton} from '@/shared/ui';

const resultCardSkeletonWidths = [
  {address: 'w-40', meta: 'w-24', title: 'w-28'},
  {address: 'w-36', meta: 'w-20', title: 'w-24'},
  {address: 'w-44', meta: 'w-28', title: 'w-24'},
  {address: 'w-36', meta: 'w-24', title: 'w-32'},
  {address: 'w-40', meta: 'w-20', title: 'w-28'},
] as const;

type LibrarySearchResultListPlaceholderBodyProps = {
  itemCount?: number;
};

function LibrarySearchResultListPlaceholderBody({
  itemCount = resultCardSkeletonWidths.length,
}: LibrarySearchResultListPlaceholderBodyProps) {
  return (
    <ul aria-label="도서관 검색 결과 목록" className="flex-1 space-y-3 overflow-y-auto px-4 py-3" role="list">
      {Array.from({length: itemCount}, (_, index) => {
        const widths = resultCardSkeletonWidths[index % resultCardSkeletonWidths.length];

        return (
          <li key={`${widths.title}-${index}`}>
            <div
              className={
                index === 0
                  ? 'bg-surface shadow-card border-line/70 flex flex-col gap-4 rounded-3xl border px-5 py-5'
                  : 'bg-surface-muted/60 flex flex-col gap-4 rounded-3xl px-5 py-5'
              }
            >
              <div className="space-y-2.5">
                <Skeleton className={`h-5 rounded-full ${widths.title}`} />
                <div className="space-y-1.5">
                  <Skeleton className={`h-4 rounded-full ${widths.address}`} />
                  <Skeleton className="h-4 w-24 rounded-full" />
                </div>
              </div>
              <Skeleton className={`h-3 rounded-full ${widths.meta}`} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export {LibrarySearchResultListPlaceholderBody};
export type {LibrarySearchResultListPlaceholderBodyProps};
