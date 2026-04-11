import type {LibrarySearchItem} from '@nearby-library-search/contracts';
import {Heading, Text} from '@/shared/ui';

type LibrarySearchResultListProps = {
  items: LibrarySearchItem[];
  onSelectLibrary: (code: LibrarySearchItem['code']) => void;
  selectedLibraryCode: LibrarySearchItem['code'] | null;
};

function getLibraryRowMeta(item: LibrarySearchItem) {
  if (item.operatingTime && item.closedDays) {
    return `${item.operatingTime} · ${item.closedDays}`;
  }

  return item.operatingTime ?? item.closedDays ?? '운영 정보 없음';
}

function LibrarySearchResultList({items, onSelectLibrary, selectedLibraryCode}: LibrarySearchResultListProps) {
  return (
    <ul aria-label="도서관 검색 결과 목록" className="flex-1 space-y-3 overflow-y-auto px-4 py-3" role="list">
      {items.map(item => {
        const isSelected = selectedLibraryCode === item.code;

        return (
          <li key={item.code}>
            <button
              aria-pressed={isSelected}
              className={
                isSelected
                  ? 'bg-surface shadow-card border-line/70 flex w-full flex-col gap-4 rounded-3xl border px-5 py-5 text-left'
                  : 'bg-surface-muted/60 hover:bg-surface-muted flex w-full flex-col gap-4 rounded-3xl px-5 py-5 text-left transition-colors'
              }
              onClick={() => onSelectLibrary(item.code)}
              type="button"
            >
              <div className="space-y-2.5">
                <Heading as="h3" size="sm">
                  {item.name}
                </Heading>
                <Text className="line-clamp-2 text-sm" tone="muted">
                  {item.address ?? '주소 정보 없음'}
                </Text>
              </div>
              <Text className="text-sm leading-3" tone="muted">
                {getLibraryRowMeta(item)}
              </Text>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export {LibrarySearchResultList};
export type {LibrarySearchResultListProps};
