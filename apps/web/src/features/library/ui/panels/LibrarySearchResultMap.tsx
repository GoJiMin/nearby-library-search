import type {LibraryCode, LibrarySearchItem} from '@nearby-library-search/contracts';
import {useEffect, useRef, useState} from 'react';
import {hasLibraryCoordinates} from '@/entities/library';
import {appConfig, kakaoMapConfig} from '@/shared/env';
import {KakaoMapSdkLoadError, type KakaoMapSdkLoadErrorCode, loadKakaoMapSdk} from '@/shared/kakao-map';
import {Heading, Text} from '@/shared/ui';
import {LibrarySearchResultMapControls, LibrarySearchResultMapPlaceholderBody} from './LibrarySearchResultMapPanel';

type LibrarySearchResultMapStatus = 'disabled' | 'error' | 'loading' | 'ready';
type LibrarySearchResultMapProps = {
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

const DEFAULT_KAKAO_MAP_CENTER = Object.freeze({
  latitude: 37.5665,
  longitude: 126.978,
});
const DEFAULT_KAKAO_MAP_LEVEL = 8;
const DEFAULT_SINGLE_LIBRARY_LEVEL = 4;

function LibrarySearchResultMap({
  items,
  onSelectLibrary,
  selectedLibraryCode,
}: LibrarySearchResultMapProps) {
  const [status, setStatus] = useState<LibrarySearchResultMapStatus>(() =>
    kakaoMapConfig.isEnabled ? 'loading' : 'disabled',
  );
  const [errorCode, setErrorCode] = useState<KakaoMapSdkLoadErrorCode | null>(() =>
    kakaoMapConfig.isEnabled ? null : 'disabled',
  );
  const containerRef = useRef<HTMLDivElement | null>(null);
  const kakaoMapsRef = useRef<KakaoMapsNamespace | null>(null);
  const mapRef = useRef<KakaoMapsMap | null>(null);
  const markerImageCacheRef = useRef<MarkerImageCache>({
    default: null,
    selected: null,
  });
  const markerRegistryRef = useRef<Map<LibraryCode, MarkerRegistryEntry>>(new Map());
  const onSelectLibraryRef = useRef(onSelectLibrary);
  const previousPannedLibraryCodeRef = useRef<LibraryCode | null>(null);
  const relayoutFrameRef = useRef<number | null>(null);
  const selectedMarkerCodeRef = useRef<LibraryCode | null>(null);
  const suppressedPanCodeRef = useRef<LibraryCode | null>(null);
  const viewportItemsKeyRef = useRef('');
  const fallbackSelectedLibrary = items[0] ?? null;
  const currentSelectedLibrary = items.find(item => item.code === selectedLibraryCode) ?? fallbackSelectedLibrary;
  const coordinateItems = items.filter(hasLibraryCoordinates);
  const currentSelectedCoordinateLibrary =
    currentSelectedLibrary && hasLibraryCoordinates(currentSelectedLibrary) ? currentSelectedLibrary : null;
  const currentSelectedCoordinateCode = currentSelectedCoordinateLibrary?.code ?? null;
  const currentSelectedCoordinateLatitude = currentSelectedCoordinateLibrary?.latitude ?? null;
  const currentSelectedCoordinateLongitude = currentSelectedCoordinateLibrary?.longitude ?? null;
  const coordinateItemsKey = coordinateItems
    .map(item => `${item.code}:${item.latitude}:${item.longitude}`)
    .join('|');

  useEffect(() => {
    onSelectLibraryRef.current = onSelectLibrary;
  }, [onSelectLibrary]);

  useEffect(() => {
    if (!kakaoMapConfig.isEnabled) {
      return;
    }

    let isDisposed = false;

    loadKakaoMapSdk()
      .then(kakaoMaps => {
        const container = containerRef.current;

        if (isDisposed || container == null) {
          return;
        }

        if (mapRef.current == null) {
          mapRef.current = new kakaoMaps.Map(container, {
            center: new kakaoMaps.LatLng(DEFAULT_KAKAO_MAP_CENTER.latitude, DEFAULT_KAKAO_MAP_CENTER.longitude),
            level: DEFAULT_KAKAO_MAP_LEVEL,
          });
        }

        kakaoMapsRef.current = kakaoMaps;
        setErrorCode(null);
        setStatus('ready');

        relayoutFrameRef.current = window.requestAnimationFrame(() => {
          mapRef.current?.relayout();
        });
      })
      .catch(error => {
        if (!isDisposed) {
          const nextError =
            error instanceof KakaoMapSdkLoadError
              ? error
              : new KakaoMapSdkLoadError('sdk-not-available', 'Unexpected Kakao Map SDK error.');

          if (appConfig.isDevelopment) {
            console.error('[KakaoMap] SDK load failed.', nextError);
          }

          setErrorCode(nextError.code);
          setStatus(nextError.code === 'disabled' ? 'disabled' : 'error');
        }
      });

    return () => {
      isDisposed = true;

      if (relayoutFrameRef.current != null) {
        window.cancelAnimationFrame(relayoutFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (status !== 'ready') {
      return;
    }

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
        if (selectedMarkerCodeRef.current === item.code) {
          return;
        }

        onSelectLibraryRef.current(item.code);
      };

      kakaoMaps.event.addListener(marker, 'click', clickHandler);
      markerRegistryRef.current.set(item.code, {
        clickHandler,
        marker,
        signature: createMarkerSignature(item),
      });
    });
  }, [coordinateItems, coordinateItemsKey, status]);

  useEffect(() => {
    if (status !== 'ready') {
      return;
    }

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
      previousPannedLibraryCodeRef.current = null;
      viewportItemsKeyRef.current = '';

      return;
    }

    if (coordinateItemsKey === viewportItemsKeyRef.current) {
      return;
    }

    suppressedPanCodeRef.current =
      selectedLibraryCode == null || currentSelectedLibrary?.code !== selectedLibraryCode
        ? currentSelectedCoordinateCode
        : null;
    previousPannedLibraryCodeRef.current = null;
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
  }, [
    coordinateItems,
    coordinateItemsKey,
    currentSelectedCoordinateCode,
    currentSelectedLibrary?.code,
    selectedLibraryCode,
    status,
  ]);

  useEffect(() => {
    if (status !== 'ready') {
      return;
    }

    const kakaoMaps = kakaoMapsRef.current;
    const map = mapRef.current;

    applySelectedMarker({
      kakaoMaps,
      markerImageCache: markerImageCacheRef.current,
      markerRegistry: markerRegistryRef.current,
      nextSelectedCode: currentSelectedCoordinateCode,
      selectedMarkerCodeRef,
    });

    if (
      kakaoMaps == null ||
      map == null ||
      currentSelectedCoordinateCode == null ||
      currentSelectedCoordinateLatitude == null ||
      currentSelectedCoordinateLongitude == null
    ) {
      previousPannedLibraryCodeRef.current = null;

      return;
    }

    if (suppressedPanCodeRef.current === currentSelectedCoordinateCode) {
      suppressedPanCodeRef.current = null;
      previousPannedLibraryCodeRef.current = currentSelectedCoordinateCode;

      return;
    }

    if (previousPannedLibraryCodeRef.current === currentSelectedCoordinateCode) {
      return;
    }

    map.panTo(new kakaoMaps.LatLng(currentSelectedCoordinateLatitude, currentSelectedCoordinateLongitude));
    previousPannedLibraryCodeRef.current = currentSelectedCoordinateCode;
  }, [
    currentSelectedCoordinateCode,
    currentSelectedCoordinateLatitude,
    currentSelectedCoordinateLongitude,
    status,
  ]);

  useEffect(() => {
    const markerRegistry = markerRegistryRef.current;

    return () => {
      const kakaoMaps = kakaoMapsRef.current;

      markerRegistry.forEach(entry => {
        if (kakaoMaps) {
          kakaoMaps.event.removeListener(entry.marker, 'click', entry.clickHandler);
        }

        entry.marker.setMap(null);
      });
      markerRegistry.clear();
    };
  }, []);

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
      <div className="absolute inset-0" data-slot="kakao-map-canvas" ref={containerRef} />
      {status === 'loading' ? <LibrarySearchResultMapPlaceholderBody /> : <LibrarySearchResultMapControls />}
    </>
  );
}

