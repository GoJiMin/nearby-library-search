import type {LibrarySearchItem} from '@nearby-library-search/contracts';

type LibrarySearchCoordinateItem = LibrarySearchItem & {
  latitude: number;
  longitude: number;
};

const DEFAULT_KAKAO_MAP_CENTER = Object.freeze({
  latitude: 37.5665,
  longitude: 126.978,
});
const DEFAULT_KAKAO_MAP_LEVEL = 8;
const DEFAULT_SELECTED_LIBRARY_LEVEL = 3;
const DEFAULT_SINGLE_LIBRARY_LEVEL = 4;
const MIN_KAKAO_MAP_LEVEL = 1;
const MAX_KAKAO_MAP_LEVEL = 14;

function createCoordinateItemsKey(coordinateItems: LibrarySearchCoordinateItem[]) {
  return coordinateItems
    .map(item => `${item.code}:${item.latitude}:${item.longitude}`)
    .join('|');
}

function applyInitialMapViewport({
  coordinateItems,
  kakaoMaps,
  map,
}: {
  coordinateItems: LibrarySearchCoordinateItem[];
  kakaoMaps: KakaoMapsNamespace;
  map: KakaoMapsMap;
}) {
  if (coordinateItems.length === 1) {
    map.setCenter(new kakaoMaps.LatLng(coordinateItems[0].latitude, coordinateItems[0].longitude));
    map.setLevel(DEFAULT_SINGLE_LIBRARY_LEVEL);

    return;
  }

  const bounds = new kakaoMaps.LatLngBounds();

  coordinateItems.forEach(item => {
    bounds.extend(new kakaoMaps.LatLng(item.latitude, item.longitude));
  });
  map.setBounds(bounds);
}

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

function focusMapOnCoordinateItem({
  item,
  kakaoMaps,
  map,
}: {
  item: LibrarySearchCoordinateItem;
  kakaoMaps: KakaoMapsNamespace;
  map: KakaoMapsMap;
}) {
  focusMapOnLibrary({
    kakaoMaps,
    latitude: item.latitude,
    longitude: item.longitude,
    map,
  });
}

export {
  DEFAULT_KAKAO_MAP_CENTER,
  DEFAULT_KAKAO_MAP_LEVEL,
  DEFAULT_SELECTED_LIBRARY_LEVEL,
  DEFAULT_SINGLE_LIBRARY_LEVEL,
  MAX_KAKAO_MAP_LEVEL,
  MIN_KAKAO_MAP_LEVEL,
  applyInitialMapViewport,
  createCoordinateItemsKey,
  focusMapOnLibrary,
  focusMapOnCoordinateItem,
};
