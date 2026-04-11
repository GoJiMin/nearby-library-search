import {useEffect, useState} from 'react';
import type {LibraryCode} from '@nearby-library-search/contracts';
import {LIBRARY_SEARCH_PAGE_SIZE, isEmptyLibrarySearchResult, useGetSearchLibraries} from '@/entities/library';
import type {LibrarySearchResultDialogProps} from '../model/librarySearchResultDialog.contract';
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

type LibrarySearchResultContentProps = Pick<
  LibrarySearchResultDialogProps,
  | 'onBackToRegionSelect'
  | 'onChangePage'
  | 'onCheckAvailability'
  | 'onOpenChange'
  | 'onSelectLibrary'
  | 'selectedLibraryCode'
> & {
  params: NonNullable<LibrarySearchResultDialogProps['params']>;
};

function LibrarySearchResultContent({
  onBackToRegionSelect,
  onChangePage,
  onCheckAvailability,
  onOpenChange,
  onSelectLibrary,
  params,
  selectedLibraryCode,
}: LibrarySearchResultContentProps) {
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

    onSelectLibrary(resolvedSelectedLibraryCode);
  }, [onSelectLibrary, resolvedSelectedLibraryCode, selectedLibraryCode]);

  function handleSelectLibraryFromList(code: LibraryCode) {
    onSelectLibrary(code);
    setMapFocusRequest(previous => ({
      code,
      requestId: (previous?.requestId ?? 0) + 1,
    }));
  }

  if (isEmptyLibrarySearchResult(response)) {
    return (
      <LibrarySearchResultEmptyContent
        onBackToRegionSelect={onBackToRegionSelect}
        onClose={() => onOpenChange(false)}
      />
    );
  }

  return (
    <div className="grid h-full min-h-0 grid-cols-1 md:grid-cols-[334px_minmax(0,1fr)]">
      <LibrarySearchResultListPanel
        footer={
          <LibrarySearchResultPagination
            currentPage={currentPage}
            onChangePage={onChangePage}
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
            onSelectLibrary={onSelectLibrary}
            selectedLibraryCode={selectedLibraryCode}
          />
        </LibrarySearchResultMapPanel>
        <LibrarySearchResultDetailPanel
          footer={
            <LibrarySearchResultDetailFooterCta
              disabled={currentSelectedLibrary == null}
              onCheckAvailability={onCheckAvailability}
            />
          }
        >
          {currentSelectedLibrary ? <LibrarySearchResultDetailBody library={currentSelectedLibrary} /> : null}
        </LibrarySearchResultDetailPanel>
      </div>
    </div>
  );
}

export {LibrarySearchResultContent};
export type {LibrarySearchResultContentProps};
