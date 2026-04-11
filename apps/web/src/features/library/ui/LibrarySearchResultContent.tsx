import {useState} from 'react';
import type {LibraryCode} from '@nearby-library-search/contracts';
import {useShallow} from 'zustand/react/shallow';
import {useFindLibraryStore} from '@/features/find-library';
import {useMediaQuery} from '@/shared/lib/useMediaQuery';
import {LibrarySearchResultDesktopLayout} from './desktop/LibrarySearchResultDesktopLayout';
import {LibrarySearchResultMobileLayout} from './mobile/LibrarySearchResultMobileLayout';
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
  const isMobile = useMediaQuery('(max-width: 767px)');

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

  if (isMobile) {
    return (
      <LibrarySearchResultMobileLayout
        focusRequest={mapFocusRequest}
        onSelectLibrary={handleSelectLibraryFromList}
        params={params}
        selectedLibraryCode={selectedLibraryCode}
      />
    );
  }

  return (
    <LibrarySearchResultDesktopLayout
      focusRequest={mapFocusRequest}
      onSelectLibrary={handleSelectLibraryFromList}
      params={params}
      selectedLibraryCode={selectedLibraryCode}
    />
  );
}

export {LibrarySearchResultContent};
