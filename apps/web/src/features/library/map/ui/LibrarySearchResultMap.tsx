import type {LibraryCode, LibrarySearchItem} from '@nearby-library-search/contracts';
import {useShallow} from 'zustand/react/shallow';
import {hasLibraryCoordinates} from '@/entities/library';
import {useFindLibraryStore} from '@/features/find-library';
import {appConfig} from '@/shared/env';
import {LibrarySearchResultMapControls} from './LibrarySearchResultMapControls';
import {
  LibrarySearchResultMapNoCoordinateBody,
  LibrarySearchResultMapPlaceholderBody,
  LibrarySearchResultMapUnavailableBody,
} from './LibrarySearchResultMapFallback';
import {type LibrarySearchCoordinateItem} from '../lib/librarySearchResultMap.marker';
import {createCoordinateItemsKey} from '../lib/librarySearchResultMap.viewport';
import {useKakaoMapInstance} from '../model/useKakaoMapInstance';
import {useLibraryMapMarkers} from '../model/useLibraryMapMarkers';
import {useLibraryMapViewport} from '../model/useLibraryMapViewport';

type LibrarySearchResultMapProps = {
  focusRequest: {code: LibraryCode; requestId: number} | null;
  items: LibrarySearchItem[];
};

function LibrarySearchResultMap({focusRequest, items}: LibrarySearchResultMapProps) {
  const {selectedLibraryCode, selectLibrary} = useFindLibraryStore(
    useShallow(state => ({
      selectedLibraryCode: state.selectedLibraryCode,
      selectLibrary: state.selectLibrary,
    })),
  );
  const {containerRef, errorCode, kakaoMapsRef, mapRef, status} = useKakaoMapInstance();
  const coordinateItems = items.filter(hasLibraryCoordinates) as LibrarySearchCoordinateItem[];
  const currentSelectedCoordinateLibrary = coordinateItems.find(item => item.code === selectedLibraryCode) ?? null;
  const currentSelectedCoordinateCode = currentSelectedCoordinateLibrary?.code ?? null;
  const coordinateItemsKey = createCoordinateItemsKey(coordinateItems);

  useLibraryMapMarkers({
    coordinateItems,
    coordinateItemsKey,
    currentSelectedCoordinateCode,
    kakaoMapsRef,
    mapRef,
    onSelectLibrary: selectLibrary,
    status,
  });
  const {handleLocate, handleZoomIn, handleZoomOut, isLocateDisabled} = useLibraryMapViewport({
    coordinateItems,
    coordinateItemsKey,
    currentSelectedCoordinateLibrary,
    focusRequest,
    kakaoMapsRef,
    mapRef,
  });

  if (status === 'disabled' || status === 'error') {
    return (
      <LibrarySearchResultMapUnavailableBody diagnosticCode={appConfig.isDevelopment ? errorCode : null} />
    );
  }

  if (status === 'ready' && coordinateItems.length === 0) {
    return <LibrarySearchResultMapNoCoordinateBody />;
  }

  return (
    <>
      <div className="absolute inset-0 z-0" data-slot="kakao-map-canvas" ref={containerRef} />
      {status === 'loading' ? (
        <LibrarySearchResultMapPlaceholderBody />
      ) : (
        <LibrarySearchResultMapControls
          isLocateDisabled={isLocateDisabled}
          onLocate={handleLocate}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
        />
      )}
    </>
  );
}

export {LibrarySearchResultMap};
export type {LibrarySearchResultMapProps};
