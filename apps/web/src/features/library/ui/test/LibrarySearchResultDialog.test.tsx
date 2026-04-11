import {render, screen, waitFor, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {AppProvider} from '@/app/providers';
import {LibrarySearchResultDialog} from '@/features/library';
import {KakaoMapSdkLoadError} from '@/shared/kakao-map';
import type {LibrarySearchResultDialogProps} from '../../model/librarySearchResultDialog.contract';
import {LibrarySearchResultDetailFooterCta} from '../panels/LibrarySearchResultDetailPanel';

const {
  mockAppConfig,
  mockKakaoMapConfig,
  mockLoadKakaoMapSdk,
  mockLibrarySearchResponse,
  mockSecondPageLibrarySearchResponse,
  mockUseGetSearchLibraries,
} = vi.hoisted(() => ({
  mockAppConfig: {
    envName: 'development',
    isDevelopment: true,
    isProduction: false,
  },
  mockKakaoMapConfig: {
    appKey: undefined as string | undefined,
    isEnabled: false,
  },
  mockLoadKakaoMapSdk: vi.fn(),
  mockLibrarySearchResponse: {
    detailRegion: '11140',
    isbn: '9788954682155',
    items: [
      {
        address: '서울특별시 마포구 월드컵북로 1',
        closedDays: '둘째 주 월요일',
        code: 'LIB0001',
        fax: null,
        homepage: 'https://library.example.com',
        latitude: 37.5563,
        longitude: 126.9236,
        name: '마포중앙도서관',
        operatingTime: '09:00 - 22:00',
        phone: '02-1234-5678',
      },
      {
        address: '서울특별시 마포구 양화로 2',
        closedDays: '법정 공휴일',
        code: 'LIB0002',
        fax: null,
        homepage: null,
        latitude: null,
        longitude: null,
        name: '합정열람실',
        operatingTime: '10:00 - 20:00',
        phone: '02-2222-3333',
      },
    ],
    page: 1,
    pageSize: 10,
    region: '11',
    resultCount: 2,
    totalCount: 12,
  },
  mockSecondPageLibrarySearchResponse: {
    detailRegion: '11140',
    isbn: '9788954682155',
    items: [
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
      {
        address: '서울특별시 마포구 성지길 12',
        closedDays: '명절 휴관',
        code: 'LIB0012',
        fax: null,
        homepage: 'https://seongsan.example.com',
        latitude: 37.5631,
        longitude: 126.9084,
        name: '성산열람실',
        operatingTime: '11:00 - 21:00',
        phone: '02-8888-2222',
      },
    ],
    page: 2,
    pageSize: 10,
    region: '11',
    resultCount: 2,
    totalCount: 12,
  },
  mockUseGetSearchLibraries: vi.fn(),
}));

vi.mock('@/entities/library', async importOriginal => {
  const actual = await importOriginal<typeof import('@/entities/library')>();

  return {
    ...actual,
    useGetSearchLibraries: mockUseGetSearchLibraries,
  };
});

vi.mock('@/shared/env', async importOriginal => {
  const actual = await importOriginal<typeof import('@/shared/env')>();

  return {
    ...actual,
    appConfig: mockAppConfig,
    kakaoMapConfig: mockKakaoMapConfig,
  };
});

vi.mock('@/shared/kakao-map', async importOriginal => {
  const actual = await importOriginal<typeof import('@/shared/kakao-map')>();

  return {
    ...actual,
    loadKakaoMapSdk: mockLoadKakaoMapSdk,
  };
});

function createMockKakaoMaps() {
  const relayout = vi.fn();
  const panTo = vi.fn();
  const setBounds = vi.fn();
  const setCenter = vi.fn();
  let currentLevel = 5;
  const setLevel = vi.fn((nextLevel: number) => {
    currentLevel = nextLevel;
  });
  const markerRecords: Array<{
    marker: KakaoMapsMarker;
    options: KakaoMapsMarkerOptions;
    setImage: ReturnType<typeof vi.fn>;
    setMap: ReturnType<typeof vi.fn>;
  }> = [];
  const markerClickHandlers = new Map<KakaoMapsMarker, () => void>();
  const mapConstructor = vi.fn(function MockMap(this: KakaoMapsMap) {
    this.getLevel = vi.fn(() => currentLevel);
    this.panTo = panTo;
    this.relayout = relayout;
    this.setBounds = setBounds;
    this.setCenter = setCenter;
    this.setLevel = setLevel;
  }) as unknown as KakaoMapsNamespace['Map'];

  const kakaoMaps: KakaoMapsNamespace = {
    LatLng: vi.fn(function MockLatLng(this: KakaoMapsLatLng, latitude: number, longitude: number) {
      this.getLat = vi.fn(() => latitude);
      this.getLng = vi.fn(() => longitude);
    }) as unknown as KakaoMapsNamespace['LatLng'],
    LatLngBounds: vi.fn(function MockLatLngBounds(this: KakaoMapsLatLngBounds) {
      this.contain = vi.fn(() => false);
      this.extend = vi.fn();
    }) as unknown as KakaoMapsNamespace['LatLngBounds'],
    Map: mapConstructor,
    Marker: vi.fn(function MockMarker(this: KakaoMapsMarker, options: KakaoMapsMarkerOptions) {
      const setImage = vi.fn();
      const setMap = vi.fn();

      this.setImage = setImage;
      this.setMap = setMap;
      markerRecords.push({
        marker: this,
        options,
        setImage,
        setMap,
      });
    }) as unknown as KakaoMapsNamespace['Marker'],
    MarkerImage: vi.fn(function MockMarkerImage(this: KakaoMapsMarkerImage) {
      return this;
    }) as unknown as KakaoMapsNamespace['MarkerImage'],
    Point: vi.fn(function MockPoint(this: KakaoMapsPoint) {
      this.x = 0;
      this.y = 0;
    }) as unknown as KakaoMapsNamespace['Point'],
    Size: vi.fn(function MockSize(this: KakaoMapsSize) {
      this.height = 32;
      this.width = 32;
    }) as unknown as KakaoMapsNamespace['Size'],
    event: {
      addListener: vi.fn((target: KakaoMapsMarker, _type: 'click', handler: () => void) => {
        markerClickHandlers.set(target, handler);
      }),
      removeListener: vi.fn((target: KakaoMapsMarker) => {
        markerClickHandlers.delete(target);
      }),
    },
    load: vi.fn(onLoad => {
      onLoad();
    }),
  };

  return {
    kakaoMaps,
    mapConstructor,
    markerRecords,
    panTo,
    relayout,
    setBounds,
    setCenter,
    setLevel,
    triggerMarkerClickByCoordinates: ({
      latitude,
      longitude,
    }: {
      latitude: number;
      longitude: number;
    }) => {
      const record = markerRecords.find(candidate => {
        const position = candidate.options.position;

        return position.getLat() === latitude && position.getLng() === longitude;
      });

      if (record == null) {
        throw new Error(`Marker at ${latitude}, ${longitude} is not available.`);
      }

      const handler = markerClickHandlers.get(record.marker);

      if (handler == null) {
        throw new Error(`Marker at ${latitude}, ${longitude} does not have a click handler.`);
      }

      handler();
    },
  };
}

function renderLibrarySearchResultDialog() {
  return render(
    <AppProvider>
      <LibrarySearchResultDialog
        onBackToRegionSelect={vi.fn()}
        onChangePage={vi.fn()}
        onCheckAvailability={vi.fn()}
        onOpenChange={vi.fn()}
        onSelectLibrary={vi.fn()}
        open
        params={{
          detailRegion: '11140',
          isbn: '9788954682155',
          page: 1,
          region: '11',
        }}
        selectedBook={{
          author: '이민진',
          isbn13: '9788954682155',
          title: '파친코',
        }}
        selectedLibraryCode={null}
      />
    </AppProvider>,
  );
}

function renderLibrarySearchResultDialogWithProps({
  onChangePage = vi.fn(),
  onOpenChange = vi.fn(),
  onSelectLibrary = vi.fn(),
  params = {
    detailRegion: '11140',
    isbn: '9788954682155',
    page: 1,
    region: '11',
  },
  selectedLibraryCode = null,
}: {
  onChangePage?: LibrarySearchResultDialogProps['onChangePage'];
  onOpenChange?: LibrarySearchResultDialogProps['onOpenChange'];
  onSelectLibrary?: LibrarySearchResultDialogProps['onSelectLibrary'];
  params?: NonNullable<LibrarySearchResultDialogProps['params']>;
  selectedLibraryCode?: LibrarySearchResultDialogProps['selectedLibraryCode'];
} = {}) {
  return render(
    <AppProvider>
      <LibrarySearchResultDialog
        onBackToRegionSelect={vi.fn()}
        onChangePage={onChangePage}
        onCheckAvailability={vi.fn()}
        onOpenChange={onOpenChange}
        onSelectLibrary={onSelectLibrary}
        open
        params={params}
        selectedBook={{
          author: '이민진',
          isbn13: '9788954682155',
          title: '파친코',
        }}
        selectedLibraryCode={selectedLibraryCode}
      />
    </AppProvider>,
  );
}

describe('LibrarySearchResultDialog', () => {
  beforeEach(() => {
    mockUseGetSearchLibraries.mockReset();
    mockUseGetSearchLibraries.mockReturnValue(mockLibrarySearchResponse);
    mockKakaoMapConfig.appKey = undefined;
    mockKakaoMapConfig.isEnabled = false;
    mockLoadKakaoMapSdk.mockReset();
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => {
      callback(0);

      return 1;
    });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('조회 성공 시 실제 결과 개수 summary와 3영역 shell을 렌더링한다', async () => {
    renderLibrarySearchResultDialog();

    const dialog = await screen.findByRole('dialog', {name: '도서관 검색 결과'});
    const detailPanel = screen.getByLabelText('선택된 도서관 정보 패널');

    expect(dialog).toBeInTheDocument();
    expect(screen.getByRole('heading', {name: '검색 결과'})).toBeInTheDocument();
    expect(screen.getByText('총 12개의 도서관을 검색했어요.')).toBeInTheDocument();
    expect(screen.getByLabelText('검색 결과 목록 패널')).toBeInTheDocument();
    expect(screen.getByLabelText('도서관 지도 패널')).toBeInTheDocument();
    expect(screen.getByLabelText('선택된 도서관 정보 패널')).toBeInTheDocument();
    expect(screen.getByRole('button', {name: '대출 가능 여부 조회'})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: /마포중앙도서관/})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: /합정열람실/})).toBeInTheDocument();
    expect(within(detailPanel).getByRole('heading', {name: '마포중앙도서관'})).toBeInTheDocument();
    expect(within(detailPanel).getByText('09:00 - 22:00')).toBeInTheDocument();
    expect(within(detailPanel).getByText('둘째 주 월요일')).toBeInTheDocument();
    expect(within(detailPanel).getByText('서울특별시 마포구 월드컵북로 1')).toBeInTheDocument();
    expect(within(detailPanel).getByText('02-1234-5678')).toBeInTheDocument();
  });

  it('totalPages가 2 이상이면 상태 기반 페이지네이션을 렌더링하고 현재 페이지를 표시한다', async () => {
    renderLibrarySearchResultDialog();

    const pagination = await screen.findByRole('navigation', {name: '도서관 검색 결과 페이지네이션'});

    expect(within(pagination).getByText('1')).toHaveAttribute('aria-current', 'page');
    expect(within(pagination).getByRole('button', {name: '2페이지'})).toBeInTheDocument();
    expect(within(pagination).getByRole('button', {name: '이전 페이지'})).toBeDisabled();
    expect(within(pagination).getByRole('button', {name: '다음 페이지'})).not.toBeDisabled();
  });

  it('페이지 버튼을 누르면 onChangePage를 호출한다', async () => {
    const user = userEvent.setup();
    const onChangePage = vi.fn();

    renderLibrarySearchResultDialogWithProps({onChangePage});

    await user.click(await screen.findByRole('button', {name: '2페이지'}));

    expect(onChangePage).toHaveBeenCalledWith(2);
  });

  it('totalPages가 1이면 페이지네이션을 렌더링하지 않는다', async () => {
    mockUseGetSearchLibraries.mockReturnValue({
      ...mockLibrarySearchResponse,
      resultCount: 2,
      totalCount: 2,
    });

    renderLibrarySearchResultDialog();

    await screen.findByRole('dialog', {name: '도서관 검색 결과'});

    expect(screen.queryByRole('navigation', {name: '도서관 검색 결과 페이지네이션'})).not.toBeInTheDocument();
  });

  it('카카오 지도 설정이 없으면 panel 내부 unavailable UI를 렌더링하고 loader를 호출하지 않는다', async () => {
    renderLibrarySearchResultDialog();

    const mapPanel = await screen.findByLabelText('도서관 지도 패널');

    expect(within(mapPanel).getByText('지도를 표시할 수 없어요')).toBeInTheDocument();
    expect(
      within(mapPanel).getByText('카카오 지도 설정을 확인한 뒤 다시 시도해 주세요.'),
    ).toBeInTheDocument();
    expect(within(mapPanel).getByText('개발 진단: disabled')).toBeInTheDocument();
    expect(mockLoadKakaoMapSdk).not.toHaveBeenCalled();
    expect(console.error).not.toHaveBeenCalled();
  });

  it('SDK loader가 실패하면 panel 내부 unavailable UI로 fallback한다', async () => {
    mockKakaoMapConfig.appKey = 'test-kakao-app-key';
    mockKakaoMapConfig.isEnabled = true;
    mockLoadKakaoMapSdk.mockRejectedValue(
      new KakaoMapSdkLoadError('script-load-failed', 'Failed to load Kakao Map SDK script.'),
    );

    renderLibrarySearchResultDialog();

    const mapPanel = await screen.findByLabelText('도서관 지도 패널');

    expect(await within(mapPanel).findByText('지도를 표시할 수 없어요')).toBeInTheDocument();
    expect(within(mapPanel).getByText('개발 진단: script-load-failed')).toBeInTheDocument();
    expect(mockLoadKakaoMapSdk).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith(
      '[KakaoMap] SDK load failed.',
      expect.objectContaining({
        code: 'script-load-failed',
        message: 'Failed to load Kakao Map SDK script.',
      }),
    );
  });

  it('SDK가 준비되면 실제 Kakao map baseline을 만들고 relayout을 호출한다', async () => {
    const {kakaoMaps, mapConstructor, relayout} = createMockKakaoMaps();

    mockKakaoMapConfig.appKey = 'test-kakao-app-key';
    mockKakaoMapConfig.isEnabled = true;
    mockLoadKakaoMapSdk.mockResolvedValue(kakaoMaps);

    renderLibrarySearchResultDialog();

    const mapPanel = await screen.findByLabelText('도서관 지도 패널');

    await waitFor(() => {
      expect(mockLoadKakaoMapSdk).toHaveBeenCalledTimes(1);
      expect(mapConstructor).toHaveBeenCalledTimes(1);
      expect(relayout).toHaveBeenCalledTimes(1);
    });

    expect(within(mapPanel).queryByText('지도를 표시할 수 없어요')).not.toBeInTheDocument();
    expect(mapPanel.querySelector('[data-slot="kakao-map-canvas"]')).not.toBeNull();
    expect(within(mapPanel).getByRole('button', {name: '지도 확대'})).toBeInTheDocument();
    expect(within(mapPanel).getByRole('button', {name: '지도 축소'})).toBeInTheDocument();
    expect(within(mapPanel).getByRole('button', {name: '선택 위치로 이동'})).toBeInTheDocument();
  });

  it('selectedLibraryCode가 바뀌어도 map instance를 다시 만들지 않는다', async () => {
    const {kakaoMaps, mapConstructor} = createMockKakaoMaps();

    mockKakaoMapConfig.appKey = 'test-kakao-app-key';
    mockKakaoMapConfig.isEnabled = true;
    mockLoadKakaoMapSdk.mockResolvedValue(kakaoMaps);

    const view = renderLibrarySearchResultDialogWithProps({
      selectedLibraryCode: 'LIB0001',
    });

    await waitFor(() => {
      expect(mapConstructor).toHaveBeenCalledTimes(1);
    });

    view.rerender(
      <AppProvider>
        <LibrarySearchResultDialog
          onBackToRegionSelect={vi.fn()}
          onChangePage={vi.fn()}
          onCheckAvailability={vi.fn()}
          onOpenChange={vi.fn()}
          onSelectLibrary={vi.fn()}
          open
          params={{
            detailRegion: '11140',
            isbn: '9788954682155',
            page: 1,
            region: '11',
          }}
          selectedBook={{
            author: '이민진',
            isbn13: '9788954682155',
            title: '파친코',
          }}
          selectedLibraryCode="LIB0002"
        />
      </AppProvider>,
    );

    await waitFor(() => {
      expect(mapConstructor).toHaveBeenCalledTimes(1);
    });
  });

  it('좌표가 있는 도서관만 marker를 만들고 1건이면 setCenter와 setLevel로 초기 위치를 맞춘다', async () => {
    const {kakaoMaps, markerRecords, panTo, setBounds, setCenter, setLevel} = createMockKakaoMaps();

    mockKakaoMapConfig.appKey = 'test-kakao-app-key';
    mockKakaoMapConfig.isEnabled = true;
    mockLoadKakaoMapSdk.mockResolvedValue(kakaoMaps);

    renderLibrarySearchResultDialog();

    await waitFor(() => {
      expect(markerRecords).toHaveLength(1);
      expect(setCenter).toHaveBeenCalledTimes(1);
      expect(setLevel).toHaveBeenCalledWith(4);
    });

    expect(setBounds).not.toHaveBeenCalled();
    expect(panTo).not.toHaveBeenCalled();
  });

  it('최초 진입에서 기본 선택된 첫 번째 도서관 marker를 바로 강조한다', async () => {
    const {kakaoMaps, markerRecords} = createMockKakaoMaps();

    mockKakaoMapConfig.appKey = 'test-kakao-app-key';
    mockKakaoMapConfig.isEnabled = true;
    mockLoadKakaoMapSdk.mockResolvedValue(kakaoMaps);

    renderLibrarySearchResultDialog();

    await waitFor(() => {
      expect(markerRecords).toHaveLength(1);
      expect(markerRecords[0].setImage).toHaveBeenCalledTimes(1);
    });
  });

  it('현재 페이지에 좌표가 여러 건이면 setBounds로 전체 marker 범위를 먼저 맞춘다', async () => {
    const {kakaoMaps, setBounds, setCenter} = createMockKakaoMaps();

    mockUseGetSearchLibraries.mockReturnValue(mockSecondPageLibrarySearchResponse);
    mockKakaoMapConfig.appKey = 'test-kakao-app-key';
    mockKakaoMapConfig.isEnabled = true;
    mockLoadKakaoMapSdk.mockResolvedValue(kakaoMaps);

    renderLibrarySearchResultDialogWithProps({
      params: {
        detailRegion: '11140',
        isbn: '9788954682155',
        page: 2,
        region: '11',
      },
    });

    await waitFor(() => {
      expect(setBounds).toHaveBeenCalledTimes(1);
    });

    expect(setCenter).not.toHaveBeenCalled();
  });

  it('리스트에서 좌표가 있는 도서관을 명시적으로 선택하면 확대와 함께 포커스하고 기존 marker를 재생성하지 않는다', async () => {
    const user = userEvent.setup();
    const {kakaoMaps, markerRecords, panTo, setLevel} = createMockKakaoMaps();

    mockUseGetSearchLibraries.mockReturnValue(mockSecondPageLibrarySearchResponse);
    mockKakaoMapConfig.appKey = 'test-kakao-app-key';
    mockKakaoMapConfig.isEnabled = true;
    mockLoadKakaoMapSdk.mockResolvedValue(kakaoMaps);

    renderLibrarySearchResultDialogWithProps({
      params: {
        detailRegion: '11140',
        isbn: '9788954682155',
        page: 2,
        region: '11',
      },
    });

    await waitFor(() => {
      expect(markerRecords).toHaveLength(2);
    });

    expect(panTo).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', {name: /성산열람실/}));

    await waitFor(() => {
      expect(panTo).toHaveBeenCalledTimes(1);
      expect(setLevel).toHaveBeenCalledWith(3);
      expect(markerRecords).toHaveLength(2);
    });
  });

  it('기본 선택된 첫 번째 좌표 도서관도 명시적으로 다시 선택하면 확대와 함께 포커스한다', async () => {
    const user = userEvent.setup();
    const {kakaoMaps, panTo, setLevel} = createMockKakaoMaps();

    mockKakaoMapConfig.appKey = 'test-kakao-app-key';
    mockKakaoMapConfig.isEnabled = true;
    mockLoadKakaoMapSdk.mockResolvedValue(kakaoMaps);

    renderLibrarySearchResultDialogWithProps();

    await waitFor(() => {
      expect(screen.getByRole('button', {name: /마포중앙도서관/})).toBeInTheDocument();
    });

    expect(panTo).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', {name: /마포중앙도서관/}));

    await waitFor(() => {
      expect(panTo).toHaveBeenCalledTimes(1);
      expect(setLevel).toHaveBeenCalledWith(3);
    });
  });

  it('지도 확대와 축소 버튼은 현재 level 기준으로 setLevel을 호출한다', async () => {
    const user = userEvent.setup();
    const {kakaoMaps, setLevel} = createMockKakaoMaps();

    mockKakaoMapConfig.appKey = 'test-kakao-app-key';
    mockKakaoMapConfig.isEnabled = true;
    mockLoadKakaoMapSdk.mockResolvedValue(kakaoMaps);

    renderLibrarySearchResultDialog();

    await user.click(await screen.findByRole('button', {name: '지도 확대'}));
    await user.click(screen.getByRole('button', {name: '지도 축소'}));

    expect(setLevel).toHaveBeenNthCalledWith(1, 4);
    expect(setLevel).toHaveBeenNthCalledWith(2, 5);
  });

  it('좌표가 없는 도서관을 선택하면 panTo하지 않고 목록과 상세 정보만 갱신한다', async () => {
    const {kakaoMaps, panTo} = createMockKakaoMaps();

    mockKakaoMapConfig.appKey = 'test-kakao-app-key';
    mockKakaoMapConfig.isEnabled = true;
    mockLoadKakaoMapSdk.mockResolvedValue(kakaoMaps);

    const view = renderLibrarySearchResultDialogWithProps();

    await waitFor(() => {
      expect(screen.getByRole('button', {name: /마포중앙도서관/})).toBeInTheDocument();
    });

    expect(panTo).not.toHaveBeenCalled();

    view.rerender(
      <AppProvider>
        <LibrarySearchResultDialog
          onBackToRegionSelect={vi.fn()}
          onChangePage={vi.fn()}
          onCheckAvailability={vi.fn()}
          onOpenChange={vi.fn()}
          onSelectLibrary={vi.fn()}
          open
          params={{
            detailRegion: '11140',
            isbn: '9788954682155',
            page: 1,
            region: '11',
          }}
          selectedBook={{
            author: '이민진',
            isbn13: '9788954682155',
            title: '파친코',
          }}
          selectedLibraryCode="LIB0002"
        />
      </AppProvider>,
    );

    const detailPanel = await screen.findByLabelText('선택된 도서관 정보 패널');

    expect(panTo).not.toHaveBeenCalled();
    expect(within(detailPanel).getByRole('heading', {name: '합정열람실'})).toBeInTheDocument();
  });

  it('marker를 클릭하면 해당 code로 onSelectLibrary를 호출한다', async () => {
    const {kakaoMaps, markerRecords, triggerMarkerClickByCoordinates} = createMockKakaoMaps();
    const onSelectLibrary = vi.fn();

    mockUseGetSearchLibraries.mockReturnValue(mockSecondPageLibrarySearchResponse);
    mockKakaoMapConfig.appKey = 'test-kakao-app-key';
    mockKakaoMapConfig.isEnabled = true;
    mockLoadKakaoMapSdk.mockResolvedValue(kakaoMaps);

    renderLibrarySearchResultDialogWithProps({
      onSelectLibrary,
      params: {
        detailRegion: '11140',
        isbn: '9788954682155',
        page: 2,
        region: '11',
      },
    });

    await waitFor(() => {
      expect(screen.getByRole('button', {name: /상수문화도서관/})).toBeInTheDocument();
      expect(markerRecords).toHaveLength(2);
    });

    triggerMarkerClickByCoordinates({
      latitude: 37.5631,
      longitude: 126.9084,
    });

    expect(onSelectLibrary).toHaveBeenCalledWith('LIB0012');
  });

  it('현재 페이지 결과에 좌표가 하나도 없으면 no-coordinate fallback과 controls hidden을 렌더링한다', async () => {
    const {kakaoMaps} = createMockKakaoMaps();

    mockUseGetSearchLibraries.mockReturnValue({
      ...mockLibrarySearchResponse,
      items: mockLibrarySearchResponse.items.map(item => ({
        ...item,
        latitude: null,
        longitude: null,
      })),
    });
    mockKakaoMapConfig.appKey = 'test-kakao-app-key';
    mockKakaoMapConfig.isEnabled = true;
    mockLoadKakaoMapSdk.mockResolvedValue(kakaoMaps);

    renderLibrarySearchResultDialog();

    const mapPanel = await screen.findByLabelText('도서관 지도 패널');

    expect(within(mapPanel).getByText('지도로 표시할 수 있는 위치 정보가 없어요')).toBeInTheDocument();
    expect(
      within(mapPanel).getByText('현재 페이지 결과는 목록과 상세 정보로만 확인할 수 있어요.'),
    ).toBeInTheDocument();
    expect(within(mapPanel).queryByRole('button', {name: '지도 확대'})).not.toBeInTheDocument();
  });

  it('selectedLibraryCode가 없으면 첫 번째 도서관을 기본 선택하고 onSelectLibrary로 동기화한다', async () => {
    const onSelectLibrary = vi.fn();

    renderLibrarySearchResultDialogWithProps({onSelectLibrary});

    const firstRow = await screen.findByRole('button', {name: /마포중앙도서관/});
    const secondRow = screen.getByRole('button', {name: /합정열람실/});

    expect(firstRow).toHaveAttribute('aria-pressed', 'true');
    expect(secondRow).toHaveAttribute('aria-pressed', 'false');

    await waitFor(() => {
      expect(onSelectLibrary).toHaveBeenCalledWith('LIB0001');
    });
  });

  it('현재 페이지에 없는 selectedLibraryCode가 들어오면 첫 번째 도서관으로 fallback한다', async () => {
    const onSelectLibrary = vi.fn();

    renderLibrarySearchResultDialogWithProps({
      onSelectLibrary,
      selectedLibraryCode: 'LIB9999',
    });

    const firstRow = await screen.findByRole('button', {name: /마포중앙도서관/});

    expect(firstRow).toHaveAttribute('aria-pressed', 'true');
    await waitFor(() => {
      expect(onSelectLibrary).toHaveBeenCalledWith('LIB0001');
    });
  });

  it('유효한 selectedLibraryCode가 있으면 해당 도서관을 active row로 유지한다', async () => {
    const onSelectLibrary = vi.fn();

    renderLibrarySearchResultDialogWithProps({
      onSelectLibrary,
      selectedLibraryCode: 'LIB0002',
    });

    const firstRow = await screen.findByRole('button', {name: /마포중앙도서관/});
    const secondRow = screen.getByRole('button', {name: /합정열람실/});

    expect(firstRow).toHaveAttribute('aria-pressed', 'false');
    expect(secondRow).toHaveAttribute('aria-pressed', 'true');
    expect(onSelectLibrary).not.toHaveBeenCalled();
  });

  it('리스트 row를 클릭하면 해당 code로 onSelectLibrary를 호출한다', async () => {
    const user = userEvent.setup();
    const onSelectLibrary = vi.fn();

    renderLibrarySearchResultDialogWithProps({
      onSelectLibrary,
      selectedLibraryCode: 'LIB0001',
    });

    await user.click(await screen.findByRole('button', {name: /합정열람실/}));

    expect(onSelectLibrary).toHaveBeenCalledWith('LIB0002');
  });

  it('리스트 선택이 바뀌면 detail panel 정보도 같은 도서관으로 갱신된다', async () => {
    renderLibrarySearchResultDialogWithProps({
      selectedLibraryCode: 'LIB0002',
    });

    const detailPanel = await screen.findByLabelText('선택된 도서관 정보 패널');

    expect(within(detailPanel).getByRole('heading', {name: '합정열람실'})).toBeInTheDocument();
    expect(within(detailPanel).getByText('10:00 - 20:00')).toBeInTheDocument();
    expect(within(detailPanel).getByText('법정 공휴일')).toBeInTheDocument();
    expect(within(detailPanel).getByText('서울특별시 마포구 양화로 2')).toBeInTheDocument();
    expect(within(detailPanel).getByText('02-2222-3333')).toBeInTheDocument();
    expect(within(detailPanel).queryByRole('link', {name: '도서관 홈페이지 바로가기'})).not.toBeInTheDocument();
  });

  it('리스트 row는 native button keyboard interaction으로 선택할 수 있다', async () => {
    const user = userEvent.setup();
    const onSelectLibrary = vi.fn();

    renderLibrarySearchResultDialogWithProps({
      onSelectLibrary,
      selectedLibraryCode: 'LIB0001',
    });

    const secondRow = await screen.findByRole('button', {name: /합정열람실/});

    secondRow.focus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');

    expect(onSelectLibrary).toHaveBeenCalledWith('LIB0002');
    expect(onSelectLibrary).toHaveBeenCalledTimes(2);
  });

  it('선택된 도서관이 있으면 availability CTA를 누를 수 있고 handoff를 호출한다', async () => {
    const user = userEvent.setup();
    const onCheckAvailability = vi.fn();

    render(
      <AppProvider>
        <LibrarySearchResultDialog
          onBackToRegionSelect={vi.fn()}
          onChangePage={vi.fn()}
          onCheckAvailability={onCheckAvailability}
          onOpenChange={vi.fn()}
          onSelectLibrary={vi.fn()}
          open
          params={{
            detailRegion: '11140',
            isbn: '9788954682155',
            page: 1,
            region: '11',
          }}
          selectedBook={{
            author: '이민진',
            isbn13: '9788954682155',
            title: '파친코',
          }}
          selectedLibraryCode="LIB0001"
        />
      </AppProvider>,
    );

    await user.click(await screen.findByRole('button', {name: '대출 가능 여부 조회'}));

    expect(onCheckAvailability).toHaveBeenCalledTimes(1);
  });

  it('선택된 도서관이 없으면 availability CTA는 비활성이다', () => {
    render(
      <AppProvider>
        <LibrarySearchResultDetailFooterCta disabled onCheckAvailability={vi.fn()} />
      </AppProvider>,
    );

    expect(screen.getByRole('button', {name: '대출 가능 여부 조회'})).toBeDisabled();
  });

  it('조회가 suspend되면 loading shell을 유지한다', async () => {
    mockUseGetSearchLibraries.mockImplementation(() => {
      throw new Promise(() => {});
    });

    renderLibrarySearchResultDialog();

    expect(await screen.findByRole('dialog', {name: '도서관 검색 결과'})).toBeInTheDocument();
    expect(screen.getByText('도서관 검색 결과를 불러오고 있어요.')).toBeInTheDocument();
    expect(screen.getByLabelText('검색 결과 목록 패널')).toBeInTheDocument();
    expect(screen.getByLabelText('도서관 지도 패널')).toBeInTheDocument();
    expect(screen.getByLabelText('선택된 도서관 정보 패널')).toBeInTheDocument();
  });

  it('빈 응답이면 empty state와 복구 CTA를 렌더링한다', async () => {
    mockUseGetSearchLibraries.mockReturnValue({
      detailRegion: '11140',
      isbn: '9788954682155',
      items: [],
      page: 1,
      pageSize: 10,
      region: '11',
      resultCount: 0,
      totalCount: 0,
    });

    renderLibrarySearchResultDialog();

    expect(await screen.findByText('선택한 지역에서 소장 도서관을 찾지 못했어요')).toBeInTheDocument();
    expect(screen.getByRole('button', {name: '지역 다시 선택'})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: '다른 책 다시 선택'})).toBeInTheDocument();
  });

  it('empty state의 지역 다시 선택 CTA는 onBackToRegionSelect를 호출한다', async () => {
    const user = userEvent.setup();
    const onBackToRegionSelect = vi.fn();

    mockUseGetSearchLibraries.mockReturnValue({
      detailRegion: '11140',
      isbn: '9788954682155',
      items: [],
      page: 1,
      pageSize: 10,
      region: '11',
      resultCount: 0,
      totalCount: 0,
    });

    render(
      <AppProvider>
        <LibrarySearchResultDialog
          onBackToRegionSelect={onBackToRegionSelect}
          onChangePage={vi.fn()}
          onCheckAvailability={vi.fn()}
          onOpenChange={vi.fn()}
          onSelectLibrary={vi.fn()}
          open
          params={{
            detailRegion: '11140',
            isbn: '9788954682155',
            page: 1,
            region: '11',
          }}
          selectedBook={{
            author: '이민진',
            isbn13: '9788954682155',
            title: '파친코',
          }}
          selectedLibraryCode={null}
        />
      </AppProvider>,
    );

    await user.click(await screen.findByRole('button', {name: '지역 다시 선택'}));

    expect(onBackToRegionSelect).toHaveBeenCalledTimes(1);
  });

  it('empty state의 다른 책 다시 선택 CTA는 onOpenChange(false)를 호출한다', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    mockUseGetSearchLibraries.mockReturnValue({
      detailRegion: '11140',
      isbn: '9788954682155',
      items: [],
      page: 1,
      pageSize: 10,
      region: '11',
      resultCount: 0,
      totalCount: 0,
    });

    render(
      <AppProvider>
        <LibrarySearchResultDialog
          onBackToRegionSelect={vi.fn()}
          onChangePage={vi.fn()}
          onCheckAvailability={vi.fn()}
          onOpenChange={onOpenChange}
          onSelectLibrary={vi.fn()}
          open
          params={{
            detailRegion: '11140',
            isbn: '9788954682155',
            page: 1,
            region: '11',
          }}
          selectedBook={{
            author: '이민진',
            isbn13: '9788954682155',
            title: '파친코',
          }}
          selectedLibraryCode={null}
        />
      </AppProvider>,
    );

    await user.click(await screen.findByRole('button', {name: '다른 책 다시 선택'}));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('조회 에러면 recoverable error UI를 렌더링하고 다시 시도로 회복할 수 있다', async () => {
    const user = userEvent.setup();
    let shouldFail = true;

    mockUseGetSearchLibraries.mockImplementation(() => {
      if (shouldFail) {
        throw new Error('server exploded');
      }

      return mockLibrarySearchResponse;
    });

    renderLibrarySearchResultDialog();

    expect(await screen.findByText('도서관 검색 결과를 불러오지 못했어요')).toBeInTheDocument();
    expect(screen.getByRole('button', {name: '다시 시도'})).toBeInTheDocument();

    shouldFail = false;
    await user.click(screen.getByRole('button', {name: '다시 시도'}));

    expect(await screen.findByText('총 12개의 도서관을 검색했어요.')).toBeInTheDocument();
  });

  it('닫기 버튼을 누르면 onOpenChange(false)를 호출한다', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <AppProvider>
        <LibrarySearchResultDialog
          onBackToRegionSelect={vi.fn()}
          onChangePage={vi.fn()}
          onCheckAvailability={vi.fn()}
          onOpenChange={onOpenChange}
          onSelectLibrary={vi.fn()}
          open
          params={{
            isbn: '9788954682155',
            page: 1,
            region: '11',
          }}
          selectedBook={{
            author: '이민진',
            isbn13: '9788954682155',
            title: '파친코',
          }}
          selectedLibraryCode={null}
        />
      </AppProvider>,
    );

    await user.click(await screen.findByRole('button', {name: '닫기'}));

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it('open이 true여도 params나 selectedBook이 없으면 렌더링하지 않는다', () => {
    const {rerender} = render(
      <AppProvider>
        <LibrarySearchResultDialog
          onBackToRegionSelect={vi.fn()}
          onChangePage={vi.fn()}
          onCheckAvailability={vi.fn()}
          onOpenChange={vi.fn()}
          onSelectLibrary={vi.fn()}
          open
          params={null}
          selectedBook={{
            author: '이민진',
            isbn13: '9788954682155',
            title: '파친코',
          }}
          selectedLibraryCode={null}
        />
      </AppProvider>,
    );

    expect(screen.queryByRole('dialog', {name: '도서관 검색 결과'})).not.toBeInTheDocument();

    rerender(
      <AppProvider>
        <LibrarySearchResultDialog
          onBackToRegionSelect={vi.fn()}
          onChangePage={vi.fn()}
          onCheckAvailability={vi.fn()}
          onOpenChange={vi.fn()}
          onSelectLibrary={vi.fn()}
          open
          params={{
            isbn: '9788954682155',
            page: 1,
            region: '11',
          }}
          selectedBook={null}
          selectedLibraryCode={null}
        />
      </AppProvider>,
    );

    expect(screen.queryByRole('dialog', {name: '도서관 검색 결과'})).not.toBeInTheDocument();
  });
});
