import type {LibrarySearchItem} from '@nearby-library-search/contracts';
import type {ReactNode} from 'react';
import {Heading, Skeleton, Text} from '@/shared/ui';

type LibrarySearchResultListPanelProps = {
  children: ReactNode;
  summary: string;
};

const resultCardSkeletonWidths = [
  {address: 'w-40', meta: 'w-24', title: 'w-28'},
  {address: 'w-36', meta: 'w-20', title: 'w-24'},
  {address: 'w-44', meta: 'w-28', title: 'w-24'},
  {address: 'w-36', meta: 'w-24', title: 'w-32'},
  {address: 'w-40', meta: 'w-20', title: 'w-28'},
] as const;

function LibrarySearchResultListPanel({children, summary}: LibrarySearchResultListPanelProps) {
  return (
    <aside
      aria-label="검색 결과 목록 패널"
      className="bg-surface-strong border-line/40 flex min-h-0 flex-col border-r"
    >
      <div className="px-6 pt-6 pb-5">
        <Heading as="h2" className="tracking-[-0.04em]" size="lg">
          검색 결과
        </Heading>
        <Text className="mt-1" size="sm">
          {summary}
        </Text>
      </div>
      {children}
    </aside>
  );
}

type LibrarySearchResultListPlaceholderBodyProps = {
  itemCount?: number;
};

type LibrarySearchResultListBodyProps = {
  items: LibrarySearchItem[];
  onSelectLibrary: (code: LibrarySearchItem['code']) => void;
  selectedLibraryCode: LibrarySearchItem['code'] | null;
};

function LibrarySearchResultListPlaceholderBody({
  itemCount = resultCardSkeletonWidths.length,
}: LibrarySearchResultListPlaceholderBodyProps) {
  return (
    <ul
      aria-label="도서관 검색 결과 목록"
      className="flex-1 space-y-3 overflow-y-auto px-4 pb-6"
      role="list"
    >
      {Array.from({length: itemCount}, (_, index) => {
        const widths = resultCardSkeletonWidths[index % resultCardSkeletonWidths.length];

        return (
          <li key={`${widths.title}-${index}`}>
            <div
              className={
                index === 0
                  ? 'bg-surface shadow-card border-line/70 space-y-4 rounded-3xl border px-4 py-4'
                  : 'bg-surface-muted/60 space-y-4 rounded-3xl px-4 py-4'
              }
            >
              <div className="space-y-2.5">
                <Skeleton className={`h-6 rounded-full ${widths.title}`} />
                <Skeleton className={`h-4 rounded-full ${widths.address}`} />
              </div>
              <Skeleton className={`h-3 rounded-full ${widths.meta}`} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function getLibraryRowMeta(item: LibrarySearchItem) {
  if (item.operatingTime && item.closedDays) {
    return `${item.operatingTime} · ${item.closedDays}`;
  }

  return item.operatingTime ?? item.closedDays ?? '운영 정보 없음';
}

function LibrarySearchResultListBody({
  items,
  onSelectLibrary,
  selectedLibraryCode,
}: LibrarySearchResultListBodyProps) {
  return (
    <ul
      aria-label="도서관 검색 결과 목록"
      className="flex-1 space-y-3 overflow-y-auto px-4 pb-6"
      role="list"
    >
      {items.map(item => {
        const isSelected = selectedLibraryCode === item.code;

        return (
          <li key={item.code}>
            <button
              aria-pressed={isSelected}
              className={
                isSelected
                  ? 'bg-surface shadow-card border-line/70 flex w-full flex-col gap-4 rounded-3xl border px-4 py-4 text-left'
                  : 'bg-surface-muted/60 hover:bg-surface-muted/80 flex w-full flex-col gap-4 rounded-3xl px-4 py-4 text-left transition-colors'
              }
              onClick={() => onSelectLibrary(item.code)}
              type="button"
            >
              <div className="space-y-2.5">
                <Heading as="h3" size="sm">
                  {item.name}
                </Heading>
                <Text className="line-clamp-2" size="sm" tone="muted">
                  {item.address ?? '주소 정보 없음'}
                </Text>
              </div>
              <Text className="text-sm leading-5" size="sm" tone="muted">
                {getLibraryRowMeta(item)}
              </Text>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export {LibrarySearchResultListBody, LibrarySearchResultListPanel, LibrarySearchResultListPlaceholderBody};
export type {
  LibrarySearchResultListBodyProps,
  LibrarySearchResultListPanelProps,
  LibrarySearchResultListPlaceholderBodyProps,
};
