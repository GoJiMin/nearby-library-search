import {kakaoMapConfig} from '@/shared/env';

const KAKAO_MAP_SDK_SCRIPT_ID = 'kakao-map-sdk';
let kakaoMapSdkPromise: Promise<KakaoMapsNamespace> | null = null;

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
    return Promise.reject(new Error('Kakao Map SDK is not enabled.'));
  }

  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return Promise.reject(new Error('Kakao Map SDK requires a browser environment.'));
  }

  if (kakaoMapSdkPromise) {
    return kakaoMapSdkPromise;
  }

  kakaoMapSdkPromise = new Promise((resolve, reject) => {
    const rejectWithReset = (message: string) => {
      kakaoMapSdkPromise = null;
      reject(new Error(message));
    };

    const resolveWithKakaoMaps = () => {
      const kakaoMaps = window.kakao?.maps;

      if (kakaoMaps == null || typeof kakaoMaps.load !== 'function') {
        rejectWithReset('Kakao Map SDK did not become available.');

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

      rejectWithReset('Failed to load Kakao Map SDK script.');
    };

    script.addEventListener('load', handleLoad, {once: true});
    script.addEventListener('error', handleError, {once: true});

    if (existingScript == null) {
      document.head.appendChild(script);
    }
  });

  return kakaoMapSdkPromise;
}

export {KAKAO_MAP_SDK_SCRIPT_ID, loadKakaoMapSdk};
