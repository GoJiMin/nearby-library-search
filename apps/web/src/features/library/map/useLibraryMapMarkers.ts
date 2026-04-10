import type {LibraryCode} from '@nearby-library-search/contracts';
import {useEffect, useEffectEvent, useRef} from 'react';
import {
  clearMarkerRegistry,
  syncMarkerRegistry,
  syncSelectedMarker,
  type LibrarySearchCoordinateItem,
  type MarkerImageCache,
  type MarkerRegistryEntry,
} from './librarySearchResultMap.marker';
import {focusMapOnLibrary} from './librarySearchResultMap.viewport';

function useLibraryMapMarkers({
  coordinateItems,
  coordinateItemsKey,
  currentSelectedCoordinateCode,
  kakaoMapsRef,
  mapRef,
  onSelectLibrary,
}: {
  coordinateItems: LibrarySearchCoordinateItem[];
  coordinateItemsKey: string;
  currentSelectedCoordinateCode: LibraryCode | null;
  kakaoMapsRef: {current: KakaoMapsNamespace | null};
  mapRef: {current: KakaoMapsMap | null};
  onSelectLibrary: (code: LibraryCode) => void;
}) {
  const markerImageCacheRef = useRef<MarkerImageCache>({
    default: null,
    selected: null,
  });
  const markerRegistryRef = useRef<Map<LibraryCode, MarkerRegistryEntry>>(new Map());
  const selectedMarkerCodeRef = useRef<LibraryCode | null>(null);
  const handleMarkerClick = useEffectEvent((item: LibrarySearchCoordinateItem) => {
    const kakaoMaps = kakaoMapsRef.current;
    const map = mapRef.current;

    if (kakaoMaps == null || map == null) {
      return;
    }

    focusMapOnLibrary({
      kakaoMaps,
      latitude: item.latitude,
      longitude: item.longitude,
      map,
    });
    onSelectLibrary(item.code);
  });

  useEffect(() => {
    const kakaoMaps = kakaoMapsRef.current;
    const map = mapRef.current;

    if (kakaoMaps == null || map == null) {
      return;
    }

    syncMarkerRegistry({
      coordinateItems,
      kakaoMaps,
      map,
      markerImageCache: markerImageCacheRef.current,
      markerRegistry: markerRegistryRef.current,
      onMarkerClick: handleMarkerClick,
    });
  }, [coordinateItems, coordinateItemsKey, kakaoMapsRef, mapRef]);

  useEffect(() => {
    syncSelectedMarker({
      kakaoMaps: kakaoMapsRef.current,
      markerImageCache: markerImageCacheRef.current,
      markerRegistry: markerRegistryRef.current,
      nextSelectedCode: currentSelectedCoordinateCode,
      selectedMarkerCodeRef,
    });
  }, [coordinateItemsKey, currentSelectedCoordinateCode, kakaoMapsRef]);

  useEffect(() => {
    const markerRegistry = markerRegistryRef.current;
    const kakaoMaps = kakaoMapsRef.current;

    return () => {
      clearMarkerRegistry({
        kakaoMaps,
        markerRegistry,
      });
    };
  }, [kakaoMapsRef]);
}

export {useLibraryMapMarkers};
