import type {LibraryCode, LibrarySearchItem} from '@nearby-library-search/contracts';
import {hasLibraryCoordinates} from '@/entities/library';
import {appConfig} from '@/shared/env';
import {LibrarySearchResultMapControls} from './LibrarySearchResultMapControls';
import {
  LibrarySearchResultMapNoCoordinateBody,
  LibrarySearchResultMapPlaceholderBody,
  LibrarySearchResultMapUnavailableBody,
} from './LibrarySearchResultMapFallback';
import {
  createCoordinateItemsKey,
} from './librarySearchResultMap.viewport';
import {useKakaoMapInstance} from './useKakaoMapInstance';
import {type LibrarySearchCoordinateItem} from './librarySearchResultMap.marker';
import {useLibraryMapMarkers} from './useLibraryMapMarkers';
import {useLibraryMapViewport} from './useLibraryMapViewport';

type LibrarySearchResultMapProps = {
  focusRequest: {code: LibraryCode; requestId: number} | null;
  items: LibrarySearchItem[];
  onSelectLibrary: (code: LibraryCode) => void;
  selectedLibraryCode: LibraryCode | null;
};

function LibrarySearchResultMap({
  focusRequest,
  items,
  onSelectLibrary,
  selectedLibraryCode,
}: LibrarySearchResultMapProps) {
  const {containerRef, errorCode, kakaoMapsRef, mapRef, status} = useKakaoMapInstance();
  const fallbackSelectedLibrary = items[0] ?? null;
  const currentSelectedLibrary = items.find(item => item.code === selectedLibraryCode) ?? fallbackSelectedLibrary;
  const coordinateItems = items.filter(hasLibraryCoordinates) as LibrarySearchCoordinateItem[];
  const currentSelectedCoordinateLibrary =
    currentSelectedLibrary && hasLibraryCoordinates(currentSelectedLibrary) ? currentSelectedLibrary : null;
  const currentSelectedCoordinateCode = currentSelectedCoordinateLibrary?.code ?? null;
  const coordinateItemsKey = createCoordinateItemsKey(coordinateItems);

  useLibraryMapMarkers({
    coordinateItems,
    coordinateItemsKey,
    currentSelectedCoordinateCode,
    kakaoMapsRef,
    mapRef,
    onSelectLibrary,
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
