import {Suspense, useState} from 'react';
import type {LibraryCode, LibrarySearchItem} from '@nearby-library-search/contracts';
import {useShallow} from 'zustand/react/shallow';
import {useFindLibraryStore} from '@/features/find-library';
import {LibrarySearchResultMap} from '../map/ui/LibrarySearchResultMap';
import {LibrarySearchResultMapPlaceholderBody} from '../map/ui/LibrarySearchResultMapFallback';
import {LibrarySearchResultDetails} from './LibrarySearchResultDetails';
import {LibrarySearchResultListSection} from './LibrarySearchResultListSection';
import {LibrarySearchResultSidebar} from './LibrarySearchResultSidebar';
import {LibrarySearchResultDetailsPlaceholder} from './loading/LibrarySearchResultDetailsPlaceholder';
import {LibrarySearchResultListPlaceholder} from './loading/LibrarySearchResultListPlaceholder';
import {LibrarySearchResultEmptyContent} from './states/LibrarySearchResultEmptyContent';

function LibrarySearchResultContent() {
  const {params, selectedLibraryCode, selectLibrary} = useFindLibraryStore(
    useShallow(state => ({
      params: state.currentLibrarySearchParams,
      selectedLibraryCode: state.selectedLibraryCode,
      selectLibrary: state.selectLibrary,
    })),
  );
  const [mapFocusRequest, setMapFocusRequest] = useState<{code: LibraryCode; requestId: number} | null>(null);
  const [resolvedItems, setResolvedItems] = useState<LibrarySearchItem[] | null>(null);
  const [resolvedPage, setResolvedPage] = useState<number | null>(null);

  if (params == null) {
    return null;
  }

  function handleSelectLibraryFromList(code: LibraryCode) {
    selectLibrary(code);
    setMapFocusRequest(previous => ({
      code,
      requestId: (previous?.requestId ?? 0) + 1,
    }));
  }

  const currentPageItems = resolvedPage === params.page ? resolvedItems : null;

  if (currentPageItems?.length === 0) {
    return <LibrarySearchResultEmptyContent />;
  }

  const currentSelectedLibrary = currentPageItems?.find(item => item.code === selectedLibraryCode) ?? null;

  return (
    <div className="grid h-full min-h-0 grid-cols-1 md:grid-cols-[334px_minmax(0,1fr)]">
      <LibrarySearchResultSidebar>
        <Suspense fallback={<LibrarySearchResultListPlaceholder />}>
          <LibrarySearchResultListSection
            onSelectLibrary={handleSelectLibraryFromList}
            params={params}
            setResolvedPage={setResolvedPage}
            selectedLibraryCode={selectedLibraryCode}
            setResolvedItems={setResolvedItems}
          />
        </Suspense>
      </LibrarySearchResultSidebar>
      <div className="grid min-h-0 grid-rows-[minmax(0,1fr)_250px]">
        <section aria-label="도서관 지도 패널" className="bg-surface-muted relative min-h-90 overflow-hidden">
          {currentPageItems == null ? (
            <LibrarySearchResultMapPlaceholderBody />
          ) : (
            <LibrarySearchResultMap focusRequest={mapFocusRequest} items={currentPageItems} />
          )}
        </section>
        {currentPageItems == null ? (
          <LibrarySearchResultDetailsPlaceholder />
        ) : (
          <LibrarySearchResultDetails library={currentSelectedLibrary} />
        )}
      </div>
    </div>
  );
}

export {LibrarySearchResultContent};
