import type {LibraryCode} from '@nearby-library-search/contracts';
import {useEffect, useRef} from 'react';
import type {LibrarySearchCoordinateItem} from './librarySearchResultMap.marker';
import {
  MAX_KAKAO_MAP_LEVEL,
  MIN_KAKAO_MAP_LEVEL,
  applyInitialMapViewport,
  focusMapOnCoordinateItem,
} from './librarySearchResultMap.viewport';

function useLibraryMapViewport({
  coordinateItems,
  coordinateItemsKey,
  currentSelectedCoordinateLibrary,
  focusRequest,
  kakaoMapsRef,
  mapRef,
}: {
  coordinateItems: LibrarySearchCoordinateItem[];
  coordinateItemsKey: string;
  currentSelectedCoordinateLibrary: LibrarySearchCoordinateItem | null;
  focusRequest: {code: LibraryCode; requestId: number} | null;
  kakaoMapsRef: {current: KakaoMapsNamespace | null};
  mapRef: {current: KakaoMapsMap | null};
}) {
  const viewportItemsKeyRef = useRef('');

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

    applyInitialMapViewport({
      coordinateItems,
      kakaoMaps,
      map,
    });
  }, [coordinateItems, coordinateItemsKey, kakaoMapsRef, mapRef]);

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

    focusMapOnCoordinateItem({
      item: targetLibrary,
      kakaoMaps,
      map,
    });
  }, [coordinateItems, focusRequest, kakaoMapsRef, mapRef]);

  return {
    handleLocate() {
      const kakaoMaps = kakaoMapsRef.current;
      const map = mapRef.current;

      if (kakaoMaps == null || map == null || currentSelectedCoordinateLibrary == null) {
        return;
      }

      focusMapOnCoordinateItem({
        item: currentSelectedCoordinateLibrary,
        kakaoMaps,
        map,
      });
    },
    handleZoomIn() {
      const map = mapRef.current;

      if (map == null) {
        return;
      }

      map.setLevel(Math.max(MIN_KAKAO_MAP_LEVEL, map.getLevel() - 1));
    },
    handleZoomOut() {
      const map = mapRef.current;

      if (map == null) {
        return;
      }

      map.setLevel(Math.min(MAX_KAKAO_MAP_LEVEL, map.getLevel() + 1));
    },
    isLocateDisabled: currentSelectedCoordinateLibrary == null,
  };
}

export {useLibraryMapViewport};
