import {useEffect, useRef, useState} from 'react';
import {kakaoMapConfig} from '@/shared/env';
import {loadKakaoMapSdk} from '@/shared/kakao-map';
import {Heading, Text} from '@/shared/ui';
import {LibrarySearchResultMapControls, LibrarySearchResultMapPlaceholderBody} from './LibrarySearchResultMapPanel';

type LibrarySearchResultMapStatus = 'loading' | 'ready' | 'unavailable';
const DEFAULT_KAKAO_MAP_CENTER = Object.freeze({
  latitude: 37.5665,
  longitude: 126.978,
});
const DEFAULT_KAKAO_MAP_LEVEL = 8;

function LibrarySearchResultMap() {
  const [status, setStatus] = useState<LibrarySearchResultMapStatus>(() =>
    kakaoMapConfig.isEnabled ? 'loading' : 'unavailable',
  );
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<KakaoMapsMap | null>(null);
  const relayoutFrameRef = useRef<number | null>(null);

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

  if (status === 'unavailable') {
    return <LibrarySearchResultMapUnavailableBody />;
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

export {LibrarySearchResultMap, LibrarySearchResultMapUnavailableBody};
