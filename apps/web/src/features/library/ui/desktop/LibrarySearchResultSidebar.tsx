import type {ReactNode} from 'react';
import {useFindLibraryStore} from '@/features/find-library';
import {Button, Heading, Text} from '@/shared/ui';
import {LibrarySearchResultPagination} from '../common/LibrarySearchResultPagination';

type LibrarySearchResultSidebarProps = {
  children: ReactNode;
};

function LibrarySearchResultSidebar({children}: LibrarySearchResultSidebarProps) {
  const backToRegionSelect = useFindLibraryStore(state => state.backToRegionSelect);
  const totalCount = useFindLibraryStore(state => state.resolvedLibraryTotalCount);

  return (
    <aside aria-label="검색 결과 목록 패널" className="bg-surface-strong border-line/40 flex min-h-0 flex-col border-r">
      <div className="px-8 pt-7 pb-3">
        <div className="flex items-center justify-between gap-1">
          <Heading as="h2" className="tracking-[-0.04em]" size="lg">
            검색 결과
          </Heading>
          {totalCount != null ? (
            <Button
              className="text-text-muted hover:text-text rounded-full px-3 hover:bg-transparent"
              onClick={backToRegionSelect}
              size="sm"
              type="button"
              variant="ghost"
            >
              지역 변경
            </Button>
          ) : null}
        </div>
        <Text className="mt-1 text-sm">
          {totalCount == null ? '도서관 검색 결과를 불러오고 있어요.' : `총 ${totalCount}개의 도서관을 검색했어요.`}
        </Text>
      </div>
      {children}
      <div className="px-4 py-4">
        <LibrarySearchResultPagination />
      </div>
    </aside>
  );
}

export {LibrarySearchResultSidebar};
export type {LibrarySearchResultSidebarProps};
