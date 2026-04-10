declare global {
  type KakaoMapsPoint = {
    x: number;
    y: number;
  };

  type KakaoMapsSize = {
    width: number;
    height: number;
  };

  type KakaoMapsLatLng = {
    getLat(): number;
    getLng(): number;
  };

  type KakaoMapsLatLngBounds = {
    contain(latlng: KakaoMapsLatLng): boolean;
    extend(latlng: KakaoMapsLatLng): void;
  };

  type KakaoMapsMarkerImage = object;

  type KakaoMapsMapOptions = {
    center: KakaoMapsLatLng;
    level: number;
  };

  type KakaoMapsMarkerOptions = {
    image?: KakaoMapsMarkerImage;
    map?: KakaoMapsMap | null;
    position: KakaoMapsLatLng;
  };

  type KakaoMapsMap = {
    panTo(latlng: KakaoMapsLatLng): void;
    relayout(): void;
    setBounds(bounds: KakaoMapsLatLngBounds): void;
    setCenter(latlng: KakaoMapsLatLng): void;
    setLevel(level: number): void;
  };

  type KakaoMapsMarker = {
    setImage(image: KakaoMapsMarkerImage): void;
    setMap(map: KakaoMapsMap | null): void;
  };

  type KakaoMapsNamespace = {
    LatLng: new (latitude: number, longitude: number) => KakaoMapsLatLng;
    LatLngBounds: new () => KakaoMapsLatLngBounds;
    Map: new (container: HTMLElement, options: KakaoMapsMapOptions) => KakaoMapsMap;
    Marker: new (options: KakaoMapsMarkerOptions) => KakaoMapsMarker;
    MarkerImage: new (
      src: string,
      size: KakaoMapsSize,
      options?: {offset?: KakaoMapsPoint},
    ) => KakaoMapsMarkerImage;
    Point: new (x: number, y: number) => KakaoMapsPoint;
    Size: new (width: number, height: number) => KakaoMapsSize;
    load(onLoad: () => void): void;
  };

  type KakaoGlobal = {
    maps: KakaoMapsNamespace;
  };

  interface Window {
    kakao?: KakaoGlobal;
  }
}

export {};
