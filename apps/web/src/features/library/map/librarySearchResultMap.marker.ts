import type {LibraryCode, LibrarySearchItem} from '@nearby-library-search/contracts';

type LibrarySearchCoordinateItem = LibrarySearchItem & {
  latitude: number;
  longitude: number;
};
type MarkerRegistryEntry = {
  clickHandler: () => void;
  marker: KakaoMapsMarker;
  signature: string;
};
type MarkerImageCache = {
  default: KakaoMapsMarkerImage | null;
  selected: KakaoMapsMarkerImage | null;
};

function createMarkerSignature(item: LibrarySearchCoordinateItem) {
  return `${item.code}:${item.latitude}:${item.longitude}`;
}

function syncMarkerRegistry({
  coordinateItems,
  kakaoMaps,
  map,
  markerImageCache,
  markerRegistry,
  onMarkerClick,
}: {
  coordinateItems: LibrarySearchCoordinateItem[];
  kakaoMaps: KakaoMapsNamespace;
  map: KakaoMapsMap;
  markerImageCache: MarkerImageCache;
  markerRegistry: Map<LibraryCode, MarkerRegistryEntry>;
  onMarkerClick: (item: LibrarySearchCoordinateItem) => void;
}) {
  const nextCoordinateItemsByCode = new Map(coordinateItems.map(item => [item.code, item]));

  markerRegistry.forEach((entry, code) => {
    const nextItem = nextCoordinateItemsByCode.get(code);
    const nextSignature = nextItem ? createMarkerSignature(nextItem) : null;

    if (nextSignature === entry.signature) {
      return;
    }

    kakaoMaps.event.removeListener(entry.marker, 'click', entry.clickHandler);
    entry.marker.setMap(null);
    markerRegistry.delete(code);
  });

  coordinateItems.forEach(item => {
    if (markerRegistry.has(item.code)) {
      return;
    }

    const marker = new kakaoMaps.Marker({
      image: getMarkerImage({
        isSelected: false,
        kakaoMaps,
        markerImageCache,
      }),
      map,
      position: new kakaoMaps.LatLng(item.latitude, item.longitude),
    });
    const clickHandler = () => {
      onMarkerClick(item);
    };

    kakaoMaps.event.addListener(marker, 'click', clickHandler);
    markerRegistry.set(item.code, {
      clickHandler,
      marker,
      signature: createMarkerSignature(item),
    });
  });
}

function clearMarkerRegistry({
  kakaoMaps,
  markerRegistry,
}: {
  kakaoMaps: KakaoMapsNamespace | null;
  markerRegistry: Map<LibraryCode, MarkerRegistryEntry>;
}) {
  markerRegistry.forEach(entry => {
    if (kakaoMaps) {
      kakaoMaps.event.removeListener(entry.marker, 'click', entry.clickHandler);
    }

    entry.marker.setMap(null);
  });
  markerRegistry.clear();
}

function syncSelectedMarker({
  kakaoMaps,
  markerImageCache,
  markerRegistry,
  nextSelectedCode,
  selectedMarkerCodeRef,
}: {
  kakaoMaps: KakaoMapsNamespace | null;
  markerImageCache: MarkerImageCache;
  markerRegistry: Map<LibraryCode, MarkerRegistryEntry>;
  nextSelectedCode: LibraryCode | null;
  selectedMarkerCodeRef: {current: LibraryCode | null};
}) {
  if (kakaoMaps == null || selectedMarkerCodeRef.current === nextSelectedCode) {
    return;
  }

  const previousSelectedMarker = selectedMarkerCodeRef.current
    ? markerRegistry.get(selectedMarkerCodeRef.current)?.marker
    : null;

  if (previousSelectedMarker) {
    previousSelectedMarker.setImage(
      getMarkerImage({
        isSelected: false,
        kakaoMaps,
        markerImageCache,
      }),
    );
  }

  const nextSelectedMarker = nextSelectedCode ? markerRegistry.get(nextSelectedCode)?.marker : null;

  if (nextSelectedMarker) {
    nextSelectedMarker.setImage(
      getMarkerImage({
        isSelected: true,
        kakaoMaps,
        markerImageCache,
      }),
    );
  }

  selectedMarkerCodeRef.current = nextSelectedCode;
}

function getMarkerImage({
  isSelected,
  kakaoMaps,
  markerImageCache,
}: {
  isSelected: boolean;
  kakaoMaps: KakaoMapsNamespace;
  markerImageCache: MarkerImageCache;
}) {
  const cacheKey = isSelected ? 'selected' : 'default';
  const cachedImage = markerImageCache[cacheKey];

  if (cachedImage) {
    return cachedImage;
  }

  const markerImage = new kakaoMaps.MarkerImage(
    createMarkerSvgDataUrl(isSelected),
    new kakaoMaps.Size(32, 40),
    {
      offset: new kakaoMaps.Point(16, 36),
    },
  );

  markerImageCache[cacheKey] = markerImage;

  return markerImage;
}

function createMarkerSvgDataUrl(isSelected: boolean) {
  const fillColor = isSelected ? '#3B5DD9' : '#8B95A9';
  const strokeColor = isSelected ? '#2748C3' : '#6B7689';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40" fill="none"><path d="M16 2C9.09644 2 3.5 7.59644 3.5 14.5C3.5 23.75 16 38 16 38C16 38 28.5 23.75 28.5 14.5C28.5 7.59644 22.9036 2 16 2Z" fill="${fillColor}" stroke="${strokeColor}" stroke-width="2"/><circle cx="16" cy="14" r="4.5" fill="white"/></svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export {clearMarkerRegistry, syncMarkerRegistry, syncSelectedMarker};
export type {LibrarySearchCoordinateItem, MarkerImageCache, MarkerRegistryEntry};
