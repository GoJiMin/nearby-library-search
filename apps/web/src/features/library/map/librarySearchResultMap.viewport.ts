const DEFAULT_KAKAO_MAP_CENTER = Object.freeze({
  latitude: 37.5665,
  longitude: 126.978,
});
const DEFAULT_KAKAO_MAP_LEVEL = 8;
const DEFAULT_SELECTED_LIBRARY_LEVEL = 3;
const DEFAULT_SINGLE_LIBRARY_LEVEL = 4;
const MIN_KAKAO_MAP_LEVEL = 1;
const MAX_KAKAO_MAP_LEVEL = 14;

function focusMapOnLibrary({
  kakaoMaps,
  latitude,
  longitude,
  map,
}: {
  kakaoMaps: KakaoMapsNamespace;
  latitude: number;
  longitude: number;
  map: KakaoMapsMap;
}) {
  map.setLevel(DEFAULT_SELECTED_LIBRARY_LEVEL);
  map.panTo(new kakaoMaps.LatLng(latitude, longitude));
}

export {
  DEFAULT_KAKAO_MAP_CENTER,
  DEFAULT_KAKAO_MAP_LEVEL,
  DEFAULT_SELECTED_LIBRARY_LEVEL,
  DEFAULT_SINGLE_LIBRARY_LEVEL,
  MAX_KAKAO_MAP_LEVEL,
  MIN_KAKAO_MAP_LEVEL,
  focusMapOnLibrary,
};
