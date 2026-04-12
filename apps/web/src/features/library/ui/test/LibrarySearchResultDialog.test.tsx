import {act, render, screen, waitFor, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {AppProvider} from '@/app/providers';
import {useFindLibraryStore} from '@/features/find-library';
import {LibrarySearchResultDialog} from '@/features/library';
import {KakaoMapSdkLoadError} from '@/shared/kakao-map';
import {RequestGetError} from '@/shared/request';
import {LibrarySearchResultDetails} from '../common/LibrarySearchResultDetails';

async function tabUntilFocused(user: ReturnType<typeof userEvent.setup>, target: HTMLElement, maxSteps = 32) {
  for (let step = 0; step < maxSteps; step += 1) {
    if (target === document.activeElement) {
      return;
    }

    await user.tab();
  }

  throw new Error(`Failed to focus target element within ${maxSteps} tab steps.`);
}

function mockMatchMedia(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      addEventListener: vi.fn(),
      addListener: vi.fn(),
      dispatchEvent: vi.fn(),
      matches,
      media: query,
      onchange: null,
      removeEventListener: vi.fn(),
      removeListener: vi.fn(),
    })),
  });
}

const DEFAULT_PARAMS = {
  detailRegion: '11140',
  isbn: '9788954682155',
  page: 1,
  region: '11',
};

const DEFAULT_SELECTED_BOOK = {
  author: '이민진',
  isbn13: '9788954682155',
  title: '파친코',
};

function createMockLibraryAvailabilityResponse({
  hasBook = 'Y',
  libraryCode = 'LIB0001',
  loanAvailable = 'Y',
}: {
  hasBook?: 'N' | 'Y';
  libraryCode?: string;
  loanAvailable?: 'N' | 'Y';
} = {}) {
  return {
    hasBook,
    isbn13: DEFAULT_PARAMS.isbn,
    libraryCode,
    loanAvailable,
  };
}

const {
  mockAppConfig,
  mockKakaoMapConfig,
  mockLoadKakaoMapSdk,
  mockLibrarySearchResponse,
  mockSecondPageLibrarySearchResponse,
  mockRequestGet,
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
  mockRequestGet: vi.fn(),
  mockUseGetSearchLibraries: vi.fn(),
}));

vi.mock('@/shared/request', async importOriginal => {
  const actual = await importOriginal<typeof import('@/shared/request')>();

  return {
    ...actual,
    requestGet: mockRequestGet,
  };
});

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

function seedLibraryDialogState({
  lastRegionSelection = {
    detailRegion: DEFAULT_PARAMS.detailRegion,
    region: DEFAULT_PARAMS.region,
  },
  params = DEFAULT_PARAMS,
  selectedBook = DEFAULT_SELECTED_BOOK,
  selectedLibraryCode = null,
}: {
  lastRegionSelection?: {
    detailRegion?: string;
    region: string;
  } | null;
  params?: {
    detailRegion?: string;
    isbn: string;
    page: number;
    region: string;
  } | null;
  selectedBook?: {
    author: string;
    isbn13: string;
    title: string;
  } | null;
  selectedLibraryCode?: string | null;
} = {}) {
  useFindLibraryStore.getState().resetFindLibraryFlow();
  useFindLibraryStore.setState({
    currentLibrarySearchParams: params,
    lastRegionSelection,
    libraryResultBook: selectedBook,
    regionDialogBook: null,
    selectedLibraryCode,
  });
}

function renderLibrarySearchResultDialog(options?: Parameters<typeof seedLibraryDialogState>[0]) {
  seedLibraryDialogState(options);

  return render(
    <AppProvider>
      <LibrarySearchResultDialog />
    </AppProvider>,
  );
}

