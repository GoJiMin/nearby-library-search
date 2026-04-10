import type {LibraryCode, LibrarySearchItem} from '@nearby-library-search/contracts';
import {useEffect, useRef} from 'react';
import {hasLibraryCoordinates} from '@/entities/library';
import {appConfig} from '@/shared/env';
import {LibrarySearchResultMapControls} from './LibrarySearchResultMapControls';
import {
  LibrarySearchResultMapNoCoordinateBody,
  LibrarySearchResultMapPlaceholderBody,
  LibrarySearchResultMapUnavailableBody,
} from './LibrarySearchResultMapFallback';
import {
  DEFAULT_SINGLE_LIBRARY_LEVEL,
  MAX_KAKAO_MAP_LEVEL,
  MIN_KAKAO_MAP_LEVEL,
  focusMapOnLibrary,
} from './librarySearchResultMap.viewport';
import {useKakaoMapInstance} from './useKakaoMapInstance';
import {type LibrarySearchCoordinateItem} from './librarySearchResultMap.marker';
import {useLibraryMapMarkers} from './useLibraryMapMarkers';

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
  const viewportItemsKeyRef = useRef('');
  const fallbackSelectedLibrary = items[0] ?? null;
  const currentSelectedLibrary = items.find(item => item.code === selectedLibraryCode) ?? fallbackSelectedLibrary;
  const coordinateItems = items.filter(hasLibraryCoordinates);
  const currentSelectedCoordinateLibrary =
    currentSelectedLibrary && hasLibraryCoordinates(currentSelectedLibrary) ? currentSelectedLibrary : null;
  const currentSelectedCoordinateCode = currentSelectedCoordinateLibrary?.code ?? null;
  const coordinateItemsKey = coordinateItems
    .map(item => `${item.code}:${item.latitude}:${item.longitude}`)
    .join('|');

  useLibraryMapMarkers({
    coordinateItems: coordinateItems as LibrarySearchCoordinateItem[],
    coordinateItemsKey,
    currentSelectedCoordinateCode,
    kakaoMapsRef,
    mapRef,
    onSelectLibrary,
  });

  useEffect(() => {
    const kakaoMaps = kakaoMapsRef.current;
    const map = mapRef.current;

    if (kakaoMaps == null || map == null || coordinateItems.length === 0) {
      viewportItemsKeyRef.current = '';

      return;
    }

    if (coordinateItemsKey === viewportItemsKeyRef.current) {
      return;
    }

    viewportItemsKeyRef.current = coordinateItemsKey;

    if (coordinateItems.length === 1) {
      map.setCenter(new kakaoMaps.LatLng(coordinateItems[0].latitude, coordinateItems[0].longitude));
      map.setLevel(DEFAULT_SINGLE_LIBRARY_LEVEL);
    } else {
      const bounds = new kakaoMaps.LatLngBounds();

      coordinateItems.forEach(item => {
        bounds.extend(new kakaoMaps.LatLng(item.latitude, item.longitude));
      });
      map.setBounds(bounds);
    }
  }, [coordinateItems, coordinateItemsKey, currentSelectedCoordinateCode, kakaoMapsRef, mapRef]);

  useEffect(() => {
    const kakaoMaps = kakaoMapsRef.current;
    const map = mapRef.current;

    if (focusRequest == null || kakaoMaps == null || map == null) {
      return;
    }

    const targetLibrary = coordinateItems.find(item => item.code === focusRequest.code);

    if (targetLibrary == null) {
      return;
    }

    focusMapOnLibrary({
      kakaoMaps,
      latitude: targetLibrary.latitude,
      longitude: targetLibrary.longitude,
      map,
    });
  }, [coordinateItems, focusRequest, kakaoMapsRef, mapRef]);

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
          isLocateDisabled={currentSelectedCoordinateLibrary == null}
          onLocate={() => {
            const kakaoMaps = kakaoMapsRef.current;
            const map = mapRef.current;

            if (kakaoMaps == null || map == null || currentSelectedCoordinateLibrary == null) {
              return;
            }

            focusMapOnLibrary({
              kakaoMaps,
              latitude: currentSelectedCoordinateLibrary.latitude,
              longitude: currentSelectedCoordinateLibrary.longitude,
              map,
            });
          }}
          onZoomIn={() => {
            const map = mapRef.current;

            if (map == null) {
              return;
            }

            map.setLevel(Math.max(MIN_KAKAO_MAP_LEVEL, map.getLevel() - 1));
          }}
          onZoomOut={() => {
            const map = mapRef.current;

            if (map == null) {
              return;
            }

            map.setLevel(Math.min(MAX_KAKAO_MAP_LEVEL, map.getLevel() + 1));
          }}
        />
      )}
    </>
  );
}

export {LibrarySearchResultMap};
export type {LibrarySearchResultMapProps};