function LibrarySearchResultMapUnavailableBody({
  diagnosticCode,
}: {
  diagnosticCode?: KakaoMapSdkLoadErrorCode | null;
}) {
  return (
    <>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.38)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.38)_1px,transparent_1px)] bg-[size:44px_44px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.14),transparent_64%)]" />
      <div className="absolute inset-0 flex items-center justify-center px-6">
        <div className="shadow-card bg-surface-strong/92 max-w-76 rounded-3xl px-6 py-5 text-center backdrop-blur-sm">
          <Heading as="h3" size="sm">
            지도를 표시할 수 없어요
          </Heading>
          <Text className="mt-2" size="sm" tone="muted">
            카카오 지도 설정을 확인한 뒤 다시 시도해 주세요.
          </Text>
          {diagnosticCode ? (
            <Text className="mt-3 font-mono" size="xs" tone="muted">
              개발 진단: {diagnosticCode}
            </Text>
          ) : null}
        </div>
      </div>
      <LibrarySearchResultMapControls />
    </>
  );
}

function LibrarySearchResultMapNoCoordinateBody() {
  return (
    <>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.38)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.38)_1px,transparent_1px)] bg-[size:44px_44px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12),transparent_64%)]" />
      <div className="absolute inset-0 flex items-center justify-center px-6">
        <div className="shadow-card bg-surface-strong/92 max-w-76 rounded-3xl px-6 py-5 text-center backdrop-blur-sm">
          <Heading as="h3" size="sm">
            지도로 표시할 수 있는 위치 정보가 없어요
          </Heading>
          <Text className="mt-2" size="sm" tone="muted">
            현재 페이지 결과는 목록과 상세 정보로만 확인할 수 있어요.
          </Text>
        </div>
      </div>
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

export {LibrarySearchResultMap, LibrarySearchResultMapNoCoordinateBody, LibrarySearchResultMapUnavailableBody};
export type {LibrarySearchResultMapProps};
