import {useLayoutEffect, useState} from 'react';
import type {LibraryCode} from '@nearby-library-search/contracts';
import {useShallow} from 'zustand/react/shallow';
import {useGetSearchLibraries} from '@/entities/library';
import type {LibrarySearchParams} from '@/entities/library';
import {useFindLibraryStore} from '@/features/find-library';
import {LibrarySearchResultMap} from '../map/ui/LibrarySearchResultMap';
import {LibrarySearchResultList} from './LibrarySearchResultList';
import {LibrarySearchResultSidebar} from './LibrarySearchResultSidebar';
import {LibrarySearchResultDetails} from './LibrarySearchResultDetails';
import {LibrarySearchResultEmptyContent} from './states/LibrarySearchResultEmptyContent';

type LibrarySearchResultBodyProps = {
  params: LibrarySearchParams;
};

function LibrarySearchResultBody({params}: LibrarySearchResultBodyProps) {
  const {selectedLibraryCode, selectLibrary, setResolvedLibraryTotalCount} = useFindLibraryStore(
    useShallow(state => ({
      selectedLibraryCode: state.selectedLibraryCode,
      selectLibrary: state.selectLibrary,
      setResolvedLibraryTotalCount: state.setResolvedLibraryTotalCount,
    })),
  );
  const [mapFocusRequest, setMapFocusRequest] = useState<{code: LibraryCode; requestId: number} | null>(null);
  const response = useGetSearchLibraries(params);

  useLayoutEffect(() => {
    setResolvedLibraryTotalCount(response.totalCount);

    if (selectedLibraryCode != null || response.items.length === 0) {
      return;
    }

    selectLibrary(response.items[0].code);
  }, [
    response.items,
    response.totalCount,
    selectLibrary,
    selectedLibraryCode,
    setResolvedLibraryTotalCount,
  ]);

  function handleSelectLibrary(code: LibraryCode) {
    selectLibrary(code);
    setMapFocusRequest(previous => ({
      code,
      requestId: (previous?.requestId ?? 0) + 1,
    }));
  }

  if (response.items.length === 0) {
    return <LibrarySearchResultEmptyContent />;
  }

  const currentSelectedLibrary = response.items.find(item => item.code === selectedLibraryCode) ?? null;

  return (
    <div className="grid h-full min-h-0 grid-cols-1 md:grid-cols-[334px_minmax(0,1fr)]">
      <LibrarySearchResultSidebar>
        <LibrarySearchResultList
          items={response.items}
          onSelectLibrary={handleSelectLibrary}
          selectedLibraryCode={selectedLibraryCode}
        />
      </LibrarySearchResultSidebar>
      <div className="grid min-h-0 grid-rows-[minmax(0,1fr)_250px]">
        <section aria-label="도서관 지도 패널" className="bg-surface-muted relative min-h-90 overflow-hidden">
          <LibrarySearchResultMap focusRequest={mapFocusRequest} items={response.items} />
        </section>
        <LibrarySearchResultDetails library={currentSelectedLibrary} />
      </div>
    </div>
  );
}

export {LibrarySearchResultBody};
export type {LibrarySearchResultBodyProps};
