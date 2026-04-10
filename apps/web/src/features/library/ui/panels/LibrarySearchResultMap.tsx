import type {LibraryCode, LibrarySearchItem} from '@nearby-library-search/contracts';
import {useEffect, useRef, useState} from 'react';
import {hasLibraryCoordinates} from '@/entities/library';
import {kakaoMapConfig} from '@/shared/env';
import {loadKakaoMapSdk} from '@/shared/kakao-map';
import {Heading, Text} from '@/shared/ui';
import {LibrarySearchResultMapControls, LibrarySearchResultMapPlaceholderBody} from './LibrarySearchResultMapPanel';

type LibrarySearchResultMapStatus = 'loading' | 'ready' | 'unavailable';
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

const DEFAULT_KAKAO_MAP_CENTER = Object.freeze({
  latitude: 37.5665,
  longitude: 126.978,
});
const DEFAULT_KAKAO_MAP_LEVEL = 8;

function LibrarySearchResultMap({
  items,
  onSelectLibrary,
  selectedLibraryCode: _selectedLibraryCode,
}: LibrarySearchResultMapProps) {
  const [status, setStatus] = useState<LibrarySearchResultMapStatus>(() =>
    kakaoMapConfig.isEnabled ? 'loading' : 'unavailable',
  );
  const containerRef = useRef<HTMLDivElement | null>(null);
  const kakaoMapsRef = useRef<KakaoMapsNamespace | null>(null);
  const mapRef = useRef<KakaoMapsMap | null>(null);
  const markerRegistryRef = useRef<Map<LibraryCode, MarkerRegistryEntry>>(new Map());
  const onSelectLibraryRef = useRef(onSelectLibrary);
  const relayoutFrameRef = useRef<number | null>(null);
  const coordinateItems = items.filter(hasLibraryCoordinates);
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
        setStatus('ready');

        relayoutFrameRef.current = window.requestAnimationFrame(() => {
          mapRef.current?.relayout();
        });
      })
      .catch(() => {
        if (!isDisposed) {
          setStatus('unavailable');
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
        map,
        position: new kakaoMaps.LatLng(item.latitude, item.longitude),
      });
      const clickHandler = () => {
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

  if (status === 'unavailable') {
    return <LibrarySearchResultMapUnavailableBody />;
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

function LibrarySearchResultMapUnavailableBody() {
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

export {LibrarySearchResultMap, LibrarySearchResultMapNoCoordinateBody, LibrarySearchResultMapUnavailableBody};
export type {LibrarySearchResultMapProps};
