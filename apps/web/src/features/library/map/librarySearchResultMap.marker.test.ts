import {describe, expect, it, vi} from 'vitest';
import {syncSelectedMarker} from './librarySearchResultMap.marker';

function createMockKakaoMaps() {
  return {
    MarkerImage: vi.fn(function MockMarkerImage(this: KakaoMapsMarkerImage, src: string) {
      Object.assign(this, {src});
    }) as unknown as KakaoMapsNamespace['MarkerImage'],
    Point: vi.fn(function MockPoint(this: KakaoMapsPoint) {
      this.x = 0;
      this.y = 0;
    }) as unknown as KakaoMapsNamespace['Point'],
    Size: vi.fn(function MockSize(this: KakaoMapsSize) {
      this.width = 32;
      this.height = 40;
    }) as unknown as KakaoMapsNamespace['Size'],
  } as Pick<KakaoMapsNamespace, 'MarkerImage' | 'Point' | 'Size'>;
}

describe('syncSelectedMarker', () => {
  it('이전 선택 marker는 원복하고 다음 선택 marker만 강조한다', () => {
    const kakaoMaps = createMockKakaoMaps() as KakaoMapsNamespace;
    const defaultMarker = {
      setImage: vi.fn(),
      setMap: vi.fn(),
    } as KakaoMapsMarker;
    const nextMarker = {
      setImage: vi.fn(),
      setMap: vi.fn(),
    } as KakaoMapsMarker;
    const markerRegistry = new Map([
      ['LIB0001', {clickHandler: vi.fn(), marker: defaultMarker, signature: 'LIB0001:1:1'}],
      ['LIB0002', {clickHandler: vi.fn(), marker: nextMarker, signature: 'LIB0002:2:2'}],
    ]);
    const markerImageCache = {
      default: null,
      selected: null,
    };
    const selectedMarkerCodeRef = {
      current: 'LIB0001',
    };

    syncSelectedMarker({
      kakaoMaps,
      markerImageCache,
      markerRegistry,
      nextSelectedCode: 'LIB0002',
      selectedMarkerCodeRef,
    });

    expect(defaultMarker.setImage).toHaveBeenCalledTimes(1);
    expect(nextMarker.setImage).toHaveBeenCalledTimes(1);
    expect(selectedMarkerCodeRef.current).toBe('LIB0002');

    syncSelectedMarker({
      kakaoMaps,
      markerImageCache,
      markerRegistry,
      nextSelectedCode: 'LIB0002',
      selectedMarkerCodeRef,
    });

    expect(defaultMarker.setImage).toHaveBeenCalledTimes(1);
    expect(nextMarker.setImage).toHaveBeenCalledTimes(1);
  });
});
