import {Suspense, useEffect, useRef, useState} from 'react';
import type {LibraryCode} from '@nearby-library-search/contracts';
import {Map, Search, X} from 'lucide-react';
import {hasLibraryCoordinates, LIBRARY_SEARCH_PAGE_SIZE, useGetSearchLibraries} from '@/entities/library';
import type {LibrarySearchParams} from '@/entities/library';
import {useFindLibraryStore} from '@/features/find-library';
import {kakaoMapConfig} from '@/shared/env';
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  Heading,
  LucideIcon,
  Text,
} from '@/shared/ui';
import {LibrarySearchResultDetailsFields} from '../common/LibrarySearchResultDetails';
import {LibrarySearchResultList} from '../common/LibrarySearchResultList';
import {LibrarySearchResultPagination} from '../common/LibrarySearchResultPagination';
import {LibrarySearchResultSelectedMap} from '../common/LibrarySearchResultSelectedMap';
import {LibrarySearchResultDetailsPlaceholder} from '../common/loading/LibrarySearchResultDetailsPlaceholder';
import {LibrarySearchResultListPlaceholder} from '../common/loading/LibrarySearchResultListPlaceholder';

type LibrarySearchResultMobileLayoutProps = {
  focusRequest: {code: LibraryCode; requestId: number} | null;
  onSelectLibrary: (code: LibraryCode) => void;
  params: LibrarySearchParams;
  selectedLibraryCode: LibraryCode | null;
};

function MobileSelectedDetailsSectionFallback() {
  return (
    <div className="bg-surface border-line/40 border-b px-6 py-5">
      <LibrarySearchResultDetailsPlaceholder layout="mobile" />
      <div className="mt-3">
        <Button className="w-full rounded-2xl" disabled size="lg" variant="secondary">
          <LucideIcon className="h-4 w-4" icon={Map} strokeWidth={2.2} />
          지도로 보기
        </Button>
      </div>
    </div>
  );
}

function MobileQuickMapDialog({
  focusRequest,
  onOpenChange,
  open,
  params,
}: Pick<LibrarySearchResultMobileLayoutProps, 'focusRequest' | 'params'> & {
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent
        aria-describedby={undefined}
        className="bg-surface-strong top-0 left-0 block h-dvh w-dvw max-w-none translate-x-0 translate-y-0 rounded-none border-0 p-0 sm:p-0"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">도서관 위치 지도</DialogTitle>
        <DialogClose asChild>
          <button
            aria-label="지도 닫기"
            className="bg-surface-strong/92 border-line/60 text-text-muted hover:text-text hover:bg-surface-strong focus-visible:ring-accent-soft absolute top-[max(env(safe-area-inset-top),1rem)] right-[max(env(safe-area-inset-right),1rem)] z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border shadow-sm backdrop-blur-sm transition-colors focus-visible:ring-4 focus-visible:outline-none"
            type="button"
          >
            <LucideIcon className="h-5 w-5" icon={X} strokeWidth={2.2} />
          </button>
        </DialogClose>
        <div aria-label="도서관 지도 패널" className="bg-surface-muted relative h-full overflow-hidden">
          <LibrarySearchResultSelectedMap focusRequest={focusRequest} params={params} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MobileSelectedDetailsSection({
  focusRequest,
  params,
}: Pick<LibrarySearchResultMobileLayoutProps, 'focusRequest' | 'params'>) {
  const response = useGetSearchLibraries(params);
  const selectedLibraryCode = useFindLibraryStore(state => state.selectedLibraryCode);
  const currentSelectedLibrary = response.items.find(item => item.code === selectedLibraryCode) ?? null;
  const hasCoordinateItems = response.items.some(hasLibraryCoordinates);
  const isMapUnavailable = !kakaoMapConfig.isEnabled;
  const canOpenQuickMap = currentSelectedLibrary != null && !isMapUnavailable && hasCoordinateItems;
  const [isQuickMapOpen, setIsQuickMapOpen] = useState(false);
  const [quickMapRequestId, setQuickMapRequestId] = useState(0);
  const mapSummary = isMapUnavailable
    ? '지도를 표시할 수 없어요.'
    : !hasCoordinateItems
      ? '지도로 표시할 수 있는 위치 정보가 없어요.'
      : null;
  const quickMapFocusRequest =
    isQuickMapOpen && currentSelectedLibrary != null && hasLibraryCoordinates(currentSelectedLibrary)
      ? {code: currentSelectedLibrary.code, requestId: quickMapRequestId}
      : focusRequest;

  return (
    <>
      <section aria-label="선택된 도서관 정보 패널" className="bg-surface border-line/40 border-b px-6 py-5">
        <div className="flex flex-col gap-6">
          <div>
            <LibrarySearchResultDetailsFields library={currentSelectedLibrary} />
          </div>
          <div className="grid gap-3">
            {canOpenQuickMap ? (
              <Button
                className="w-full rounded-2xl"
                onClick={() => {
                  setQuickMapRequestId(currentRequestId => currentRequestId + 1);
                  setIsQuickMapOpen(true);
                }}
                size="lg"
                variant="secondary"
              >
                <LucideIcon className="h-4 w-4" icon={Map} strokeWidth={2.2} />
                지도로 보기
              </Button>
            ) : mapSummary ? (
              <Text className="px-1 text-sm" size="sm" tone="muted">
                {mapSummary}
              </Text>
            ) : null}
            <Button className="w-full rounded-2xl" disabled={currentSelectedLibrary == null} size="lg" variant="default">
              <LucideIcon className="h-4 w-4" icon={Search} strokeWidth={2.2} />
              대출 가능 여부 조회
            </Button>
          </div>
        </div>
      </section>
      {canOpenQuickMap ? (
        <MobileQuickMapDialog
          focusRequest={quickMapFocusRequest}
          onOpenChange={setIsQuickMapOpen}
          open={isQuickMapOpen}
          params={params}
        />
      ) : null}
    </>
  );
}

function LibrarySearchResultMobileLayout({
  focusRequest,
  onSelectLibrary,
  params,
  selectedLibraryCode,
}: LibrarySearchResultMobileLayoutProps) {
  const backToRegionSelect = useFindLibraryStore(state => state.backToRegionSelect);
  const currentPage = useFindLibraryStore(state => state.currentLibrarySearchParams?.page ?? 1);
  const totalCount = useFindLibraryStore(state => state.resolvedLibraryTotalCount);
  const layoutRef = useRef<HTMLDivElement | null>(null);
  const detailsAnchorRef = useRef<HTMLDivElement | null>(null);
  const previousPageRef = useRef(currentPage);
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

  useEffect(() => {
    if (previousPageRef.current === currentPage) {
      return;
    }

    previousPageRef.current = currentPage;
    scrollToDetails();
  }, [currentPage]);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto" data-slot="library-search-mobile-layout" ref={layoutRef}>
      <header className="bg-surface-strong border-line/40 border-b px-6 pt-6 pb-4">
        <div className="flex items-center justify-between gap-3">
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
      </header>

      <div ref={detailsAnchorRef}>
        <Suspense fallback={<MobileSelectedDetailsSectionFallback />}>
          <MobileSelectedDetailsSection focusRequest={focusRequest} params={params} />
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

      {shouldRenderPagination ? (
        <div className="border-line/40 bg-surface-strong border-t px-4 py-4">
          <LibrarySearchResultPagination />
        </div>
      ) : null}
    </div>
  );
}

export {LibrarySearchResultMobileLayout};
export type {LibrarySearchResultMobileLayoutProps};
