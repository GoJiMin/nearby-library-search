import {describe, expect, it, vi} from 'vitest';
import {applyInitialMapViewport} from './librarySearchResultMap.viewport';

function createMockKakaoMaps() {
  return {
    LatLng: vi.fn(function MockLatLng(this: KakaoMapsLatLng, latitude: number, longitude: number) {
      this.getLat = vi.fn(() => latitude);
      this.getLng = vi.fn(() => longitude);
    }) as unknown as KakaoMapsNamespace['LatLng'],
    LatLngBounds: vi.fn(function MockLatLngBounds(this: KakaoMapsLatLngBounds) {
      this.contain = vi.fn(() => false);
      this.extend = vi.fn();
    }) as unknown as KakaoMapsNamespace['LatLngBounds'],
  } as Pick<KakaoMapsNamespace, 'LatLng' | 'LatLngBounds'>;
}

function createMockMap() {
  return {
    setBounds: vi.fn(),
    setCenter: vi.fn(),
    setLevel: vi.fn(),
  } as Pick<KakaoMapsMap, 'setBounds' | 'setCenter' | 'setLevel'>;
}

describe('applyInitialMapViewport', () => {
  it('좌표가 1건이면 setCenter와 setLevel을 사용한다', () => {
    const kakaoMaps = createMockKakaoMaps();
    const map = createMockMap();

    applyInitialMapViewport({
      coordinateItems: [
        {
          address: '서울특별시 마포구 월드컵북로 1',
          closedDays: '둘째 주 월요일',
          code: 'LIB0001',
          fax: null,
          homepage: null,
          latitude: 37.5563,
          longitude: 126.9236,
          name: '마포중앙도서관',
          operatingTime: '09:00 - 22:00',
          phone: '02-1234-5678',
        },
      ],
      kakaoMaps: kakaoMaps as KakaoMapsNamespace,
      map: map as KakaoMapsMap,
    });

    expect(map.setCenter).toHaveBeenCalledTimes(1);
    expect(map.setLevel).toHaveBeenCalledWith(4);
    expect(map.setBounds).not.toHaveBeenCalled();
  });

  it('좌표가 2건 이상이면 setBounds를 사용한다', () => {
    const kakaoMaps = createMockKakaoMaps();
    const map = createMockMap();

    applyInitialMapViewport({
      coordinateItems: [
        {
          address: '서울특별시 마포구 월드컵북로 1',
          closedDays: '둘째 주 월요일',
          code: 'LIB0001',
          fax: null,
          homepage: null,
          latitude: 37.5563,
          longitude: 126.9236,
          name: '마포중앙도서관',
          operatingTime: '09:00 - 22:00',
          phone: '02-1234-5678',
        },
        {
          address: '서울특별시 마포구 독막로 11',
          closedDays: '매주 일요일',
          code: 'LIB0011',
          fax: null,
          homepage: null,
          latitude: 37.5491,
          longitude: 126.9132,
          name: '상수문화도서관',
          operatingTime: '08:00 - 18:00',
          phone: '02-7777-1111',
        },
      ],
      kakaoMaps: kakaoMaps as KakaoMapsNamespace,
      map: map as KakaoMapsMap,
    });

    expect(map.setBounds).toHaveBeenCalledTimes(1);
    expect(map.setCenter).not.toHaveBeenCalled();
    expect(map.setLevel).not.toHaveBeenCalled();
  });
});
