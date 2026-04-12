import {Suspense, useEffect, useRef, useState} from 'react';
import type {LibraryCode} from '@nearby-library-search/contracts';
import {useShallow} from 'zustand/react/shallow';
import {LIBRARY_SEARCH_PAGE_SIZE} from '@/entities/library';
import type {LibrarySearchParams} from '@/entities/library';
import {useFindLibraryStore} from '@/features/find-library';
import {Button, Heading, Skeleton, Text} from '@/shared/ui';
import {LibrarySearchResultList} from '../common/LibrarySearchResultList';
import {LibrarySearchResultPagination} from '../common/LibrarySearchResultPagination';
import {LibrarySearchResultListPlaceholder} from '../common/loading/LibrarySearchResultListPlaceholder';
import {
  LibrarySearchResultMobileDetailsSection,
  LibrarySearchResultMobileDetailsSectionFallback,
} from './LibrarySearchResultMobileDetailsSection';
import {LibrarySearchResultMobileQuickMapDialog} from './LibrarySearchResultMobileQuickMapDialog';

type LibrarySearchResultMobileLayoutProps = {
  onSelectLibrary: (code: LibraryCode) => void;
  params: LibrarySearchParams;
  selectedLibraryCode: LibraryCode | null;
};

function LibrarySearchResultMobileLayout({
  onSelectLibrary,
  params,
  selectedLibraryCode,
}: LibrarySearchResultMobileLayoutProps) {
  const {backToRegionSelect, currentPage, totalCount} = useFindLibraryStore(
    useShallow(state => ({
      backToRegionSelect: state.backToRegionSelect,
      currentPage: state.currentLibrarySearchParams?.page ?? 1,
      totalCount: state.resolvedLibraryTotalCount,
    })),
  );
  const layoutRef = useRef<HTMLDivElement | null>(null);
  const detailsAnchorRef = useRef<HTMLDivElement | null>(null);
  const previousPageRef = useRef(currentPage);
  const [quickMapFocusRequest, setQuickMapFocusRequest] = useState<{code: LibraryCode; requestId: number} | null>(null);
  const shouldRenderPagination = totalCount != null && totalCount > LIBRARY_SEARCH_PAGE_SIZE;

  function scrollToDetails() {
    if (layoutRef.current == null || detailsAnchorRef.current == null) {
      return;
    }

    layoutRef.current.scrollTo({
      behavior: 'smooth',
      top: detailsAnchorRef.current.offsetTop,
    });
  }

  function handleSelectLibraryFromList(code: LibraryCode) {
    onSelectLibrary(code);
    scrollToDetails();
  }

  function handleOpenQuickMap(code: LibraryCode) {
    setQuickMapFocusRequest(previous => ({
      code,
      requestId: (previous?.requestId ?? 0) + 1,
    }));
  }

  useEffect(() => {
    if (previousPageRef.current === currentPage) {
      return;
    }

    previousPageRef.current = currentPage;
    scrollToDetails();
  }, [currentPage]);

  return (
    <div
      className="flex h-full min-h-0 flex-col overflow-y-auto"
      data-slot="library-search-mobile-layout"
      ref={layoutRef}
    >
      <header className="bg-surface-strong border-line/40 border-b px-6 pt-6 pb-4">
        <div className="flex min-h-10 items-center gap-1" data-slot="library-search-mobile-header-title-row">
          <Heading as="h2" className="tracking-[-0.04em]" size="lg">
            검색 결과
          </Heading>
          {totalCount != null && (
            <Button
              className="text-text-muted hover:text-text rounded-full px-3 hover:bg-transparent"
              onClick={backToRegionSelect}
              size="sm"
              type="button"
              variant="ghost"
            >
              지역 변경
            </Button>
          )}
          {totalCount == null && (
            <Skeleton
              aria-hidden="true"
              className="h-10 w-20 rounded-full"
              data-slot="library-search-mobile-change-region-placeholder"
            />
          )}
        </div>
        {totalCount == null ? (
          <Skeleton
            aria-hidden="true"
            className="mt-1 h-7 w-56 rounded-full"
            data-slot="library-search-mobile-summary-placeholder"
          />
        ) : (
          <Text className="mt-1 text-sm">총 {totalCount}개의 도서관을 검색했어요.</Text>
        )}
      </header>

      <div ref={detailsAnchorRef}>
        <Suspense fallback={<LibrarySearchResultMobileDetailsSectionFallback />}>
          <LibrarySearchResultMobileDetailsSection onOpenQuickMap={handleOpenQuickMap} params={params} />
        </Suspense>
      </div>

      <div className="bg-surface-strong">
        <Suspense fallback={<LibrarySearchResultListPlaceholder layout="mobile" />}>
          <LibrarySearchResultList
            layout="mobile"
            onSelectLibrary={handleSelectLibraryFromList}
            params={params}
            selectedLibraryCode={selectedLibraryCode}
          />
        </Suspense>
      </div>

      {shouldRenderPagination && (
        <div className="border-line/40 bg-surface-strong border-t px-4 py-4">
          <LibrarySearchResultPagination />
        </div>
      )}

      {quickMapFocusRequest != null && (
        <LibrarySearchResultMobileQuickMapDialog
          focusRequest={quickMapFocusRequest}
          onOpenChange={open => {
            if (!open) {
              setQuickMapFocusRequest(null);
            }
          }}
          open={quickMapFocusRequest != null}
          params={params}
        />
      )}
    </div>
  );
}

export {LibrarySearchResultMobileLayout};
export type {LibrarySearchResultMobileLayoutProps};
