import {useLayoutEffect} from 'react';
import type {LibraryCode, LibrarySearchItem} from '@nearby-library-search/contracts';
import {useShallow} from 'zustand/react/shallow';
import {useGetSearchLibraries} from '@/entities/library';
import type {LibrarySearchParams} from '@/entities/library';
import {useFindLibraryStore} from '@/features/find-library';
import {Heading, Text} from '@/shared/ui';

type LibrarySearchResultListProps = {
  onSelectLibrary: (code: LibraryCode) => void;
  layout?: 'desktop' | 'mobile';
  params: LibrarySearchParams;
  selectedLibraryCode: LibraryCode | null;
};

type LibrarySearchResultListBodyProps = {
  items: LibrarySearchItem[];
  layout?: 'desktop' | 'mobile';
  onSelectLibrary: (code: LibrarySearchItem['code']) => void;
  selectedLibraryCode: LibrarySearchItem['code'] | null;
};

function getLibraryRowMeta(item: LibrarySearchItem) {
  if (item.operatingTime && item.closedDays) {
    return `${item.operatingTime} · ${item.closedDays}`;
  }

  return item.operatingTime ?? item.closedDays ?? '운영 정보 없음';
}

function LibrarySearchResultListBody({
  items,
  layout = 'desktop',
  onSelectLibrary,
  selectedLibraryCode,
}: LibrarySearchResultListBodyProps) {
  const listClassName =
    layout === 'mobile'
      ? 'space-y-3 px-6 py-4'
      : 'flex-1 space-y-3 overflow-y-auto px-4 py-3';

  return (
    <ul aria-label="도서관 검색 결과 목록" className={listClassName} role="list">
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

function LibrarySearchResultList({
  layout = 'desktop',
  onSelectLibrary,
  params,
  selectedLibraryCode,
}: LibrarySearchResultListProps) {
  const {selectLibrary, setResolvedLibraryTotalCount} = useFindLibraryStore(
    useShallow(state => ({
      selectLibrary: state.selectLibrary,
      setResolvedLibraryTotalCount: state.setResolvedLibraryTotalCount,
    })),
  );
  const response = useGetSearchLibraries(params);

  useLayoutEffect(() => {
    setResolvedLibraryTotalCount(response.totalCount);

    if (selectedLibraryCode != null || response.items.length === 0) {
      return;
    }

    selectLibrary(response.items[0].code);
  }, [response.items, response.totalCount, selectLibrary, selectedLibraryCode, setResolvedLibraryTotalCount]);

  return (
    <LibrarySearchResultListBody
      items={response.items}
      layout={layout}
      onSelectLibrary={onSelectLibrary}
      selectedLibraryCode={selectedLibraryCode}
    />
  );
}

export {LibrarySearchResultList};
export type {LibrarySearchResultListProps};
