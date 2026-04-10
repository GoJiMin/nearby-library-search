import {useEffect, useRef, useState} from 'react';
import {appConfig, kakaoMapConfig} from '@/shared/env';
import {KakaoMapSdkLoadError, type KakaoMapSdkLoadErrorCode, loadKakaoMapSdk} from '@/shared/kakao-map';
import {DEFAULT_KAKAO_MAP_CENTER, DEFAULT_KAKAO_MAP_LEVEL} from '../lib/librarySearchResultMap.viewport';

type LibrarySearchResultMapStatus = 'disabled' | 'error' | 'loading' | 'ready';

function useKakaoMapInstance() {
  const [status, setStatus] = useState<LibrarySearchResultMapStatus>(() =>
    kakaoMapConfig.isEnabled ? 'loading' : 'disabled',
  );
  const [errorCode, setErrorCode] = useState<KakaoMapSdkLoadErrorCode | null>(() =>
    kakaoMapConfig.isEnabled ? null : 'disabled',
  );
  const containerRef = useRef<HTMLDivElement | null>(null);
  const kakaoMapsRef = useRef<KakaoMapsNamespace | null>(null);
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

  return {
    containerRef,
    errorCode,
    kakaoMapsRef,
    mapRef,
    status,
  };
}

export {useKakaoMapInstance};
export type {LibrarySearchResultMapStatus};
