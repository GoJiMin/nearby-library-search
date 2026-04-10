import {afterEach, describe, expect, it, vi} from 'vitest';

function createMockKakaoMaps(): KakaoMapsNamespace {
  return {
    LatLng: vi.fn(function MockLatLng(this: object) {
      return this;
    }) as unknown as KakaoMapsNamespace['LatLng'],
    LatLngBounds: vi.fn(function MockLatLngBounds(this: KakaoMapsLatLngBounds) {
      this.contain = vi.fn();
      this.extend = vi.fn();
    }) as unknown as KakaoMapsNamespace['LatLngBounds'],
    Map: vi.fn(function MockMap(this: object) {
      return this;
    }) as unknown as KakaoMapsNamespace['Map'],
    Marker: vi.fn(function MockMarker(this: KakaoMapsMarker) {
      this.setImage = vi.fn();
      this.setMap = vi.fn();
    }) as unknown as KakaoMapsNamespace['Marker'],
    MarkerImage: vi.fn(function MockMarkerImage(this: object) {
      return this;
    }) as unknown as KakaoMapsNamespace['MarkerImage'],
    Point: vi.fn(function MockPoint(this: object) {
      return this;
    }) as unknown as KakaoMapsNamespace['Point'],
    Size: vi.fn(function MockSize(this: object) {
      return this;
    }) as unknown as KakaoMapsNamespace['Size'],
    event: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
    load: vi.fn(onLoad => {
      onLoad();
    }),
  };
}

async function importLoadKakaoMapSdk({
  appKey = 'test-kakao-app-key',
  isEnabled = true,
}: {
  appKey?: string;
  isEnabled?: boolean;
} = {}) {
  vi.resetModules();

  vi.doMock('@/shared/env', async importOriginal => {
    const actual = await importOriginal<typeof import('@/shared/env')>();

    return {
      ...actual,
      kakaoMapConfig: {
        appKey,
        isEnabled,
      },
    };
  });

  return import('./loadKakaoMapSdk');
}

afterEach(() => {
  vi.doUnmock('@/shared/env');
  vi.restoreAllMocks();
  document.head.querySelectorAll('script').forEach(script => {
    script.remove();
  });
  Reflect.deleteProperty(window, 'kakao');
});

describe('loadKakaoMapSdk', () => {
  it('여러 번 호출해도 script는 한 번만 추가되고 같은 promise를 재사용한다', async () => {
    const appendChildSpy = vi.spyOn(document.head, 'appendChild');
    const {KAKAO_MAP_SDK_SCRIPT_ID, loadKakaoMapSdk} = await importLoadKakaoMapSdk();

    const firstPromise = loadKakaoMapSdk();
    const secondPromise = loadKakaoMapSdk();

    expect(firstPromise).toBe(secondPromise);
    expect(appendChildSpy).toHaveBeenCalledTimes(1);

    const script = document.getElementById(KAKAO_MAP_SDK_SCRIPT_ID);

    expect(script).toBeInstanceOf(HTMLScriptElement);

    const kakaoMaps = createMockKakaoMaps();

    window.kakao = {maps: kakaoMaps};
    script?.dispatchEvent(new Event('load'));

    await expect(firstPromise).resolves.toBe(kakaoMaps);
    expect(kakaoMaps.load).toHaveBeenCalledTimes(1);
  });

  it('설정이 비활성화돼 있으면 script를 추가하지 않고 즉시 실패한다', async () => {
    const appendChildSpy = vi.spyOn(document.head, 'appendChild');
    const {loadKakaoMapSdk} = await importLoadKakaoMapSdk({
      appKey: undefined,
      isEnabled: false,
    });

    await expect(loadKakaoMapSdk()).rejects.toThrow('Kakao Map SDK is not enabled.');
    expect(appendChildSpy).not.toHaveBeenCalled();
  });

  it('script load 실패 시 reject하고 다음 재시도를 위해 script를 제거한다', async () => {
    const {KAKAO_MAP_SDK_SCRIPT_ID, loadKakaoMapSdk} = await importLoadKakaoMapSdk();

    const promise = loadKakaoMapSdk();
    const script = document.getElementById(KAKAO_MAP_SDK_SCRIPT_ID);

    script?.dispatchEvent(new Event('error'));

    await expect(promise).rejects.toThrow('Failed to load Kakao Map SDK script.');
    expect(document.getElementById(KAKAO_MAP_SDK_SCRIPT_ID)).toBeNull();
  });
});
