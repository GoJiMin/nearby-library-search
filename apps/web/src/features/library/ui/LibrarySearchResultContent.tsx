import {useEffect, useState} from 'react';
import type {LibraryCode} from '@nearby-library-search/contracts';
import {useShallow} from 'zustand/react/shallow';
import {isEmptyLibrarySearchResult, useGetSearchLibraries} from '@/entities/library';
import type {LibrarySearchParams} from '@/entities/library';
import {useFindLibraryStore} from '@/features/find-library';
import {Button, Heading, Text} from '@/shared/ui';
import {LibrarySearchResultMap} from '../map/ui/LibrarySearchResultMap';
import {LibrarySearchResultPagination} from './LibrarySearchResultPagination';
import {
  LibrarySearchResultDetailBody,
  LibrarySearchResultDetailFooterCta,
  LibrarySearchResultDetailPanel,
} from './panels/LibrarySearchResultDetailPanel';
import {LibrarySearchResultListBody, LibrarySearchResultListPanel} from './panels/LibrarySearchResultListPanel';
import {LibrarySearchResultMapPanel} from './panels/LibrarySearchResultMapPanel';
import {LibrarySearchResultEmptyContent} from './states/LibrarySearchResultEmptyContent';

function handleCheckAvailability() {}

type LibrarySearchResultResolvedContentProps = {
  params: LibrarySearchParams;
};

function LibrarySearchResultResolvedContent({params}: LibrarySearchResultResolvedContentProps) {
  const {backToRegionSelect, selectedLibraryCode, selectLibrary} = useFindLibraryStore(
    useShallow(state => ({
      backToRegionSelect: state.backToRegionSelect,
      selectedLibraryCode: state.selectedLibraryCode,
      selectLibrary: state.selectLibrary,
    })),
  );
  const [mapFocusRequest, setMapFocusRequest] = useState<{code: LibraryCode; requestId: number} | null>(null);

  const response = useGetSearchLibraries(params);
  const currentSelectedLibrary = response.items.find(item => item.code === selectedLibraryCode) ?? null;

  useEffect(() => {
    if (selectedLibraryCode != null || response.items.length === 0) {
      return;
    }

    selectLibrary(response.items[0].code);
  }, [response.items, selectLibrary, selectedLibraryCode]);

  function handleSelectLibraryFromList(code: LibraryCode) {
    selectLibrary(code);
    setMapFocusRequest(previous => ({
      code,
      requestId: (previous?.requestId ?? 0) + 1,
    }));
  }

  if (isEmptyLibrarySearchResult(response)) {
    return <LibrarySearchResultEmptyContent />;
  }

  return (
    <div className="grid h-full min-h-0 grid-cols-1 md:grid-cols-[334px_minmax(0,1fr)]">
      <LibrarySearchResultListPanel
        footer={
          <LibrarySearchResultPagination
            page={response.page ?? undefined}
            pageSize={response.pageSize ?? undefined}
            totalCount={response.totalCount}
          />
        }
      >
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
          <Text className="mt-1 text-sm">{`총 ${response.totalCount}개의 도서관을 검색했어요.`}</Text>
        </div>
        <LibrarySearchResultListBody
          items={response.items}
          onSelectLibrary={handleSelectLibraryFromList}
          selectedLibraryCode={selectedLibraryCode}
        />
      </LibrarySearchResultListPanel>
      <div className="grid min-h-0 grid-rows-[minmax(0,1fr)_250px]">
        <LibrarySearchResultMapPanel>
          {/* Map focus uses explicit list/marker interactions; default selection keeps the full bounds view. */}
          <LibrarySearchResultMap focusRequest={mapFocusRequest} items={response.items} />
        </LibrarySearchResultMapPanel>
        <LibrarySearchResultDetailPanel
          footer={
            <LibrarySearchResultDetailFooterCta
              disabled={currentSelectedLibrary == null}
              onCheckAvailability={handleCheckAvailability}
            />
          }
        >
          {currentSelectedLibrary ? <LibrarySearchResultDetailBody library={currentSelectedLibrary} /> : null}
        </LibrarySearchResultDetailPanel>
      </div>
    </div>
  );
}

function LibrarySearchResultContent() {
  const params = useFindLibraryStore(state => state.currentLibrarySearchParams);

  if (params == null) {
    return null;
  }

  return <LibrarySearchResultResolvedContent params={params} />;
}

export {LibrarySearchResultContent};
