import {Suspense, useState} from 'react';
import type {LibraryCode} from '@nearby-library-search/contracts';
import {useShallow} from 'zustand/react/shallow';
import {useFindLibraryStore} from '@/features/find-library';
import {LibrarySearchResultList} from './LibrarySearchResultList';
import {LibrarySearchResultRightPanel} from './LibrarySearchResultRightPanel';
import {LibrarySearchResultSidebar} from './LibrarySearchResultSidebar';
import {LibrarySearchResultListPlaceholder} from './loading/LibrarySearchResultListPlaceholder';
import {LibrarySearchResultRightPanelPlaceholder} from './loading/LibrarySearchResultRightPanelPlaceholder';
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
          <LibrarySearchResultList
            onSelectLibrary={handleSelectLibraryFromList}
            params={params}
            selectedLibraryCode={selectedLibraryCode}
          />
        </Suspense>
      </LibrarySearchResultSidebar>
      <Suspense fallback={<LibrarySearchResultRightPanelPlaceholder />}>
        <LibrarySearchResultRightPanel focusRequest={mapFocusRequest} params={params} />
      </Suspense>
    </div>
  );
}

export {LibrarySearchResultContent};
