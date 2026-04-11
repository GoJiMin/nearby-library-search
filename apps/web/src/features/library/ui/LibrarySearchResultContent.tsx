import {useEffect, useState} from 'react';
import type {LibraryCode} from '@nearby-library-search/contracts';
import {useShallow} from 'zustand/react/shallow';
import {isEmptyLibrarySearchResult, useGetSearchLibraries} from '@/entities/library';
import type {LibrarySearchParams} from '@/entities/library';
import {useFindLibraryStore} from '@/features/find-library';
import {LibrarySearchResultMap} from '../map/ui/LibrarySearchResultMap';
import {LibrarySearchResultDetails} from './LibrarySearchResultDetails';
import {LibrarySearchResultSidebar} from './LibrarySearchResultSidebar';
import {LibrarySearchResultEmptyContent} from './states/LibrarySearchResultEmptyContent';

type LibrarySearchResultResolvedContentProps = {
  params: LibrarySearchParams;
};

function LibrarySearchResultResolvedContent({params}: LibrarySearchResultResolvedContentProps) {
  const {selectedLibraryCode, selectLibrary} = useFindLibraryStore(
    useShallow(state => ({
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
      <LibrarySearchResultSidebar
          items={response.items}
          onSelectLibrary={handleSelectLibraryFromList}
          page={response.page ?? undefined}
          pageSize={response.pageSize ?? undefined}
          selectedLibraryCode={selectedLibraryCode}
          totalCount={response.totalCount}
      />
      <div className="grid min-h-0 grid-rows-[minmax(0,1fr)_250px]">
        <section aria-label="도서관 지도 패널" className="bg-surface-muted relative min-h-90 overflow-hidden">
          {/* Map focus uses explicit list/marker interactions; default selection keeps the full bounds view. */}
          <LibrarySearchResultMap focusRequest={mapFocusRequest} items={response.items} />
        </section>
        <LibrarySearchResultDetails library={currentSelectedLibrary} />
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
