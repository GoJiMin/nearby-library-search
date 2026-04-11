import type {LibrarySearchItem} from '@nearby-library-search/contracts';
import {useFindLibraryStore} from '@/features/find-library';
import {Button, Heading, Text} from '@/shared/ui';
import {LibrarySearchResultList} from './LibrarySearchResultList';
import {LibrarySearchResultPagination} from './LibrarySearchResultPagination';

type LibrarySearchResultSidebarProps = {
  items: LibrarySearchItem[];
  page?: number;
  pageSize?: number;
  selectedLibraryCode: LibrarySearchItem['code'] | null;
  totalCount: number;
  onSelectLibrary: (code: LibrarySearchItem['code']) => void;
};

function LibrarySearchResultSidebar({
  items,
  onSelectLibrary,
  page,
  pageSize,
  selectedLibraryCode,
  totalCount,
}: LibrarySearchResultSidebarProps) {
  const backToRegionSelect = useFindLibraryStore(state => state.backToRegionSelect);

  return (
    <aside aria-label="검색 결과 목록 패널" className="bg-surface-strong border-line/40 flex min-h-0 flex-col border-r">
      <div className="px-8 pt-8 pb-3">
        <div className="flex items-center justify-between gap-3">
          <Heading as="h2" className="tracking-[-0.04em]" size="lg">
            검색 결과
          </Heading>
          <Button
            className="rounded-full px-3 text-text-muted hover:text-text"
            onClick={backToRegionSelect}
            size="sm"
            type="button"
            variant="ghost"
          >
            지역 변경
          </Button>
        </div>
        <Text className="mt-1 text-sm">{`총 ${totalCount}개의 도서관을 검색했어요.`}</Text>
      </div>
      <LibrarySearchResultList
        items={items}
        onSelectLibrary={onSelectLibrary}
        selectedLibraryCode={selectedLibraryCode}
      />
      <div className="px-4 py-4">
        <LibrarySearchResultPagination page={page} pageSize={pageSize} totalCount={totalCount} />
      </div>
    </aside>
  );
}

export {LibrarySearchResultSidebar};
export type {LibrarySearchResultSidebarProps};