describe('LibrarySearchResultDialog', () => {
  beforeEach(() => {
    mockMatchMedia(false);
    useFindLibraryStore.getState().resetFindLibraryFlow();
    mockRequestGet.mockReset();
    mockRequestGet.mockResolvedValue(createMockLibraryAvailabilityResponse());
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
    expect(screen.getByRole('button', {name: '지역 변경'})).toBeInTheDocument();
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
    expect(within(detailPanel).getByText('전날 대출 상태를 기준으로 제공돼 부정확할 수 있어요.')).toBeInTheDocument();
  });

  it('모바일 branch에서는 상세 정보, 리스트, 페이지네이션 순서로 조합하고 세로 스크롤을 가진다', async () => {
    mockMatchMedia(true);

    renderLibrarySearchResultDialog();

    const detailPanel = await screen.findByLabelText('선택된 도서관 정보 패널');
    const list = screen.getByLabelText('도서관 검색 결과 목록');
    const pagination = screen.getByRole('navigation', {name: '도서관 검색 결과 페이지네이션'});
    const mobileLayout = document.querySelector('[data-slot="library-search-mobile-layout"]');

    expect(mobileLayout).toBeInstanceOf(HTMLElement);

    if (!(mobileLayout instanceof HTMLElement)) {
      throw new Error('mobile layout not found');
    }

    expect(mobileLayout.className).toContain('overflow-y-auto');
    expect(detailPanel.compareDocumentPosition(list) & Node.DOCUMENT_POSITION_FOLLOWING).not.toBe(0);
    expect(list.compareDocumentPosition(pagination) & Node.DOCUMENT_POSITION_FOLLOWING).not.toBe(0);
  });

  it('모바일에서 지도를 사용할 수 있으면 상세 영역의 지도로 보기로 빠른 지도 dialog를 연다', async () => {
    const user = userEvent.setup();

    mockMatchMedia(true);
    mockKakaoMapConfig.appKey = 'test-key';
    mockKakaoMapConfig.isEnabled = true;
    const {kakaoMaps, panTo, setLevel} = createMockKakaoMaps();

    mockLoadKakaoMapSdk.mockResolvedValue(kakaoMaps);

    renderLibrarySearchResultDialog();

    const quickMapButton = await screen.findByRole('button', {name: '지도로 보기'});

    expect(screen.queryByRole('dialog', {name: '도서관 위치 지도'})).not.toBeInTheDocument();
    expect(screen.queryByRole('button', {name: '지도 확대'})).not.toBeInTheDocument();

    await user.click(quickMapButton);

    expect(await screen.findByRole('dialog', {name: '도서관 위치 지도'})).toBeInTheDocument();
    expect(screen.getByRole('heading', {name: '도서관 위치 지도'})).toHaveClass('sr-only');
    expect(screen.getByRole('button', {name: '지도 닫기'})).toBeInTheDocument();
    await waitFor(() => {
      expect(panTo).toHaveBeenCalledTimes(1);
    });
    expect(setLevel).toHaveBeenLastCalledWith(3);
  });

  it('모바일 빠른 지도 dialog를 닫아도 바깥 결과 dialog는 유지된다', async () => {
    const user = userEvent.setup();

    mockMatchMedia(true);
    mockKakaoMapConfig.appKey = 'test-key';
    mockKakaoMapConfig.isEnabled = true;
    const {kakaoMaps} = createMockKakaoMaps();

    mockLoadKakaoMapSdk.mockResolvedValue(kakaoMaps);

    renderLibrarySearchResultDialog();

    await user.click(await screen.findByRole('button', {name: '지도로 보기'}));

    expect(await screen.findByRole('dialog', {name: '도서관 위치 지도'})).toBeInTheDocument();

    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(screen.queryByRole('dialog', {name: '도서관 위치 지도'})).not.toBeInTheDocument();
    });
    expect(screen.getByRole('dialog', {name: '도서관 검색 결과'})).toBeInTheDocument();
  });

  it('totalPages가 2 이상이면 상태 기반 페이지네이션을 렌더링하고 현재 페이지를 표시한다', async () => {
    renderLibrarySearchResultDialog();

    const pagination = await screen.findByRole('navigation', {name: '도서관 검색 결과 페이지네이션'});

    expect(within(pagination).getByText('1')).toHaveAttribute('aria-current', 'page');
    expect(within(pagination).getByRole('button', {name: '2페이지'})).toBeInTheDocument();
    expect(within(pagination).getByRole('button', {name: '이전 페이지'})).toBeDisabled();
    expect(within(pagination).getByRole('button', {name: '다음 페이지'})).not.toBeDisabled();
  });

  it('페이지 버튼을 누르면 store의 현재 도서관 결과 페이지를 바꾼다', async () => {
    const user = userEvent.setup();

    renderLibrarySearchResultDialog();

    await user.click(await screen.findByRole('button', {name: '2페이지'}));

    await waitFor(() => {
      expect(useFindLibraryStore.getState().currentLibrarySearchParams?.page).toBe(2);
    });
  });

  it('페이지 전환 중에는 pagination을 유지하고 리스트와 우측 영역만 pending 상태로 바꾼다', async () => {
    const user = userEvent.setup();
    const pendingPromise = new Promise<never>(() => {});

    mockUseGetSearchLibraries.mockImplementation(params => {
      if (params.page === 2) {
        throw pendingPromise;
      }

      return mockLibrarySearchResponse;
    });

    renderLibrarySearchResultDialog();

    const firstPagination = await screen.findByRole('navigation', {name: '도서관 검색 결과 페이지네이션'});

    await user.click(within(firstPagination).getByRole('button', {name: '2페이지'}));

    const pendingPagination = await screen.findByRole('navigation', {name: '도서관 검색 결과 페이지네이션'});

    expect(screen.getByRole('button', {name: '지역 변경'})).toBeInTheDocument();
    expect(within(pendingPagination).getByText('2')).toHaveAttribute('aria-current', 'page');
    expect(screen.queryByRole('button', {name: /마포중앙도서관/})).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', {name: '마포중앙도서관'})).not.toBeInTheDocument();
    expect(screen.getByRole('button', {name: '대출 가능 여부 조회'})).toBeDisabled();
  });

  it('중간 페이지에서는 dialog 전용 압축 페이지네이션으로 첫 페이지 현재 페이지 마지막 페이지를 표시한다', async () => {
    mockUseGetSearchLibraries.mockReturnValue({
      ...mockLibrarySearchResponse,
      page: 5,
      totalCount: 100,
    });

    renderLibrarySearchResultDialog({
      params: {
        ...DEFAULT_PARAMS,
        page: 5,
      },
    });

    const pagination = await screen.findByRole('navigation', {name: '도서관 검색 결과 페이지네이션'});

    expect(within(pagination).getByRole('button', {name: '1페이지'})).toBeInTheDocument();
    expect(within(pagination).getByText('5')).toHaveAttribute('aria-current', 'page');
    expect(within(pagination).getByRole('button', {name: '10페이지'})).toBeInTheDocument();
    expect(within(pagination).getAllByLabelText('페이지 생략')).toHaveLength(2);
    expect(within(pagination).queryByRole('button', {name: '4페이지'})).not.toBeInTheDocument();
    expect(within(pagination).queryByRole('button', {name: '6페이지'})).not.toBeInTheDocument();
  });

  it('totalPages가 1이면 페이지네이션을 렌더링하지 않는다', async () => {
    mockUseGetSearchLibraries.mockReturnValue({
      ...mockLibrarySearchResponse,
      totalCount: 2,
    });

    renderLibrarySearchResultDialog();

    expect(await screen.findByRole('dialog', {name: '도서관 검색 결과'})).toBeInTheDocument();
    expect(screen.queryByRole('navigation', {name: '도서관 검색 결과 페이지네이션'})).not.toBeInTheDocument();
  });

  it('카카오 지도 설정이 없으면 panel 내부 unavailable UI를 렌더링하고 loader를 호출하지 않는다', async () => {
    renderLibrarySearchResultDialog();

    expect(await screen.findByRole('heading', {name: '지도를 표시할 수 없어요'})).toBeInTheDocument();
    expect(mockLoadKakaoMapSdk).not.toHaveBeenCalled();
  });

  it('SDK loader가 실패하면 panel 내부 unavailable UI로 fallback한다', async () => {
    mockKakaoMapConfig.appKey = 'test-key';
    mockKakaoMapConfig.isEnabled = true;
    mockLoadKakaoMapSdk.mockRejectedValue(
      new KakaoMapSdkLoadError('script-load-failed', 'Failed to load Kakao Map SDK script.'),
    );

    renderLibrarySearchResultDialog();

    expect(await screen.findByRole('heading', {name: '지도를 표시할 수 없어요'})).toBeInTheDocument();
    expect(screen.getByText('개발 진단: script-load-failed')).toBeInTheDocument();
  });

  it('SDK가 준비되면 실제 Kakao map baseline을 만들고 relayout을 호출한다', async () => {
    mockKakaoMapConfig.appKey = 'test-key';
    mockKakaoMapConfig.isEnabled = true;
    const {kakaoMaps, mapConstructor, relayout} = createMockKakaoMaps();

    mockLoadKakaoMapSdk.mockResolvedValue(kakaoMaps);

    renderLibrarySearchResultDialog();

    await waitFor(() => {
      expect(mapConstructor).toHaveBeenCalledTimes(1);
    });

    expect(relayout).toHaveBeenCalled();
  });

  it('selectedLibraryCode가 바뀌어도 map instance를 다시 만들지 않는다', async () => {
    mockKakaoMapConfig.appKey = 'test-key';
    mockKakaoMapConfig.isEnabled = true;
    const {kakaoMaps, mapConstructor} = createMockKakaoMaps();

    mockLoadKakaoMapSdk.mockResolvedValue(kakaoMaps);

    renderLibrarySearchResultDialog({selectedLibraryCode: 'LIB0001'});

    await waitFor(() => {
      expect(mapConstructor).toHaveBeenCalledTimes(1);
    });

    await act(async () => {
      useFindLibraryStore.getState().selectLibrary('LIB0002');
    });

    expect(mapConstructor).toHaveBeenCalledTimes(1);
  });

  it('좌표가 있는 도서관만 marker를 만들고 1건이면 setCenter와 setLevel로 초기 위치를 맞춘다', async () => {
    mockKakaoMapConfig.appKey = 'test-key';
    mockKakaoMapConfig.isEnabled = true;
    mockUseGetSearchLibraries.mockReturnValue({
      ...mockLibrarySearchResponse,
      items: [mockLibrarySearchResponse.items[0]],
      totalCount: 1,
    });
    const {kakaoMaps, markerRecords, setBounds, setCenter, setLevel} = createMockKakaoMaps();

    mockLoadKakaoMapSdk.mockResolvedValue(kakaoMaps);

    renderLibrarySearchResultDialog();

    await waitFor(() => {
      expect(markerRecords).toHaveLength(1);
    });

    expect(setCenter).toHaveBeenCalledTimes(1);
    expect(setLevel).toHaveBeenCalledWith(4);
    expect(setBounds).not.toHaveBeenCalled();
  });

  it('최초 진입에서 기본 선택된 첫 번째 도서관 marker를 바로 강조한다', async () => {
    mockKakaoMapConfig.appKey = 'test-key';
    mockKakaoMapConfig.isEnabled = true;
    const {kakaoMaps, markerRecords} = createMockKakaoMaps();

    mockLoadKakaoMapSdk.mockResolvedValue(kakaoMaps);

    renderLibrarySearchResultDialog();

    await waitFor(() => {
      expect(markerRecords[0]?.setImage).toHaveBeenCalled();
    });
  });

  it('현재 페이지에 좌표가 여러 건이면 setBounds로 전체 marker 범위를 먼저 맞춘다', async () => {
    mockKakaoMapConfig.appKey = 'test-key';
    mockKakaoMapConfig.isEnabled = true;
    mockUseGetSearchLibraries.mockReturnValue(mockSecondPageLibrarySearchResponse);
    const {kakaoMaps, setBounds} = createMockKakaoMaps();

    mockLoadKakaoMapSdk.mockResolvedValue(kakaoMaps);

    renderLibrarySearchResultDialog({
      params: {
        ...DEFAULT_PARAMS,
        page: 2,
      },
    });

    await waitFor(() => {
      expect(setBounds).toHaveBeenCalledTimes(1);
    });
  });

  it('리스트에서 좌표가 있는 도서관을 명시적으로 선택하면 확대와 함께 포커스하고 기존 marker를 재생성하지 않는다', async () => {
    const user = userEvent.setup();
    mockKakaoMapConfig.appKey = 'test-key';
    mockKakaoMapConfig.isEnabled = true;
    mockUseGetSearchLibraries.mockReturnValue(mockSecondPageLibrarySearchResponse);
    const {kakaoMaps, markerRecords, panTo, setLevel} = createMockKakaoMaps();

    mockLoadKakaoMapSdk.mockResolvedValue(kakaoMaps);

    renderLibrarySearchResultDialog({
      params: {
        ...DEFAULT_PARAMS,
        page: 2,
      },
    });

    await waitFor(() => {
      expect(markerRecords).toHaveLength(2);
    });

    await user.click(screen.getByRole('button', {name: /성산열람실/}));

    expect(useFindLibraryStore.getState().selectedLibraryCode).toBe('LIB0012');
    expect(markerRecords).toHaveLength(2);
    expect(setLevel).toHaveBeenLastCalledWith(3);
    expect(panTo).toHaveBeenCalledTimes(1);
  });

  it('기본 선택된 첫 번째 좌표 도서관도 명시적으로 다시 선택하면 확대와 함께 포커스한다', async () => {
    const user = userEvent.setup();
    mockKakaoMapConfig.appKey = 'test-key';
    mockKakaoMapConfig.isEnabled = true;
    const {kakaoMaps, panTo, setLevel} = createMockKakaoMaps();

    mockLoadKakaoMapSdk.mockResolvedValue(kakaoMaps);

    renderLibrarySearchResultDialog();

    await screen.findByRole('button', {name: /마포중앙도서관/});
    await user.click(screen.getByRole('button', {name: /마포중앙도서관/}));

    expect(setLevel).toHaveBeenLastCalledWith(3);
    expect(panTo).toHaveBeenCalledTimes(1);
  });

  it('지도 확대와 축소 버튼은 현재 level 기준으로 setLevel을 호출한다', async () => {
    const user = userEvent.setup();
    mockKakaoMapConfig.appKey = 'test-key';
    mockKakaoMapConfig.isEnabled = true;
    const {kakaoMaps, setLevel} = createMockKakaoMaps();

    mockLoadKakaoMapSdk.mockResolvedValue(kakaoMaps);

    renderLibrarySearchResultDialog();

    await user.click(await screen.findByRole('button', {name: '지도 확대'}));
    await user.click(screen.getByRole('button', {name: '지도 축소'}));

    expect(setLevel).toHaveBeenNthCalledWith(1, 4);
    expect(setLevel).toHaveBeenNthCalledWith(2, 5);
  });

  it('좌표가 없는 도서관을 선택하면 panTo하지 않고 목록과 상세 정보만 갱신한다', async () => {
    const user = userEvent.setup();
    mockKakaoMapConfig.appKey = 'test-key';
    mockKakaoMapConfig.isEnabled = true;
    const {kakaoMaps, panTo} = createMockKakaoMaps();

    mockLoadKakaoMapSdk.mockResolvedValue(kakaoMaps);

    renderLibrarySearchResultDialog();

    await user.click(await screen.findByRole('button', {name: /합정열람실/}));

    expect(useFindLibraryStore.getState().selectedLibraryCode).toBe('LIB0002');
    expect(panTo).not.toHaveBeenCalled();
    expect(
      within(screen.getByLabelText('선택된 도서관 정보 패널')).getByRole('heading', {name: '합정열람실'}),
    ).toBeInTheDocument();
  });

  it('marker를 클릭하면 해당 code로 selectedLibraryCode를 갱신한다', async () => {
    mockKakaoMapConfig.appKey = 'test-key';
    mockKakaoMapConfig.isEnabled = true;
    mockUseGetSearchLibraries.mockReturnValue(mockSecondPageLibrarySearchResponse);
    const {kakaoMaps, markerRecords, triggerMarkerClickByCoordinates} = createMockKakaoMaps();

    mockLoadKakaoMapSdk.mockResolvedValue(kakaoMaps);

    renderLibrarySearchResultDialog({
      params: {
        ...DEFAULT_PARAMS,
        page: 2,
      },
    });

    await screen.findByRole('button', {name: /상수문화도서관/});
    await waitFor(() => {
      expect(markerRecords).toHaveLength(2);
    });

    await act(async () => {
      triggerMarkerClickByCoordinates({
        latitude: 37.5631,
        longitude: 126.9084,
      });
    });
    await waitFor(() => {
      expect(useFindLibraryStore.getState().selectedLibraryCode).toBe('LIB0012');
    });
  });

  it('현재 페이지 결과에 좌표가 하나도 없으면 no-coordinate fallback과 controls hidden을 렌더링한다', async () => {
    mockKakaoMapConfig.appKey = 'test-key';
    mockKakaoMapConfig.isEnabled = true;
    mockUseGetSearchLibraries.mockReturnValue({
      ...mockLibrarySearchResponse,
      items: [
        {
          ...mockLibrarySearchResponse.items[0],
          latitude: null,
          longitude: null,
        },
        {
          ...mockLibrarySearchResponse.items[1],
          code: 'LIB0003',
        },
      ],
    });
    const {kakaoMaps} = createMockKakaoMaps();

    mockLoadKakaoMapSdk.mockResolvedValue(kakaoMaps);

    renderLibrarySearchResultDialog();

    expect(
      await screen.findByRole('heading', {name: '지도로 표시할 수 있는 위치 정보가 없어요'}),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', {name: '지도 확대'})).not.toBeInTheDocument();
  });

  it('모바일에서 지도를 사용할 수 없으면 상세 영역에 unavailable 문구를 렌더하고 빠른 지도 버튼은 숨긴다', async () => {
    mockMatchMedia(true);

    renderLibrarySearchResultDialog();

    const detailPanel = await screen.findByLabelText('선택된 도서관 정보 패널');

    expect(within(detailPanel).getByText('지도를 표시할 수 없어요.')).toBeInTheDocument();
    expect(within(detailPanel).queryByRole('button', {name: '지도로 보기'})).not.toBeInTheDocument();
  });

  it('모바일에서 선택된 도서관에 좌표가 없으면 상세 영역에 no-coordinate 문구를 렌더하고 빠른 지도 버튼은 숨긴다', async () => {
    mockMatchMedia(true);
    mockKakaoMapConfig.appKey = 'test-key';
    mockKakaoMapConfig.isEnabled = true;
    mockUseGetSearchLibraries.mockReturnValue({
      ...mockLibrarySearchResponse,
      items: [
        {
          ...mockLibrarySearchResponse.items[0],
          latitude: null,
          longitude: null,
        },
        {
          ...mockLibrarySearchResponse.items[1],
          code: 'LIB0003',
        },
      ],
    });

    renderLibrarySearchResultDialog();

    const detailPanel = await screen.findByLabelText('선택된 도서관 정보 패널');

    expect(within(detailPanel).getByText('위치 정보가 없어요.')).toBeInTheDocument();
    expect(within(detailPanel).queryByRole('button', {name: '지도로 보기'})).not.toBeInTheDocument();
  });

  it('selectedLibraryCode가 없으면 첫 번째 도서관을 기본 선택하고 store에 동기화한다', async () => {
    renderLibrarySearchResultDialog();

    await waitFor(() => {
      expect(useFindLibraryStore.getState().selectedLibraryCode).toBe('LIB0001');
    });
    expect(screen.getByRole('button', {name: /마포중앙도서관/})).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', {name: /합정열람실/})).toHaveAttribute('aria-pressed', 'false');

    const detailPanel = screen.getByLabelText('선택된 도서관 정보 패널');

    expect(within(detailPanel).getByRole('heading', {name: '마포중앙도서관'})).toBeInTheDocument();
  });

  it('유효한 selectedLibraryCode가 있으면 해당 도서관을 active row로 유지한다', async () => {
    renderLibrarySearchResultDialog({
      selectedLibraryCode: 'LIB0002',
    });

    const button = await screen.findByRole('button', {name: /합정열람실/});

    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(useFindLibraryStore.getState().selectedLibraryCode).toBe('LIB0002');
  });

  it('리스트 row를 클릭하면 해당 code로 selectedLibraryCode를 갱신한다', async () => {
    const user = userEvent.setup();

    renderLibrarySearchResultDialog({
      selectedLibraryCode: 'LIB0001',
    });

    await user.click(await screen.findByRole('button', {name: /합정열람실/}));

    expect(useFindLibraryStore.getState().selectedLibraryCode).toBe('LIB0002');
  });

  it('리스트 선택이 바뀌면 detail panel 정보도 같은 도서관으로 갱신된다', async () => {
    const user = userEvent.setup();

    renderLibrarySearchResultDialog({
      selectedLibraryCode: 'LIB0001',
    });

    await user.click(await screen.findByRole('button', {name: /합정열람실/}));

    const detailPanel = screen.getByLabelText('선택된 도서관 정보 패널');

    expect(within(detailPanel).getByRole('heading', {name: '합정열람실'})).toBeInTheDocument();
    expect(within(detailPanel).getByText('10:00 - 20:00')).toBeInTheDocument();
    expect(within(detailPanel).getByText('법정 공휴일')).toBeInTheDocument();
  });

  it('리스트 row는 native button keyboard interaction으로 선택할 수 있다', async () => {
    const user = userEvent.setup();

    renderLibrarySearchResultDialog({
      selectedLibraryCode: 'LIB0001',
    });

    const targetButton = await screen.findByRole('button', {name: /합정열람실/});

    targetButton.focus();
    await user.keyboard('{Enter}');

    expect(useFindLibraryStore.getState().selectedLibraryCode).toBe('LIB0002');
  });

  it('선택된 도서관이 있으면 availability CTA 클릭으로 availability query를 요청한다', async () => {
    const user = userEvent.setup();

    renderLibrarySearchResultDialog({
      selectedLibraryCode: 'LIB0001',
    });

    const availabilityButton = await screen.findByRole('button', {name: '대출 가능 여부 조회'});

    expect(availabilityButton).toBeEnabled();
    await user.click(availabilityButton);

    await waitFor(() => {
      expect(mockRequestGet).toHaveBeenCalledWith({
        endpoint: '/api/libraries/LIB0001/books/9788954682155/availability',
        errorHandlingType: 'toast',
      });
    });
  });

  it('desktop availability CTA는 pending 동안 spinner와 disabled 상태를 표시한다', async () => {
    const user = userEvent.setup();

    mockRequestGet.mockImplementationOnce(() => new Promise(() => {}));

    renderLibrarySearchResultDialog({
      selectedLibraryCode: 'LIB0001',
    });

    const availabilityButton = await screen.findByRole('button', {name: '대출 가능 여부 조회'});

    await user.click(availabilityButton);

    await waitFor(() => {
      expect(availabilityButton).toBeDisabled();
      expect(availabilityButton).toHaveAttribute('aria-busy', 'true');
    });
    expect(availabilityButton.querySelector('svg.animate-spin')).not.toBeNull();
  });

  it('desktop availability CTA는 대출 가능 응답이면 결과 스타일 문구를 표시한다', async () => {
    const user = userEvent.setup();

    mockRequestGet.mockResolvedValueOnce(
      createMockLibraryAvailabilityResponse({
        hasBook: 'Y',
        loanAvailable: 'Y',
      }),
    );

    renderLibrarySearchResultDialog({
      selectedLibraryCode: 'LIB0001',
    });

    await user.click(await screen.findByRole('button', {name: '대출 가능 여부 조회'}));

    const successButton = await screen.findByRole('button', {name: '대출이 가능해요'});

    expect(successButton).toBeEnabled();
    expect(successButton).toHaveClass('bg-transparent', 'text-accent');
  });

  it('desktop availability CTA는 대출 불가 응답이면 결과 스타일 문구를 표시한다', async () => {
    const user = userEvent.setup();

    mockRequestGet.mockResolvedValueOnce(
      createMockLibraryAvailabilityResponse({
        hasBook: 'Y',
        loanAvailable: 'N',
      }),
    );

    renderLibrarySearchResultDialog({
      selectedLibraryCode: 'LIB0001',
    });

    await user.click(await screen.findByRole('button', {name: '대출 가능 여부 조회'}));

    const successButton = await screen.findByRole('button', {name: '대출이 불가능해요'});

    expect(successButton).toBeEnabled();
    expect(successButton).toHaveClass('bg-transparent', 'text-accent');
  });

  it('desktop availability CTA는 미소장 응답이면 결과 스타일 문구를 표시한다', async () => {
    const user = userEvent.setup();

    mockRequestGet.mockResolvedValueOnce(
      createMockLibraryAvailabilityResponse({
        hasBook: 'N',
        loanAvailable: 'N',
      }),
    );

    renderLibrarySearchResultDialog({
      selectedLibraryCode: 'LIB0001',
    });

    await user.click(await screen.findByRole('button', {name: '대출 가능 여부 조회'}));

    const successButton = await screen.findByRole('button', {name: '소장하지 않아요'});

    expect(successButton).toBeEnabled();
    expect(successButton).toHaveClass('bg-transparent', 'text-accent');
  });

  it('desktop availability CTA는 실패 시 재시도 문구와 toast 안내를 표시한다', async () => {
    const user = userEvent.setup();

    mockRequestGet.mockRejectedValueOnce(
      new RequestGetError({
        endpoint: '/api/libraries/LIB0001/books/9788954682155/availability',
        errorHandlingType: 'toast',
        message: '대출 가능 여부를 다시 확인해주세요.',
        method: 'GET',
        name: 'LIBRARY_AVAILABILITY_UPSTREAM_ERROR',
        requestBody: null,
        status: 502,
      }),
    );

    renderLibrarySearchResultDialog({
      selectedLibraryCode: 'LIB0001',
    });

    await user.click(await screen.findByRole('button', {name: '대출 가능 여부 조회'}));

    const retryButton = await screen.findByRole('button', {name: '재시도'});

    expect(retryButton).toBeEnabled();
    expect(await screen.findByText('요청을 완료하지 못했어요')).toBeInTheDocument();
    expect(screen.getByText('대출 가능 여부를 다시 확인해주세요.')).toBeInTheDocument();
    expect(screen.getByText('전날 대출 상태를 기준으로 제공돼 부정확할 수 있어요.')).toBeInTheDocument();
  });

  it('mobile availability CTA도 선택된 도서관 기준으로 availability query를 요청한다', async () => {
    const user = userEvent.setup();

    mockMatchMedia(true);
    renderLibrarySearchResultDialog({
      selectedLibraryCode: 'LIB0001',
    });

    const detailPanel = await screen.findByLabelText('선택된 도서관 정보 패널');
    const availabilityButton = within(detailPanel).getByRole('button', {name: '대출 가능 여부 조회'});

    await user.click(availabilityButton);

    await waitFor(() => {
      expect(mockRequestGet).toHaveBeenCalledWith({
        endpoint: '/api/libraries/LIB0001/books/9788954682155/availability',
        errorHandlingType: 'toast',
      });
    });
    expect(within(detailPanel).getByText('전날 대출 상태를 기준으로 제공돼 부정확할 수 있어요.')).toBeInTheDocument();
  });

  it('mobile availability CTA는 pending 동안 spinner와 non-interactive 상태를 표시한다', async () => {
    const user = userEvent.setup();

    mockMatchMedia(true);
    mockRequestGet.mockImplementationOnce(() => new Promise(() => {}));

    renderLibrarySearchResultDialog({
      selectedLibraryCode: 'LIB0001',
    });

    const detailPanel = await screen.findByLabelText('선택된 도서관 정보 패널');
    const availabilityButton = within(detailPanel).getByRole('button', {name: '대출 가능 여부 조회'});

    await user.click(availabilityButton);

    await waitFor(() => {
      expect(availabilityButton).toBeDisabled();
      expect(availabilityButton).toHaveAttribute('aria-busy', 'true');
    });
    expect(availabilityButton.querySelector('svg.animate-spin')).not.toBeNull();
  });

  it('mobile availability CTA는 success 결과를 desktop과 같은 문구로 표시한다', async () => {
    const user = userEvent.setup();

    mockMatchMedia(true);
    renderLibrarySearchResultDialog({
      selectedLibraryCode: 'LIB0001',
    });

    await user.click(await screen.findByRole('button', {name: '대출 가능 여부 조회'}));

    const successButton = await screen.findByRole('button', {name: '대출이 가능해요'});

    expect(successButton).toBeEnabled();
    expect(successButton).toHaveClass('bg-transparent', 'text-accent');
  });

  it('mobile availability CTA는 unavailable 결과를 desktop과 같은 문구로 표시한다', async () => {
    const user = userEvent.setup();

    mockMatchMedia(true);
    mockRequestGet.mockResolvedValueOnce(
      createMockLibraryAvailabilityResponse({
        hasBook: 'Y',
        libraryCode: 'LIB0002',
        loanAvailable: 'N',
      }),
    );

    renderLibrarySearchResultDialog({
      selectedLibraryCode: 'LIB0002',
    });

    await user.click(await screen.findByRole('button', {name: '대출 가능 여부 조회'}));
    const unavailableButton = await screen.findByRole('button', {name: '대출이 불가능해요'});

    expect(unavailableButton).toBeEnabled();
    expect(unavailableButton).toHaveClass('bg-transparent', 'text-accent');
  });

  it('mobile availability CTA는 not-owned 결과를 desktop과 같은 문구로 표시한다', async () => {
    const user = userEvent.setup();

    mockRequestGet.mockResolvedValueOnce(
      createMockLibraryAvailabilityResponse({
        hasBook: 'N',
        libraryCode: 'LIB0001',
        loanAvailable: 'N',
      }),
    );

    renderLibrarySearchResultDialog({
      selectedLibraryCode: 'LIB0001',
    });

    await user.click(await screen.findByRole('button', {name: '대출 가능 여부 조회'}));
    const notOwnedButton = await screen.findByRole('button', {name: '소장하지 않아요'});

    expect(notOwnedButton).toBeEnabled();
    expect(notOwnedButton).toHaveClass('bg-transparent', 'text-accent');
  });

  it('mobile availability CTA는 실패 시 재시도와 toast 안내를 표시한다', async () => {
    const user = userEvent.setup();

    mockMatchMedia(true);
    mockRequestGet.mockRejectedValueOnce(
      new RequestGetError({
        endpoint: '/api/libraries/LIB0001/books/9788954682155/availability',
        errorHandlingType: 'toast',
        message: '대출 가능 여부를 다시 확인해주세요.',
        method: 'GET',
        name: 'LIBRARY_AVAILABILITY_UPSTREAM_ERROR',
        requestBody: null,
        status: 502,
      }),
    );

    renderLibrarySearchResultDialog({
      selectedLibraryCode: 'LIB0001',
    });

    await user.click(await screen.findByRole('button', {name: '대출 가능 여부 조회'}));

    const retryButton = await screen.findByRole('button', {name: '재시도'});

    expect(retryButton).toBeEnabled();
    expect(await screen.findByText('요청을 완료하지 못했어요')).toBeInTheDocument();
    expect(screen.getByText('대출 가능 여부를 다시 확인해주세요.')).toBeInTheDocument();
  });

  it('선택된 도서관이 없으면 availability CTA는 비활성이다', () => {
    render(<LibrarySearchResultDetails library={null} />);

    expect(screen.getByRole('button', {name: '대출 가능 여부 조회'})).toBeDisabled();
  });

  it('조회가 suspend되면 loading shell을 유지한다', async () => {
    const pendingPromise = new Promise(() => {});

    mockUseGetSearchLibraries.mockImplementation(() => {
      throw pendingPromise;
    });

    renderLibrarySearchResultDialog();

    expect(await screen.findByRole('heading', {name: '검색 결과'})).toBeInTheDocument();
    expect(screen.queryByRole('button', {name: '지역 변경'})).not.toBeInTheDocument();
    expect(screen.getByLabelText('검색 결과 목록 패널')).toBeInTheDocument();
    expect(screen.getByLabelText('도서관 지도 패널')).toBeInTheDocument();
    expect(screen.getByLabelText('선택된 도서관 정보 패널')).toBeInTheDocument();
    expect(screen.getByText('전날 대출 상태를 기준으로 제공돼 부정확할 수 있어요.')).toBeInTheDocument();
  });

  it('모바일에서 조회가 suspend되면 실제 모바일 순서와 같은 details loading shell을 유지한다', async () => {
    const pendingPromise = new Promise(() => {});

    mockMatchMedia(true);
    mockUseGetSearchLibraries.mockImplementation(() => {
      throw pendingPromise;
    });

    renderLibrarySearchResultDialog();

    const detailPanel = await screen.findByLabelText('선택된 도서관 정보 패널');
    const quickMapButton = within(detailPanel).getByRole('button', {name: '지도로 보기'});
    const availabilityButton = within(detailPanel).getByRole('button', {name: '대출 가능 여부 조회'});

    expect(quickMapButton).toBeDisabled();
    expect(availabilityButton).toBeDisabled();
    expect(quickMapButton.compareDocumentPosition(availabilityButton) & Node.DOCUMENT_POSITION_FOLLOWING).not.toBe(0);
    expect(within(detailPanel).queryAllByRole('button', {name: '대출 가능 여부 조회'})).toHaveLength(1);
  });

  it('성공 상태의 지역 변경 action은 region dialog로 되돌린다', async () => {
    const user = userEvent.setup();

    renderLibrarySearchResultDialog();

    await user.click(await screen.findByRole('button', {name: '지역 변경'}));

    expect(useFindLibraryStore.getState().currentLibrarySearchParams).toBeNull();
    expect(useFindLibraryStore.getState().libraryResultBook).toBeNull();
    expect(useFindLibraryStore.getState().regionDialogBook).toEqual(DEFAULT_SELECTED_BOOK);
  });

  it('빈 응답이면 empty state와 복구 CTA를 렌더링한다', async () => {
    mockUseGetSearchLibraries.mockReturnValue({
      ...mockLibrarySearchResponse,
      items: [],
      resultCount: 0,
      totalCount: 0,
    });

    renderLibrarySearchResultDialog();

    expect(await screen.findByText('소장 중인 도서관을 찾지 못했어요.')).toBeInTheDocument();
    expect(screen.getByRole('button', {name: '지역 다시 선택'})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: '다른 책 다시 선택'})).toBeInTheDocument();
  });

  it('empty state의 지역 다시 선택 CTA는 region dialog로 되돌린다', async () => {
    const user = userEvent.setup();

    mockUseGetSearchLibraries.mockReturnValue({
      ...mockLibrarySearchResponse,
      items: [],
      resultCount: 0,
      totalCount: 0,
    });

    renderLibrarySearchResultDialog();

    await user.click(await screen.findByRole('button', {name: '지역 다시 선택'}));

    expect(useFindLibraryStore.getState().currentLibrarySearchParams).toBeNull();
    expect(useFindLibraryStore.getState().libraryResultBook).toBeNull();
    expect(useFindLibraryStore.getState().regionDialogBook).toEqual(DEFAULT_SELECTED_BOOK);
  });

  it('empty state의 다른 책 다시 선택 CTA는 library dialog 상태를 닫는다', async () => {
    const user = userEvent.setup();

    mockUseGetSearchLibraries.mockReturnValue({
      ...mockLibrarySearchResponse,
      items: [],
      resultCount: 0,
      totalCount: 0,
    });

    renderLibrarySearchResultDialog();

    await user.click(await screen.findByRole('button', {name: '다른 책 다시 선택'}));

    expect(useFindLibraryStore.getState().currentLibrarySearchParams).toBeNull();
    expect(useFindLibraryStore.getState().libraryResultBook).toBeNull();
    expect(useFindLibraryStore.getState().selectedLibraryCode).toBeNull();
  });

  it('조회 에러면 recoverable error UI를 렌더링하고 다시 시도로 회복할 수 있다', async () => {
    const requestError = new Error('검색 실패');
    let shouldThrow = true;

    mockUseGetSearchLibraries.mockImplementation(() => {
      if (shouldThrow) {
        throw requestError;
      }

      return mockLibrarySearchResponse;
    });

    renderLibrarySearchResultDialog();

    expect(await screen.findByText('검색 결과를 불러오지 못했어요')).toBeInTheDocument();

    shouldThrow = false;

    await userEvent.click(screen.getByRole('button', {name: '다시 시도'}));

    expect(await screen.findByText('총 12개의 도서관을 검색했어요.')).toBeInTheDocument();
  });

  it('닫기 버튼을 누르면 library dialog 상태를 닫는다', async () => {
    const user = userEvent.setup();

    renderLibrarySearchResultDialog();

    await user.click(await screen.findByRole('button', {name: '닫기'}));

    await waitFor(() => {
      expect(useFindLibraryStore.getState().currentLibrarySearchParams).toBeNull();
    });
    expect(useFindLibraryStore.getState().libraryResultBook).toBeNull();
  });

  it('escape 입력 시 library dialog 상태를 닫는다', async () => {
    const user = userEvent.setup();

    renderLibrarySearchResultDialog();

    await screen.findByRole('dialog', {name: '도서관 검색 결과'});
    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(useFindLibraryStore.getState().currentLibrarySearchParams).toBeNull();
    });
    expect(useFindLibraryStore.getState().libraryResultBook).toBeNull();
  });

  it('overlay dismiss 시 library dialog 상태를 닫는다', async () => {
    const user = userEvent.setup();

    renderLibrarySearchResultDialog();

    await screen.findByRole('dialog', {name: '도서관 검색 결과'});

    const overlay = document.querySelector('[data-slot="dialog-overlay"]');

    expect(overlay).toBeInstanceOf(HTMLElement);

    if (!(overlay instanceof HTMLElement)) {
      throw new Error('dialog overlay not found');
    }

    await user.click(overlay);

    await waitFor(() => {
      expect(useFindLibraryStore.getState().currentLibrarySearchParams).toBeNull();
    });
    expect(useFindLibraryStore.getState().libraryResultBook).toBeNull();
  });

  it('모바일 branch에서도 키보드 탭 이동으로 주요 액션에 접근할 수 있다', async () => {
    const user = userEvent.setup();

    mockMatchMedia(true);
    mockKakaoMapConfig.appKey = 'test-key';
    mockKakaoMapConfig.isEnabled = true;
    const {kakaoMaps} = createMockKakaoMaps();

    mockLoadKakaoMapSdk.mockResolvedValue(kakaoMaps);
    renderLibrarySearchResultDialog();

    const dialog = await screen.findByRole('dialog', {name: '도서관 검색 결과'});
    const changeRegionButton = screen.getByRole('button', {name: '지역 변경'});
    const quickMapButton = screen.getByRole('button', {name: '지도로 보기'});
    const detailCta = screen.getByRole('button', {name: '대출 가능 여부 조회'});
    const firstLibraryRow = screen.getByRole('button', {name: /마포중앙도서관/});
    const secondPageButton = screen.getByRole('button', {name: '2페이지'});
    const closeButton = screen.getByRole('button', {name: '닫기'});

    await waitFor(() => {
      expect(dialog.contains(document.activeElement)).toBe(true);
    });

    await tabUntilFocused(user, changeRegionButton);
    expect(changeRegionButton).toHaveFocus();

    await tabUntilFocused(user, quickMapButton);
    expect(quickMapButton).toHaveFocus();

    await tabUntilFocused(user, detailCta);
    expect(detailCta).toHaveFocus();

    await tabUntilFocused(user, firstLibraryRow);
    expect(firstLibraryRow).toHaveFocus();

    await tabUntilFocused(user, secondPageButton);
    expect(secondPageButton).toHaveFocus();

    await tabUntilFocused(user, closeButton);
    expect(closeButton).toHaveFocus();
  });

  it('모바일에서 리스트 row를 선택하면 상세 영역 시작 지점으로 스크롤한다', async () => {
    const user = userEvent.setup();
    const scrollToMock = vi.fn();

    mockMatchMedia(true);
    Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
      configurable: true,
      value: scrollToMock,
    });

    renderLibrarySearchResultDialog({
      selectedLibraryCode: 'LIB0001',
    });

    await user.click(await screen.findByRole('button', {name: /합정열람실/}));

    expect(scrollToMock).toHaveBeenCalledWith({
      behavior: 'smooth',
      top: 0,
    });
  });

  it('모바일에서 페이지를 변경하면 상세 영역 시작 지점으로 스크롤한다', async () => {
    const user = userEvent.setup();
    const scrollToMock = vi.fn();

    mockMatchMedia(true);
    Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
      configurable: true,
      value: scrollToMock,
    });

    renderLibrarySearchResultDialog();

    await user.click(await screen.findByRole('button', {name: '2페이지'}));

    await waitFor(() => {
      expect(scrollToMock).toHaveBeenCalledWith({
        behavior: 'smooth',
        top: 0,
      });
    });
  });

  it('params나 selectedBook이 없으면 렌더링하지 않는다', () => {
    renderLibrarySearchResultDialog({
      params: null,
      selectedBook: null,
    });

    expect(screen.queryByRole('dialog', {name: '도서관 검색 결과'})).not.toBeInTheDocument();
  });
});
