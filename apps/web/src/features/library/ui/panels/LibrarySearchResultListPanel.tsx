import type {LibrarySearchItem} from '@nearby-library-search/contracts';
import type {ReactNode} from 'react';
import {Heading, Text} from '@/shared/ui';

type LibrarySearchResultListPanelProps = {
  children: ReactNode;
  footer?: ReactNode;
  headerAction?: ReactNode;
  summary: string;
};

function LibrarySearchResultListPanel({children, footer, headerAction, summary}: LibrarySearchResultListPanelProps) {
  return (
    <aside aria-label="검색 결과 목록 패널" className="bg-surface-strong border-line/40 flex min-h-0 flex-col border-r">
      <div className="px-8 pt-8 pb-3">
        <div className="flex items-center justify-between gap-3">
          <Heading as="h2" className="tracking-[-0.04em]" size="lg">
            검색 결과
          </Heading>
          {headerAction}
        </div>
        <Text className="mt-1 text-sm">{summary}</Text>
      </div>
      {children}
      {footer ? <div className="px-4 py-4">{footer}</div> : null}
    </aside>
  );
}

type LibrarySearchResultListBodyProps = {
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

function LibrarySearchResultListBody({items, onSelectLibrary, selectedLibraryCode}: LibrarySearchResultListBodyProps) {
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

export {LibrarySearchResultListBody, LibrarySearchResultListPanel};
export type {LibrarySearchResultListBodyProps, LibrarySearchResultListPanelProps};
