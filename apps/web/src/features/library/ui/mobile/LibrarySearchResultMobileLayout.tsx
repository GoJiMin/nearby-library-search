import {Suspense, useId, useState} from 'react';
import clsx from 'clsx';
import type {LibraryCode} from '@nearby-library-search/contracts';
import {ChevronDown} from 'lucide-react';
import {hasLibraryCoordinates, LIBRARY_SEARCH_PAGE_SIZE, useGetSearchLibraries} from '@/entities/library';
import type {LibrarySearchParams} from '@/entities/library';
import {useFindLibraryStore} from '@/features/find-library';
import {kakaoMapConfig} from '@/shared/env';
import {Button, Heading, LucideIcon, Text} from '@/shared/ui';
import {LibrarySearchResultMap} from '../../map/ui/LibrarySearchResultMap';
import {LibrarySearchResultDetailsPlaceholder} from '../common/loading/LibrarySearchResultDetailsPlaceholder';
import {LibrarySearchResultListPlaceholder} from '../common/loading/LibrarySearchResultListPlaceholder';
import {LibrarySearchResultList} from '../common/LibrarySearchResultList';
import {LibrarySearchResultPagination} from '../common/LibrarySearchResultPagination';
import {LibrarySearchResultSelectedDetails} from '../common/LibrarySearchResultSelectedDetails';

type LibrarySearchResultMobileLayoutProps = {
  focusRequest: {code: LibraryCode; requestId: number} | null;
  onSelectLibrary: (code: LibraryCode) => void;
  params: LibrarySearchParams;
  selectedLibraryCode: LibraryCode | null;
};

function MobileMapSectionFallback() {
  return (
    <section className="border-line/40 bg-surface border-t px-6 py-5">
      <Button className="w-full justify-between rounded-2xl px-4" disabled size="sm" variant="secondary">
        지도 보기
        <LucideIcon className="h-4 w-4" icon={ChevronDown} strokeWidth={2.2} />
      </Button>
      <Text className="mt-2 px-1 text-sm" size="sm" tone="muted">
        위치 정보를 불러오고 있어요.
      </Text>
    </section>
  );
}

function MobileMapSection({
  focusRequest,
  params,
}: Pick<LibrarySearchResultMobileLayoutProps, 'focusRequest' | 'params'>) {
  const response = useGetSearchLibraries(params);
  const mapSectionId = useId();
  const hasCoordinateItems = response.items.some(hasLibraryCoordinates);
  const isMapUnavailable = !kakaoMapConfig.isEnabled;
  const [isExpanded, setIsExpanded] = useState(isMapUnavailable || !hasCoordinateItems);
  const summary = isMapUnavailable
    ? '지도를 표시할 수 없어요.'
    : !hasCoordinateItems
      ? '지도로 표시할 수 있는 위치 정보가 없어요.'
      : '위치 확인이 필요할 때 지도를 펼쳐보세요.';

  return (
    <section className="border-line/40 bg-surface border-t px-6 py-5">
      <Button
        aria-controls={mapSectionId}
        aria-expanded={isExpanded}
        className="w-full justify-between rounded-2xl px-4"
        onClick={() => {
          setIsExpanded(previous => !previous);
        }}
        size="sm"
        variant="secondary"
      >
        {isExpanded ? '지도 접기' : '지도 보기'}
        <LucideIcon
          className={clsx('h-4 w-4 transition-transform', isExpanded && 'rotate-180')}
          icon={ChevronDown}
          strokeWidth={2.2}
        />
      </Button>
      {!isExpanded ? (
        <Text className="mt-2 px-1 text-sm" size="sm" tone="muted">
          {summary}
        </Text>
      ) : null}
      <div className={clsx('mt-4', !isExpanded && 'hidden')} id={mapSectionId}>
        {isExpanded ? (
          <div aria-label="도서관 지도 패널" className="bg-surface-muted relative min-h-72 overflow-hidden rounded-3xl">
            <LibrarySearchResultMap focusRequest={focusRequest} items={response.items} />
          </div>
        ) : null}
      </div>
    </section>
  );
}

function LibrarySearchResultMobileLayout({
  focusRequest,
  onSelectLibrary,
  params,
  selectedLibraryCode,
}: LibrarySearchResultMobileLayoutProps) {
  const backToRegionSelect = useFindLibraryStore(state => state.backToRegionSelect);
  const totalCount = useFindLibraryStore(state => state.resolvedLibraryTotalCount);
  const shouldRenderPagination = totalCount != null && totalCount > LIBRARY_SEARCH_PAGE_SIZE;

  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto" data-slot="library-search-mobile-layout">
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

      <Suspense fallback={<LibrarySearchResultDetailsPlaceholder layout="mobile" />}>
        <LibrarySearchResultSelectedDetails layout="mobile" params={params} />
      </Suspense>

      <div className="bg-surface-strong">
        <Suspense fallback={<LibrarySearchResultListPlaceholder layout="mobile" />}>
          <LibrarySearchResultList
            layout="mobile"
            onSelectLibrary={onSelectLibrary}
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

      <Suspense fallback={<MobileMapSectionFallback />}>
        <MobileMapSection
          focusRequest={focusRequest}
          key={`${params.isbn}:${params.region}:${params.detailRegion ?? ''}:${params.page}`}
          params={params}
        />
      </Suspense>
    </div>
  );
}

export {LibrarySearchResultMobileLayout};
export type {LibrarySearchResultMobileLayoutProps};
