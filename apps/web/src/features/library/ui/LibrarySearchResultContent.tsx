import {useEffect, useState} from 'react';
import type {LibraryCode} from '@nearby-library-search/contracts';
import {useShallow} from 'zustand/react/shallow';
import {LIBRARY_SEARCH_PAGE_SIZE, isEmptyLibrarySearchResult, useGetSearchLibraries} from '@/entities/library';
import type {LibrarySearchParams} from '@/entities/library';
import {useFindLibraryStore} from '@/features/find-library';
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
  const {
    backToRegionSelect,
    changeLibraryResultPage,
    closeLibraryResultDialog,
    selectedLibraryCode,
    selectLibrary,
  } = useFindLibraryStore(
    useShallow(state => ({
      backToRegionSelect: state.backToRegionSelect,
      changeLibraryResultPage: state.changeLibraryResultPage,
      closeLibraryResultDialog: state.closeLibraryResultDialog,
      selectedLibraryCode: state.selectedLibraryCode,
      selectLibrary: state.selectLibrary,
    })),
  );
  const [mapFocusRequest, setMapFocusRequest] = useState<{code: LibraryCode; requestId: number} | null>(null);

  const response = useGetSearchLibraries(params);
  const currentPage = response.page ?? params.page;
  const pageSize = response.pageSize ?? LIBRARY_SEARCH_PAGE_SIZE;
  const totalPages = Math.ceil(response.totalCount / pageSize);
  const fallbackSelectedLibrary = response.items[0] ?? null;
  const currentSelectedLibrary =
    response.items.find(item => item.code === selectedLibraryCode) ?? fallbackSelectedLibrary;
  const resolvedSelectedLibraryCode = currentSelectedLibrary?.code ?? null;

  useEffect(() => {
    if (resolvedSelectedLibraryCode == null || selectedLibraryCode === resolvedSelectedLibraryCode) {
      return;
    }

    selectLibrary(resolvedSelectedLibraryCode);
  }, [resolvedSelectedLibraryCode, selectLibrary, selectedLibraryCode]);

  function handleSelectLibraryFromList(code: LibraryCode) {
    selectLibrary(code);
    setMapFocusRequest(previous => ({
      code,
      requestId: (previous?.requestId ?? 0) + 1,
    }));
  }

  if (isEmptyLibrarySearchResult(response)) {
    return (
      <LibrarySearchResultEmptyContent
        onBackToRegionSelect={backToRegionSelect}
        onClose={closeLibraryResultDialog}
      />
    );
  }

  return (
    <div className="grid h-full min-h-0 grid-cols-1 md:grid-cols-[334px_minmax(0,1fr)]">
      <LibrarySearchResultListPanel
        footer={
          <LibrarySearchResultPagination
            currentPage={currentPage}
            onChangePage={changeLibraryResultPage}
            totalPages={totalPages}
          />
        }
        summary={`총 ${response.totalCount}개의 도서관을 검색했어요.`}
      >
        <LibrarySearchResultListBody
          items={response.items}
          onSelectLibrary={handleSelectLibraryFromList}
          selectedLibraryCode={resolvedSelectedLibraryCode}
        />
      </LibrarySearchResultListPanel>
      <div className="grid min-h-0 grid-rows-[minmax(0,1fr)_250px]">
        <LibrarySearchResultMapPanel>
          {/* Map focus uses explicit list/marker interactions; default selection keeps the full bounds view. */}
          <LibrarySearchResultMap
            focusRequest={mapFocusRequest}
            items={response.items}
            onSelectLibrary={selectLibrary}
            selectedLibraryCode={selectedLibraryCode}
          />
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
