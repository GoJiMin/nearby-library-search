import {Suspense, useState} from 'react';
import type {LibraryCode} from '@nearby-library-search/contracts';
import {useShallow} from 'zustand/react/shallow';
import {useFindLibraryStore} from '@/features/find-library';
import {LibrarySearchResultMapPlaceholderBody} from '../map/ui/LibrarySearchResultMapFallback';
import {LibrarySearchResultResolvedList} from './LibrarySearchResultResolvedList';
import {LibrarySearchResultResolvedRightPane} from './LibrarySearchResultResolvedRightPane';
import {LibrarySearchResultSidebar} from './LibrarySearchResultSidebar';
import {LibrarySearchResultDetailsPlaceholder} from './loading/LibrarySearchResultDetailsPlaceholder';
import {LibrarySearchResultListPlaceholder} from './loading/LibrarySearchResultListPlaceholder';
import {LibrarySearchResultEmptyContent} from './states/LibrarySearchResultEmptyContent';

function LibrarySearchResultContent() {
  const {params, resolvedLibraryTotalCount, selectedLibraryCode, selectLibrary} = useFindLibraryStore(
    useShallow(state => ({
      params: state.currentLibrarySearchParams,
      resolvedLibraryTotalCount: state.resolvedLibraryTotalCount,
      selectedLibraryCode: state.selectedLibraryCode,
      selectLibrary: state.selectLibrary,
    })),
  );
  const [mapFocusRequest, setMapFocusRequest] = useState<{code: LibraryCode; requestId: number} | null>(null);

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

  if (resolvedLibraryTotalCount === 0) {
    return <LibrarySearchResultEmptyContent />;
  }

  return (
    <div className="grid h-full min-h-0 grid-cols-1 md:grid-cols-[334px_minmax(0,1fr)]">
      <LibrarySearchResultSidebar>
        <Suspense fallback={<LibrarySearchResultListPlaceholder />}>
          <LibrarySearchResultResolvedList
            onSelectLibrary={handleSelectLibraryFromList}
            params={params}
            selectedLibraryCode={selectedLibraryCode}
          />
        </Suspense>
      </LibrarySearchResultSidebar>
      <Suspense
        fallback={
          <div className="grid min-h-0 grid-rows-[minmax(0,1fr)_250px]">
            <section aria-label="도서관 지도 패널" className="bg-surface-muted relative min-h-90 overflow-hidden">
              <LibrarySearchResultMapPlaceholderBody />
            </section>
            <LibrarySearchResultDetailsPlaceholder />
          </div>
        }
      >
        <LibrarySearchResultResolvedRightPane focusRequest={mapFocusRequest} params={params} />
      </Suspense>
    </div>
  );
}

export {LibrarySearchResultContent};
