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

type LibrarySearchResultMapProps = {
  focusRequest: {code: LibraryCode; requestId: number} | null;
  items: LibrarySearchItem[];
  onSelectLibrary: (code: LibraryCode) => void;
  selectedLibraryCode: LibraryCode | null;
};
type MarkerRegistryEntry = {
  clickHandler: () => void;
  marker: KakaoMapsMarker;
  signature: string;
};
type MarkerImageCache = {
  default: KakaoMapsMarkerImage | null;
  selected: KakaoMapsMarkerImage | null;
};

function LibrarySearchResultMap({
  focusRequest,
  items,
  onSelectLibrary,
  selectedLibraryCode,
}: LibrarySearchResultMapProps) {
  const {containerRef, errorCode, kakaoMapsRef, mapRef, status} = useKakaoMapInstance();
  const markerImageCacheRef = useRef<MarkerImageCache>({
    default: null,
    selected: null,
  });
  const markerRegistryRef = useRef<Map<LibraryCode, MarkerRegistryEntry>>(new Map());
  const onSelectLibraryRef = useRef(onSelectLibrary);
  const selectedMarkerCodeRef = useRef<LibraryCode | null>(null);
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

  useEffect(() => {
    onSelectLibraryRef.current = onSelectLibrary;
  }, [onSelectLibrary]);

  useEffect(() => {
    const kakaoMaps = kakaoMapsRef.current;
    const map = mapRef.current;

    if (kakaoMaps == null || map == null) {
      return;
    }

    const nextCoordinateItemsByCode = new Map(coordinateItems.map(item => [item.code, item]));

    markerRegistryRef.current.forEach((entry, code) => {
      const nextItem = nextCoordinateItemsByCode.get(code);
      const nextSignature = nextItem ? createMarkerSignature(nextItem) : null;

      if (nextSignature === entry.signature) {
        return;
      }

      kakaoMaps.event.removeListener(entry.marker, 'click', entry.clickHandler);
      entry.marker.setMap(null);
      markerRegistryRef.current.delete(code);
    });

    coordinateItems.forEach(item => {
      if (markerRegistryRef.current.has(item.code)) {
        return;
      }

      const marker = new kakaoMaps.Marker({
        image: getMarkerImage({
          isSelected: false,
          kakaoMaps,
          markerImageCache: markerImageCacheRef.current,
        }),
        map,
        position: new kakaoMaps.LatLng(item.latitude, item.longitude),
      });
      const clickHandler = () => {
        focusMapOnLibrary({
          kakaoMaps,
          latitude: item.latitude,
          longitude: item.longitude,
          map,
        });
        onSelectLibraryRef.current(item.code);
      };

      kakaoMaps.event.addListener(marker, 'click', clickHandler);
      markerRegistryRef.current.set(item.code, {
        clickHandler,
        marker,
        signature: createMarkerSignature(item),
      });
    });
  }, [coordinateItems, coordinateItemsKey, kakaoMapsRef, mapRef]);

  useEffect(() => {
    const kakaoMaps = kakaoMapsRef.current;
    const map = mapRef.current;

    if (kakaoMaps == null || map == null || coordinateItems.length === 0) {
      applySelectedMarker({
        kakaoMaps,
        markerImageCache: markerImageCacheRef.current,
        markerRegistry: markerRegistryRef.current,
        nextSelectedCode: null,
        selectedMarkerCodeRef,
      });
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

    applySelectedMarker({
      kakaoMaps,
      markerImageCache: markerImageCacheRef.current,
      markerRegistry: markerRegistryRef.current,
      nextSelectedCode: currentSelectedCoordinateCode,
      selectedMarkerCodeRef,
    });
  }, [coordinateItems, coordinateItemsKey, currentSelectedCoordinateCode, kakaoMapsRef, mapRef]);

  useEffect(() => {
    const kakaoMaps = kakaoMapsRef.current;

    applySelectedMarker({
      kakaoMaps,
      markerImageCache: markerImageCacheRef.current,
      markerRegistry: markerRegistryRef.current,
      nextSelectedCode: currentSelectedCoordinateCode,
      selectedMarkerCodeRef,
    });
  }, [currentSelectedCoordinateCode, kakaoMapsRef]);

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

  useEffect(() => {
    const markerRegistry = markerRegistryRef.current;
    const kakaoMaps = kakaoMapsRef.current;

    return () => {
      markerRegistry.forEach(entry => {
        if (kakaoMaps) {
          kakaoMaps.event.removeListener(entry.marker, 'click', entry.clickHandler);
        }

        entry.marker.setMap(null);
      });
      markerRegistry.clear();
    };
  }, [kakaoMapsRef]);

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

function createMarkerSignature(item: LibrarySearchItem & {latitude: number; longitude: number}) {
  return `${item.code}:${item.latitude}:${item.longitude}`;
}

function applySelectedMarker({
  kakaoMaps,
  markerImageCache,
  markerRegistry,
  nextSelectedCode,
  selectedMarkerCodeRef,
}: {
  kakaoMaps: KakaoMapsNamespace | null;
  markerImageCache: MarkerImageCache;
  markerRegistry: Map<LibraryCode, MarkerRegistryEntry>;
  nextSelectedCode: LibraryCode | null;
  selectedMarkerCodeRef: {current: LibraryCode | null};
}) {
  if (kakaoMaps == null || selectedMarkerCodeRef.current === nextSelectedCode) {
    return;
  }

  const previousSelectedMarker = selectedMarkerCodeRef.current
    ? markerRegistry.get(selectedMarkerCodeRef.current)?.marker
    : null;

  if (previousSelectedMarker) {
    previousSelectedMarker.setImage(
      getMarkerImage({
        isSelected: false,
        kakaoMaps,
        markerImageCache,
      }),
    );
  }

  const nextSelectedMarker = nextSelectedCode ? markerRegistry.get(nextSelectedCode)?.marker : null;

  if (nextSelectedMarker) {
    nextSelectedMarker.setImage(
      getMarkerImage({
        isSelected: true,
        kakaoMaps,
        markerImageCache,
      }),
    );
  }

  selectedMarkerCodeRef.current = nextSelectedCode;
}

function getMarkerImage({
  isSelected,
  kakaoMaps,
  markerImageCache,
}: {
  isSelected: boolean;
  kakaoMaps: KakaoMapsNamespace;
  markerImageCache: MarkerImageCache;
}) {
  const cacheKey = isSelected ? 'selected' : 'default';
  const cachedImage = markerImageCache[cacheKey];

  if (cachedImage) {
    return cachedImage;
  }

  const markerImage = new kakaoMaps.MarkerImage(
    createMarkerSvgDataUrl(isSelected),
    new kakaoMaps.Size(32, 40),
    {
      offset: new kakaoMaps.Point(16, 36),
    },
  );

  markerImageCache[cacheKey] = markerImage;

  return markerImage;
}

function createMarkerSvgDataUrl(isSelected: boolean) {
  const fillColor = isSelected ? '#3B5DD9' : '#8B95A9';
  const strokeColor = isSelected ? '#2748C3' : '#6B7689';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40" fill="none"><path d="M16 2C9.09644 2 3.5 7.59644 3.5 14.5C3.5 23.75 16 38 16 38C16 38 28.5 23.75 28.5 14.5C28.5 7.59644 22.9036 2 16 2Z" fill="${fillColor}" stroke="${strokeColor}" stroke-width="2"/><circle cx="16" cy="14" r="4.5" fill="white"/></svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export {LibrarySearchResultMap};
export type {LibrarySearchResultMapProps};
