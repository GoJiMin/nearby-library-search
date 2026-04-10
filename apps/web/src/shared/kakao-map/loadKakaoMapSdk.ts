import {kakaoMapConfig} from '@/shared/env';

const KAKAO_MAP_SDK_SCRIPT_ID = 'kakao-map-sdk';
let kakaoMapSdkPromise: Promise<KakaoMapsNamespace> | null = null;
type KakaoMapSdkLoadErrorCode = 'disabled' | 'non-browser' | 'script-load-failed' | 'sdk-not-available';

class KakaoMapSdkLoadError extends Error {
  code: KakaoMapSdkLoadErrorCode;

  constructor(code: KakaoMapSdkLoadErrorCode, message: string) {
    super(message);
    this.code = code;
    this.name = 'KakaoMapSdkLoadError';
  }
}

function createKakaoMapSdkUrl(appKey: string) {
  const searchParams = new URLSearchParams({
    appkey: appKey,
    autoload: 'false',
  });

  return `https://dapi.kakao.com/v2/maps/sdk.js?${searchParams.toString()}`;
}

function loadKakaoMapSdk(): Promise<KakaoMapsNamespace> {
  const appKey = kakaoMapConfig.appKey;

  if (!kakaoMapConfig.isEnabled || appKey == null) {
    return Promise.reject(new KakaoMapSdkLoadError('disabled', 'Kakao Map SDK is not enabled.'));
  }

  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return Promise.reject(new KakaoMapSdkLoadError('non-browser', 'Kakao Map SDK requires a browser environment.'));
  }

  if (kakaoMapSdkPromise) {
    return kakaoMapSdkPromise;
  }

  kakaoMapSdkPromise = new Promise((resolve, reject) => {
    const rejectWithReset = (code: KakaoMapSdkLoadErrorCode, message: string) => {
      kakaoMapSdkPromise = null;
      reject(new KakaoMapSdkLoadError(code, message));
    };

    const resolveWithKakaoMaps = () => {
      const kakaoMaps = window.kakao?.maps;

      if (kakaoMaps == null || typeof kakaoMaps.load !== 'function') {
        rejectWithReset('sdk-not-available', 'Kakao Map SDK did not become available.');

        return;
      }

      kakaoMaps.load(() => {
        resolve(kakaoMaps);
      });
    };

    if (window.kakao?.maps?.load) {
      resolveWithKakaoMaps();

      return;
    }

    const existingScript = document.getElementById(KAKAO_MAP_SDK_SCRIPT_ID) as HTMLScriptElement | null;
    const script =
      existingScript ??
      Object.assign(document.createElement('script'), {
        async: true,
        id: KAKAO_MAP_SDK_SCRIPT_ID,
        src: createKakaoMapSdkUrl(appKey),
      });

    const cleanup = () => {
      script.removeEventListener('error', handleError);
      script.removeEventListener('load', handleLoad);
    };

    const handleLoad = () => {
      cleanup();
      resolveWithKakaoMaps();
    };

    const handleError = () => {
      cleanup();

      if (existingScript == null) {
        script.remove();
      }

      rejectWithReset('script-load-failed', 'Failed to load Kakao Map SDK script.');
    };

    script.addEventListener('load', handleLoad, {once: true});
    script.addEventListener('error', handleError, {once: true});

    if (existingScript == null) {
      document.head.appendChild(script);
    }
  });

  return kakaoMapSdkPromise;
}

export {KAKAO_MAP_SDK_SCRIPT_ID, KakaoMapSdkLoadError, loadKakaoMapSdk};
export type {KakaoMapSdkLoadErrorCode};
