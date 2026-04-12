import {act, render, screen, waitFor, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {createMemoryRouter, RouterProvider} from 'react-router-dom';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {AppProvider} from '@/app/providers';
import {useBookDetailDialogStore} from '@/features/book';
import {RequestGetError} from '@/shared/request';
import {routes} from './router';

const {mockBookDetailResponse, mockBookSearchResponse, mockUseGetBookDetail, mockUseGetSearchBooks} = vi.hoisted(() => ({
  mockBookDetailResponse: {
    book: {
      author: '이민진',
      className: '문학',
      classNumber: '813.6',
      description: '재일조선인 가족의 삶을 세대에 걸쳐 따라가는 장편소설입니다.',
      imageUrl: 'https://image.example.com/pachinko.jpg',
      isbn: '895468215X',
      isbn13: '9788954682155',
      publicationDate: '2018-03-09',
      publicationYear: '2018',
      publisher: '문학사상',
      title: '파친코',
    },
    loanInfo: {
      byAge: [
        {
          loanCount: 430,
          name: '20대',
          rank: 1,
        },
        {
          loanCount: 315,
          name: '30대',
          rank: 2,
        },
        {
          loanCount: 188,
          name: '40대',
          rank: 3,
        },
      ],
      total: {
        loanCount: 1240,
        name: '전체',
        rank: 1,
      },
    },
  },
  mockBookSearchResponse: {
    items: [
      {
        author: '이민진',
        detailUrl: null,
        imageUrl: null,
        isbn13: '9788954682155',
        loanCount: 12,
        publicationYear: '2018',
        publisher: '문학사상',
        title: '파친코',
      },
    ],
    totalCount: 12,
  },
  mockUseGetBookDetail: vi.fn(),
  mockUseGetSearchBooks: vi.fn(),
}));

function createBookDetailRequestError() {
  return new RequestGetError({
    endpoint: '/api/books/9788954682155',
    message: '도서 상세 정보를 불러오지 못했습니다.',
    method: 'GET',
    name: 'BOOK_DETAIL_UPSTREAM_ERROR',
    requestBody: null,
    status: 502,
  });
}

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
    isbn13: '9788954682155',
    libraryCode,
    loanAvailable,
  };
}

const {mockLibrarySearchResponse, mockSecondPageLibrarySearchResponse, mockUseGetSearchLibraries} = vi.hoisted(
  () => ({
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
}),
);

const {mockKakaoMapConfig, mockLoadKakaoMapSdk} = vi.hoisted(() => ({
  mockKakaoMapConfig: {
    appKey: undefined as string | undefined,
    isEnabled: false,
  },
  mockLoadKakaoMapSdk: vi.fn(),
}));

const {mockRequestGet} = vi.hoisted(() => ({
  mockRequestGet: vi.fn(),
}));

vi.mock('@/entities/book', async importOriginal => {
  const actual = await importOriginal<typeof import('@/entities/book')>();

  return {
    ...actual,
    useGetBookDetail: mockUseGetBookDetail,
    useGetSearchBooks: mockUseGetSearchBooks,
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

vi.mock('@/shared/request', async importOriginal => {
  const actual = await importOriginal<typeof import('@/shared/request')>();

  return {
    ...actual,
    requestGet: mockRequestGet,
  };
});

beforeEach(() => {
  mockUseGetBookDetail.mockReset();
  mockUseGetBookDetail.mockReturnValue(mockBookDetailResponse);
  mockUseGetSearchBooks.mockReset();
  mockUseGetSearchBooks.mockReturnValue(mockBookSearchResponse);
  mockUseGetSearchLibraries.mockReset();
  mockUseGetSearchLibraries.mockImplementation(params =>
    params.page === 2 ? mockSecondPageLibrarySearchResponse : mockLibrarySearchResponse,
  );
  mockRequestGet.mockReset();
  mockRequestGet.mockResolvedValue(createMockLibraryAvailabilityResponse());
  mockKakaoMapConfig.appKey = undefined;
  mockKakaoMapConfig.isEnabled = false;
  mockLoadKakaoMapSdk.mockReset();
  useBookDetailDialogStore.getState().resetBookDetailDialog();
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => {
    callback(0);

    return 1;
  });
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

function renderRouter(initialEntries: string[]) {
  const router = createMemoryRouter(routes, {initialEntries});

  return {
    router,
    ...render(
      <AppProvider>
        <RouterProvider router={router} />
      </AppProvider>,
    ),
  };
}

function createMockKakaoMaps() {
  const markerRecords: Array<{
    marker: KakaoMapsMarker;
    position: KakaoMapsLatLng;
  }> = [];
  const markerClickHandlers = new Map<KakaoMapsMarker, () => void>();

  const kakaoMaps: KakaoMapsNamespace = {
    LatLng: vi.fn(function MockLatLng(this: KakaoMapsLatLng, latitude: number, longitude: number) {
      this.getLat = vi.fn(() => latitude);
      this.getLng = vi.fn(() => longitude);
    }) as unknown as KakaoMapsNamespace['LatLng'],
    LatLngBounds: vi.fn(function MockLatLngBounds(this: KakaoMapsLatLngBounds) {
      this.contain = vi.fn(() => false);
      this.extend = vi.fn();
    }) as unknown as KakaoMapsNamespace['LatLngBounds'],
    Map: vi.fn(function MockMap(this: KakaoMapsMap) {
      this.panTo = vi.fn();
      this.relayout = vi.fn();
      this.setBounds = vi.fn();
      this.setCenter = vi.fn();
      this.setLevel = vi.fn();
    }) as unknown as KakaoMapsNamespace['Map'],
    Marker: vi.fn(function MockMarker(this: KakaoMapsMarker, options: KakaoMapsMarkerOptions) {
      this.setImage = vi.fn();
      this.setMap = vi.fn();
      markerRecords.push({
        marker: this,
        position: options.position,
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
    triggerMarkerClickByCoordinates: ({
      latitude,
      longitude,
    }: {
      latitude: number;
      longitude: number;
    }) => {
      const record = markerRecords.find(candidate => {
        return candidate.position.getLat() === latitude && candidate.position.getLng() === longitude;
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

describe('app router integration', () => {
  it('처음 열면 책 검색을 바로 시작할 수 있다', () => {
    renderRouter(['/']);

    expect(screen.getByRole('heading', {level: 1, name: /이 책,/})).toBeInTheDocument();
    expect(
      screen.getByText('궁금한 책의 제목이나 저자를 검색창에 입력해 보세요.', {exact: false}),
    ).toBeInTheDocument();
    expect(screen.getByRole('tablist', {name: '검색 기준 선택'})).toBeInTheDocument();
    expect(screen.getByPlaceholderText('찾고 싶은 책 제목을 입력해주세요')).toBeInTheDocument();
    expect(screen.getByRole('button', {name: '검색'})).toBeInTheDocument();
    expect(screen.queryByRole('link', {name: '메인으로'})).not.toBeInTheDocument();
  });

  it('검색을 시작하면 도서 검색 결과 화면으로 이동한다', async () => {
    const user = userEvent.setup();
    const {router} = renderRouter(['/']);

    await user.type(screen.getByRole('textbox'), '파친코');
    await user.click(screen.getByRole('button', {name: '검색'}));

    expect(await screen.findByRole('form', {name: '도서 결과 재검색'})).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/books');
    expect(new URLSearchParams(router.state.location.search).get('title')).toBe('파친코');
    expect(new URLSearchParams(router.state.location.search).get('page')).toBe('1');
  });

  it('검색 조건이 맞으면 도서 검색 결과 화면을 바로 볼 수 있다', () => {
    renderRouter(['/books?author=한강&page=2']);

    expect(screen.getByRole('link', {name: '메인으로'})).toHaveAttribute('href', '/');
    expect(screen.getByRole('region', {name: '도서 검색 결과 화면'})).toBeInTheDocument();
    expect(screen.getByRole('form', {name: '도서 결과 재검색'})).toBeInTheDocument();
    expect(screen.getByRole('tab', {name: '저자명'})).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByPlaceholderText('찾고 싶은 저자명을 입력해주세요')).toHaveValue('한강');
    expect(screen.getByRole('heading', {level: 1, name: '한강에 대한 12개의 검색 결과가 있습니다.'})).toBeInTheDocument();
  });

  it('다시 검색하면 첫 페이지 결과로 이동한다', async () => {
    const user = userEvent.setup();
    const {router} = renderRouter(['/books?title=파친코&page=2']);

    const input = await screen.findByRole('textbox');

    await user.clear(input);
    await user.type(input, '채식주의자');
    await user.click(screen.getByRole('button', {name: '검색'}));

    expect(router.state.location.pathname).toBe('/books');
    expect(new URLSearchParams(router.state.location.search).get('title')).toBe('채식주의자');
    expect(new URLSearchParams(router.state.location.search).get('page')).toBe('1');
  });

  it('페이지를 옮겨도 검색어는 유지되고 뒤로 가기로 돌아올 수 있다', async () => {
    const user = userEvent.setup();
    const {router} = renderRouter(['/books?title=파친코&page=2']);

    await user.click(await screen.findByRole('link', {name: '1페이지'}));

    expect(router.state.location.pathname).toBe('/books');
    expect(new URLSearchParams(router.state.location.search).get('title')).toBe('파친코');
    expect(new URLSearchParams(router.state.location.search).get('page')).toBe('1');

    await act(async () => {
      await router.navigate(-1);
    });

    expect(new URLSearchParams(router.state.location.search).get('title')).toBe('파친코');
    expect(new URLSearchParams(router.state.location.search).get('page')).toBe('2');
    expect(
      within(screen.getByRole('navigation', {name: '도서 검색 결과 페이지네이션'})).getByText('2'),
    ).toHaveAttribute('aria-current', 'page');
  });

  it('이전 페이지와 다음 페이지로 이동해도 검색어는 유지된다', async () => {
    const user = userEvent.setup();
    const {router} = renderRouter(['/books?title=파친코&page=1']);

    await user.click(await screen.findByRole('link', {name: '다음 페이지'}));

    expect(router.state.location.pathname).toBe('/books');
    expect(new URLSearchParams(router.state.location.search).get('title')).toBe('파친코');
    expect(new URLSearchParams(router.state.location.search).get('page')).toBe('2');

    await user.click(await screen.findByRole('link', {name: '이전 페이지'}));

    expect(router.state.location.pathname).toBe('/books');
    expect(new URLSearchParams(router.state.location.search).get('title')).toBe('파친코');
    expect(new URLSearchParams(router.state.location.search).get('page')).toBe('1');
  });

  it('도서 검색 결과에서 소장 도서관 찾기를 누르면 지역 선택 창을 열고 다시 닫을 수 있다', async () => {
    const user = userEvent.setup();

    renderRouter(['/books?title=파친코&page=1']);

    await user.click(await screen.findByRole('button', {name: '소장 도서관 찾기'}));

    expect(await screen.findByRole('dialog', {name: '검색 지역 선택'})).toBeInTheDocument();
    expect(screen.getByRole('heading', {name: '시/도'})).toBeInTheDocument();
    expect(screen.getByRole('heading', {name: '세부 지역'})).toBeInTheDocument();

    await user.click(screen.getByRole('button', {name: '닫기'}));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', {name: '검색 지역 선택'})).not.toBeInTheDocument();
    });
    expect(screen.getByRole('form', {name: '도서 결과 재검색'})).toBeInTheDocument();
  });

  it('상세 보기를 누르면 책 정보를 확인하는 중에도 창을 닫고 검색 결과를 계속 볼 수 있다', async () => {
    const user = userEvent.setup();
    const pendingPromise = new Promise<never>(() => {});

    mockUseGetBookDetail.mockImplementation(() => {
      throw pendingPromise;
    });

    renderRouter(['/books?title=파친코&page=1']);

    await user.click(await screen.findByRole('button', {name: '상세 보기'}));

    const detailDialog = await screen.findByRole('dialog', {name: '도서 상세 정보'});

    expect(detailDialog).toBeInTheDocument();
    expect(within(detailDialog).getByRole('status', {name: '도서 상세 정보를 불러오는 중'})).toBeInTheDocument();
    expect(within(detailDialog).getByRole('button', {name: '닫기'})).toBeInTheDocument();

    await user.click(within(detailDialog).getByRole('button', {name: '닫기'}));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', {name: '도서 상세 정보'})).not.toBeInTheDocument();
    });

    expect(screen.getByRole('region', {name: '도서 검색 결과 화면'})).toBeInTheDocument();
  });

  it('책 상세 창을 닫으면 검색 결과 화면으로 자연스럽게 돌아간다', async () => {
    const user = userEvent.setup();

    renderRouter(['/books?title=파친코&page=1']);

    await user.click(await screen.findByRole('button', {name: '상세 보기'}));

    const detailDialog = await screen.findByRole('dialog', {name: '도서 상세 정보'});

    expect(within(detailDialog).getByRole('heading', {name: '파친코'})).toBeInTheDocument();

    await user.click(within(detailDialog).getByRole('button', {name: '닫기'}));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', {name: '도서 상세 정보'})).not.toBeInTheDocument();
    });

    expect(screen.getByRole('region', {name: '도서 검색 결과 화면'})).toBeInTheDocument();
    expect(screen.getByRole('heading', {level: 1, name: '파친코에 대한 12개의 검색 결과가 있습니다.'})).toBeInTheDocument();
  });

  it('상세 보기를 누르면 책의 기본 정보와 소개를 확인할 수 있다', async () => {
    const user = userEvent.setup();

    renderRouter(['/books?title=파친코&page=1']);

    await user.click(await screen.findByRole('button', {name: '상세 보기'}));

    const detailDialog = await screen.findByRole('dialog', {name: '도서 상세 정보'});

    expect(within(detailDialog).getByRole('img', {name: '파친코 표지 이미지'})).toBeInTheDocument();
    expect(within(detailDialog).getByRole('heading', {name: '파친코'})).toBeInTheDocument();
    expect(within(detailDialog).getByText('이민진')).toBeInTheDocument();
    expect(within(detailDialog).getByText('문학사상 · 2018-03-09')).toBeInTheDocument();
    expect(within(detailDialog).getByText('9788954682155')).toBeInTheDocument();
    expect(within(detailDialog).getByText('895468215X')).toBeInTheDocument();
    expect(within(detailDialog).getByText('문학 · 813.6')).toBeInTheDocument();
    expect(within(detailDialog).getByText('책 소개')).toBeInTheDocument();
    expect(
      within(detailDialog).getByText('재일조선인 가족의 삶을 세대에 걸쳐 따라가는 장편소설입니다.'),
    ).toBeInTheDocument();

    const introductionHeading = within(detailDialog).getByText('책 소개');
    const publicationHeading = within(detailDialog).getByText('출판 정보');

    expect(introductionHeading.compareDocumentPosition(publicationHeading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(introductionHeading.className).toBe(publicationHeading.className);
  });

  it('상세 보기를 누르면 전체 대출 정보와 연령별 대출 정보를 확인할 수 있다', async () => {
    const user = userEvent.setup();

    renderRouter(['/books?title=파친코&page=1']);

    await user.click(await screen.findByRole('button', {name: '상세 보기'}));

    const detailDialog = await screen.findByRole('dialog', {name: '도서 상세 정보'});

    const totalLoanHeading = within(detailDialog).getByText('총 대출 1,240건');
    const ageInsightHeading = within(detailDialog).getByText('가장 많이 읽는 연령대는 20대예요.');

    expect(totalLoanHeading).toBeInTheDocument();
    expect(within(detailDialog).getByText('대출 순위 1위')).toBeInTheDocument();
    expect(ageInsightHeading).toBeInTheDocument();
    expect(within(detailDialog).getByText('연령별 대출 430건으로 가장 높아요.')).toBeInTheDocument();
    expect(within(detailDialog).getByText('20대 · 430건')).toBeInTheDocument();
    expect(within(detailDialog).getByText('30대 · 315건')).toBeInTheDocument();
    expect(within(detailDialog).getByText('40대 · 188건')).toBeInTheDocument();
    expect(within(detailDialog).queryByText('성별')).not.toBeInTheDocument();
    expect(within(detailDialog).queryByText('지역별')).not.toBeInTheDocument();
    expect(totalLoanHeading.compareDocumentPosition(ageInsightHeading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('상세 정보에 없는 항목은 보이지 않는다', async () => {
    const user = userEvent.setup();

    mockUseGetBookDetail.mockReturnValue({
      book: {
        ...mockBookDetailResponse.book,
        className: null,
        classNumber: null,
        description: null,
        imageUrl: null,
        isbn: null,
        publicationDate: null,
      },
      loanInfo: {
        byAge: [],
        total: null,
      },
    });

    renderRouter(['/books?title=파친코&page=1']);

    await user.click(await screen.findByRole('button', {name: '상세 보기'}));

    const detailDialog = await screen.findByRole('dialog', {name: '도서 상세 정보'});

    expect(within(detailDialog).getByText('문학사상 · 2018')).toBeInTheDocument();
    expect(within(detailDialog).queryByText('ISBN')).not.toBeInTheDocument();
    expect(within(detailDialog).queryByText('분류 정보')).not.toBeInTheDocument();
    expect(within(detailDialog).queryByText('책 소개')).not.toBeInTheDocument();
    expect(within(detailDialog).queryByRole('img', {name: '파친코 표지 이미지'})).not.toBeInTheDocument();
    expect(within(detailDialog).getByText('대출 정보가 없어요.')).toBeInTheDocument();
    expect(within(detailDialog).queryByText(/가장 많이 읽는 연령대는/)).not.toBeInTheDocument();
    expect(within(detailDialog).queryByText('총 대출')).not.toBeInTheDocument();
    expect(within(detailDialog).queryByText(/대 · \d+건/)).not.toBeInTheDocument();
  });

  it('상세 정보를 찾지 못하면 빈 상태 안내를 본다', async () => {
    const user = userEvent.setup();

    mockUseGetBookDetail.mockReturnValue({
      book: null,
      loanInfo: {
        byAge: [],
        total: null,
      },
    });

    renderRouter(['/books?title=파친코&page=1']);

    await user.click(await screen.findByRole('button', {name: '상세 보기'}));

    const detailDialog = await screen.findByRole('dialog', {name: '도서 상세 정보'});

    expect(within(detailDialog).getByRole('heading', {name: '도서 상세 정보를 찾지 못했어요.'})).toBeInTheDocument();
    expect(within(detailDialog).getByText('선택한 책의 상세 정보가 제공되지 않을 수 있어요.')).toBeInTheDocument();
    expect(within(detailDialog).getByRole('button', {name: '다른 도서 보기'})).toBeInTheDocument();
  });

  it('상세 정보를 불러오지 못하면 창 안에서 다시 시도하거나 닫을 수 있다', async () => {
    const user = userEvent.setup();
    let shouldFail = true;

    mockUseGetBookDetail.mockImplementation(() => {
      if (shouldFail) {
        throw createBookDetailRequestError();
      }

      return mockBookDetailResponse;
    });

    renderRouter(['/books?title=파친코&page=1']);

    await user.click(await screen.findByRole('button', {name: '상세 보기'}));

    const detailDialog = await screen.findByRole('dialog', {name: '도서 상세 정보'});
    const errorSection = within(detailDialog)
      .getByRole('heading', {name: '도서 상세 정보를 불러오지 못했어요'})
      .closest('section');

    expect(errorSection).toBeInstanceOf(HTMLElement);

    if (!(errorSection instanceof HTMLElement)) {
      throw new Error('book detail error section not found');
    }

    expect(
      within(detailDialog).getByText('도서 상세 서버와 연결이 원활하지 않아요. 잠시 후 다시 시도해주세요.'),
    ).toBeInTheDocument();
    expect(within(errorSection).getByRole('button', {name: '다시 시도'})).toBeInTheDocument();
    expect(within(errorSection).getByRole('button', {name: '닫기'})).toBeInTheDocument();

    shouldFail = false;
    await user.click(within(errorSection).getByRole('button', {name: '다시 시도'}));

    expect(await within(detailDialog).findByRole('heading', {name: '파친코'})).toBeInTheDocument();
  });

  it('Esc 키로 도서 상세 창을 닫을 수 있다', async () => {
    const user = userEvent.setup();

    renderRouter(['/books?title=파친코&page=1']);

    await user.click(await screen.findByRole('button', {name: '상세 보기'}));
    expect(await screen.findByRole('dialog', {name: '도서 상세 정보'})).toBeInTheDocument();

    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(screen.queryByRole('dialog', {name: '도서 상세 정보'})).not.toBeInTheDocument();
    });
  });

  it('배경을 누르면 도서 상세 창을 닫을 수 있다', async () => {
    const user = userEvent.setup();

    renderRouter(['/books?title=파친코&page=1']);

    await user.click(await screen.findByRole('button', {name: '상세 보기'}));
    expect(await screen.findByRole('dialog', {name: '도서 상세 정보'})).toBeInTheDocument();

    const overlay = document.querySelector('[data-slot="dialog-overlay"]');

    expect(overlay).toBeInstanceOf(HTMLElement);

    if (!(overlay instanceof HTMLElement)) {
      throw new Error('dialog overlay not found');
    }

    await user.click(overlay);

    await waitFor(() => {
      expect(screen.queryByRole('dialog', {name: '도서 상세 정보'})).not.toBeInTheDocument();
    });
  });

  it('다른 검색어로 다시 검색하면 열려 있던 도서 상세 창이 닫힌다', async () => {
    const {router} = renderRouter(['/books?title=파친코&page=1']);

    await userEvent.setup().click(await screen.findByRole('button', {name: '상세 보기'}));
    expect(await screen.findByRole('dialog', {name: '도서 상세 정보'})).toBeInTheDocument();

    await act(async () => {
      await router.navigate('/books?title=채식주의자&page=1');
    });

    await waitFor(() => {
      expect(screen.queryByRole('dialog', {name: '도서 상세 정보'})).not.toBeInTheDocument();
    });
    expect(screen.getByRole('heading', {level: 1, name: '채식주의자에 대한 12개의 검색 결과가 있습니다.'})).toBeInTheDocument();
  });

  it('결과 화면을 벗어났다가 다시 돌아오면 이전에 열어둔 도서 상세 창이 남아 있지 않다', async () => {
    const {router} = renderRouter(['/books?title=파친코&page=1']);

    await userEvent.setup().click(await screen.findByRole('button', {name: '상세 보기'}));
    expect(await screen.findByRole('dialog', {name: '도서 상세 정보'})).toBeInTheDocument();

    await act(async () => {
      await router.navigate('/');
    });

    await waitFor(() => {
      expect(screen.queryByRole('dialog', {name: '도서 상세 정보'})).not.toBeInTheDocument();
    });

    await act(async () => {
      await router.navigate('/books?title=파친코&page=1');
    });

    expect(await screen.findByRole('region', {name: '도서 검색 결과 화면'})).toBeInTheDocument();
    expect(screen.queryByRole('dialog', {name: '도서 상세 정보'})).not.toBeInTheDocument();
  });

  it('다른 책을 보더라도 마지막으로 고른 지역을 다시 이어서 볼 수 있다', async () => {
    const user = userEvent.setup();

    mockUseGetSearchBooks.mockReturnValue({
      items: [
        {
          author: '이민진',
          detailUrl: null,
          imageUrl: null,
          isbn13: '9788954682155',
          loanCount: 12,
          publicationYear: '2018',
          publisher: '문학사상',
          title: '파친코',
        },
        {
          author: '한강',
          detailUrl: null,
          imageUrl: null,
          isbn13: '9788936434124',
          loanCount: 8,
          publicationYear: '2007',
          publisher: '창비',
          title: '채식주의자',
        },
      ],
      totalCount: 2,
    });

    renderRouter(['/books?title=파친코&page=1']);

    const resultList = screen.getByRole('list', {name: '도서 검색 결과 목록'});
    const libraryButtons = within(resultList).getAllByRole('button', {name: '소장 도서관 찾기'});

    await user.click(libraryButtons[0]);
    await user.click(await screen.findByRole('button', {name: '서울'}));
    await user.click(screen.getByRole('button', {name: '마포구'}));
    await user.click(screen.getByRole('button', {name: '선택 완료'}));

    expect(await screen.findByRole('dialog', {name: '도서관 검색 결과'})).toBeInTheDocument();
    expect(screen.queryByRole('dialog', {name: '검색 지역 선택'})).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', {name: '닫기'}));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', {name: '도서관 검색 결과'})).not.toBeInTheDocument();
    });

    await user.click(libraryButtons[0]);

    expect(await screen.findByText('서울 > 마포구')).toBeInTheDocument();
    expect(screen.getByRole('button', {name: '서울'})).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', {name: '마포구'})).toHaveAttribute('aria-pressed', 'true');

    await user.click(screen.getByRole('button', {name: '부산'}));
    expect(screen.getByText('부산 전체')).toBeInTheDocument();

    await user.click(screen.getByRole('button', {name: '닫기'}));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', {name: '검색 지역 선택'})).not.toBeInTheDocument();
    });

    await user.click(libraryButtons[0]);

    expect(await screen.findByText('서울 > 마포구')).toBeInTheDocument();
    expect(screen.getByRole('button', {name: '서울'})).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', {name: '마포구'})).toHaveAttribute('aria-pressed', 'true');

    await user.click(screen.getByRole('button', {name: '닫기'}));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', {name: '검색 지역 선택'})).not.toBeInTheDocument();
    });

    await user.click(libraryButtons[1]);

    expect(await screen.findByText('서울 > 마포구')).toBeInTheDocument();
    expect(screen.getByRole('button', {name: '서울'})).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', {name: '마포구'})).toHaveAttribute('aria-pressed', 'true');
  });

  it('지역을 고르면 도서관 검색 결과 창을 열고 닫을 수 있다', async () => {
    const user = userEvent.setup();

    renderRouter(['/books?title=파친코&page=1']);

    await user.click(await screen.findByRole('button', {name: '소장 도서관 찾기'}));
    await user.click(await screen.findByRole('button', {name: '서울'}));
    await user.click(screen.getByRole('button', {name: '선택 완료'}));

    const libraryResultDialog = await screen.findByRole('dialog', {name: '도서관 검색 결과'});

    expect(libraryResultDialog).toBeInTheDocument();
    expect(screen.queryByRole('dialog', {name: '검색 지역 선택'})).not.toBeInTheDocument();
    expect(within(libraryResultDialog).getByRole('heading', {name: '검색 결과'})).toBeInTheDocument();
    expect(within(libraryResultDialog).getByText('총 12개의 도서관을 검색했어요.')).toBeInTheDocument();
    expect(within(libraryResultDialog).getByLabelText('검색 결과 목록 패널')).toBeInTheDocument();
    expect(within(libraryResultDialog).getByLabelText('도서관 지도 패널')).toBeInTheDocument();
    expect(within(libraryResultDialog).getByLabelText('선택된 도서관 정보 패널')).toBeInTheDocument();
    expect(within(libraryResultDialog).getByRole('button', {name: '대출 가능 여부 조회'})).toBeInTheDocument();

    const firstLibraryRow = within(libraryResultDialog).getByRole('button', {name: /마포중앙도서관/});
    const secondLibraryRow = within(libraryResultDialog).getByRole('button', {name: /합정열람실/});
    const detailPanel = within(libraryResultDialog).getByLabelText('선택된 도서관 정보 패널');

    expect(firstLibraryRow).toHaveAttribute('aria-pressed', 'true');
    expect(secondLibraryRow).toHaveAttribute('aria-pressed', 'false');
    expect(within(detailPanel).getByRole('heading', {name: '마포중앙도서관'})).toBeInTheDocument();
    expect(within(detailPanel).getByText('서울특별시 마포구 월드컵북로 1')).toBeInTheDocument();

    await user.click(secondLibraryRow);

    await waitFor(() => {
      expect(firstLibraryRow).toHaveAttribute('aria-pressed', 'false');
      expect(secondLibraryRow).toHaveAttribute('aria-pressed', 'true');
      expect(within(detailPanel).getByRole('heading', {name: '합정열람실'})).toBeInTheDocument();
      expect(within(detailPanel).getByText('서울특별시 마포구 양화로 2')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', {name: '닫기'}));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', {name: '도서관 검색 결과'})).not.toBeInTheDocument();
    });

    expect(screen.getByRole('form', {name: '도서 결과 재검색'})).toBeInTheDocument();
  });

  it('도서관 결과 페이지를 바꾸면 새 페이지의 첫 도서관 정보가 바로 보인다', async () => {
    const user = userEvent.setup();

    renderRouter(['/books?title=파친코&page=1']);

    await user.click(await screen.findByRole('button', {name: '소장 도서관 찾기'}));
    await user.click(await screen.findByRole('button', {name: '서울'}));
    await user.click(screen.getByRole('button', {name: '선택 완료'}));

    const libraryResultDialog = await screen.findByRole('dialog', {name: '도서관 검색 결과'});
    const pagination = within(libraryResultDialog).getByRole('navigation', {
      name: '도서관 검색 결과 페이지네이션',
    });

    expect(within(pagination).getByText('1')).toHaveAttribute('aria-current', 'page');

    await user.click(within(pagination).getByRole('button', {name: '2페이지'}));

    await waitFor(() => {
      expect(within(pagination).getByText('2')).toHaveAttribute('aria-current', 'page');
    });

    const detailPanel = within(libraryResultDialog).getByLabelText('선택된 도서관 정보 패널');
    const firstSecondPageRow = within(libraryResultDialog).getByRole('button', {name: /상수문화도서관/});
    const secondSecondPageRow = within(libraryResultDialog).getByRole('button', {name: /성산열람실/});

    expect(firstSecondPageRow).toHaveAttribute('aria-pressed', 'true');
    expect(secondSecondPageRow).toHaveAttribute('aria-pressed', 'false');
    expect(within(detailPanel).getByRole('heading', {name: '상수문화도서관'})).toBeInTheDocument();
    expect(within(detailPanel).getByText('서울특별시 마포구 독막로 11')).toBeInTheDocument();
  });

  it('도서관 결과 창을 닫고 다시 열면 책을 다시 확인하기 전 상태로 보인다', async () => {
    const user = userEvent.setup();

    renderRouter(['/books?title=파친코&page=1']);

    await user.click(await screen.findByRole('button', {name: '소장 도서관 찾기'}));
    await user.click(await screen.findByRole('button', {name: '서울'}));
    await user.click(screen.getByRole('button', {name: '선택 완료'}));

    const firstLibraryDialog = await screen.findByRole('dialog', {name: '도서관 검색 결과'});
    const firstPagination = within(firstLibraryDialog).getByRole('navigation', {
      name: '도서관 검색 결과 페이지네이션',
    });

    await user.click(within(firstPagination).getByRole('button', {name: '2페이지'}));

    await waitFor(() => {
      expect(within(firstPagination).getByText('2')).toHaveAttribute('aria-current', 'page');
    });

    await user.click(within(firstLibraryDialog).getByRole('button', {name: /성산열람실/}));
    await user.click(within(firstLibraryDialog).getByRole('button', {name: '대출 가능 여부 조회'}));

    expect(await screen.findByRole('button', {name: '대출이 가능해요'})).toBeInTheDocument();

    await user.click(screen.getByRole('button', {name: '닫기'}));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', {name: '도서관 검색 결과'})).not.toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', {name: '소장 도서관 찾기'}));

    const regionDialog = await screen.findByRole('dialog', {name: '검색 지역 선택'});

    expect(within(regionDialog).getByRole('button', {name: '서울'})).toHaveAttribute('aria-pressed', 'true');

    await user.click(within(regionDialog).getByRole('button', {name: '선택 완료'}));

    const reopenedLibraryDialog = await screen.findByRole('dialog', {name: '도서관 검색 결과'});
    const reopenedPagination = within(reopenedLibraryDialog).getByRole('navigation', {
      name: '도서관 검색 결과 페이지네이션',
    });
    const detailPanel = within(reopenedLibraryDialog).getByLabelText('선택된 도서관 정보 패널');
    const firstLibraryRow = within(reopenedLibraryDialog).getByRole('button', {name: /마포중앙도서관/});
    const secondLibraryRow = within(reopenedLibraryDialog).getByRole('button', {name: /합정열람실/});

    expect(within(reopenedPagination).getByText('1')).toHaveAttribute('aria-current', 'page');
    expect(firstLibraryRow).toHaveAttribute('aria-pressed', 'true');
    expect(secondLibraryRow).toHaveAttribute('aria-pressed', 'false');
    expect(within(detailPanel).getByRole('heading', {name: '마포중앙도서관'})).toBeInTheDocument();
    expect(within(detailPanel).getByText('서울특별시 마포구 월드컵북로 1')).toBeInTheDocument();
    expect(within(reopenedLibraryDialog).getByRole('button', {name: '대출 가능 여부 조회'})).toBeEnabled();
    expect(
      within(reopenedLibraryDialog).queryByRole('button', {name: '대출이 가능해요'}),
    ).not.toBeInTheDocument();
  });

  it('지도에서 도서관을 누르면 목록과 선택한 도서관 정보가 함께 바뀐다', async () => {
    const user = userEvent.setup();
    const {kakaoMaps, triggerMarkerClickByCoordinates} = createMockKakaoMaps();

    mockKakaoMapConfig.appKey = 'test-kakao-app-key';
    mockKakaoMapConfig.isEnabled = true;
    mockLoadKakaoMapSdk.mockResolvedValue(kakaoMaps);

    renderRouter(['/books?title=파친코&page=1']);

    await user.click(await screen.findByRole('button', {name: '소장 도서관 찾기'}));
    await user.click(await screen.findByRole('button', {name: '서울'}));
    await user.click(screen.getByRole('button', {name: '선택 완료'}));

    const libraryResultDialog = await screen.findByRole('dialog', {name: '도서관 검색 결과'});
    const pagination = within(libraryResultDialog).getByRole('navigation', {
      name: '도서관 검색 결과 페이지네이션',
    });

    await user.click(within(pagination).getByRole('button', {name: '2페이지'}));

    const firstSecondPageRow = await within(libraryResultDialog).findByRole('button', {name: /상수문화도서관/});
    const secondSecondPageRow = within(libraryResultDialog).getByRole('button', {name: /성산열람실/});
    const detailPanel = within(libraryResultDialog).getByLabelText('선택된 도서관 정보 패널');

    expect(firstSecondPageRow).toHaveAttribute('aria-pressed', 'true');
    expect(secondSecondPageRow).toHaveAttribute('aria-pressed', 'false');

    await act(async () => {
      triggerMarkerClickByCoordinates({
        latitude: 37.5631,
        longitude: 126.9084,
      });
    });

    await waitFor(() => {
      expect(firstSecondPageRow).toHaveAttribute('aria-pressed', 'false');
      expect(secondSecondPageRow).toHaveAttribute('aria-pressed', 'true');
      expect(within(detailPanel).getByRole('heading', {name: '성산열람실'})).toBeInTheDocument();
      expect(within(detailPanel).getByText('서울특별시 마포구 성지길 12')).toBeInTheDocument();
    });
  });

  it('도서관을 찾지 못했을 때 지역을 다시 선택할 수 있다', async () => {
    const user = userEvent.setup();

    mockUseGetSearchLibraries.mockReturnValue({
      isbn: '9788954682155',
      items: [],
      page: 1,
      pageSize: 10,
      region: '11',
      resultCount: 0,
      totalCount: 0,
    });

    renderRouter(['/books?title=파친코&page=1']);

    await user.click(await screen.findByRole('button', {name: '소장 도서관 찾기'}));
    await user.click(await screen.findByRole('button', {name: '서울'}));
    await user.click(screen.getByRole('button', {name: '선택 완료'}));

    expect(await screen.findByText('소장 중인 도서관을 찾지 못했어요.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', {name: '지역 다시 선택'}));

    expect(await screen.findByRole('dialog', {name: '검색 지역 선택'})).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByRole('dialog', {name: '도서관 검색 결과'})).not.toBeInTheDocument();
    });
  });

  it('지역을 다시 선택한 뒤 결과를 다시 보면 책을 다시 확인하기 전 상태로 보인다', async () => {
    const user = userEvent.setup();

    renderRouter(['/books?title=파친코&page=1']);

    await user.click(await screen.findByRole('button', {name: '소장 도서관 찾기'}));
    await user.click(await screen.findByRole('button', {name: '서울'}));
    await user.click(screen.getByRole('button', {name: '마포구'}));
    await user.click(screen.getByRole('button', {name: '선택 완료'}));

    const libraryDialog = await screen.findByRole('dialog', {name: '도서관 검색 결과'});
    const pagination = within(libraryDialog).getByRole('navigation', {
      name: '도서관 검색 결과 페이지네이션',
    });

    await user.click(within(pagination).getByRole('button', {name: '2페이지'}));

    await waitFor(() => {
      expect(within(pagination).getByText('2')).toHaveAttribute('aria-current', 'page');
    });

    await user.click(within(libraryDialog).getByRole('button', {name: /성산열람실/}));
    await user.click(within(libraryDialog).getByRole('button', {name: '대출 가능 여부 조회'}));

    expect(await screen.findByRole('button', {name: '대출이 가능해요'})).toBeInTheDocument();

    await user.click(within(libraryDialog).getByRole('button', {name: '지역 변경'}));

    const regionDialog = await screen.findByRole('dialog', {name: '검색 지역 선택'});

    await waitFor(() => {
      expect(screen.queryByRole('dialog', {name: '도서관 검색 결과'})).not.toBeInTheDocument();
    });

    expect(within(regionDialog).getByText('서울 > 마포구')).toBeInTheDocument();
    expect(within(regionDialog).getByRole('button', {name: '서울'})).toHaveAttribute('aria-pressed', 'true');
    expect(within(regionDialog).getByRole('button', {name: '마포구'})).toHaveAttribute('aria-pressed', 'true');

    await user.click(within(regionDialog).getByRole('button', {name: '선택 완료'}));

    const reopenedLibraryDialog = await screen.findByRole('dialog', {name: '도서관 검색 결과'});
    const reopenedPagination = within(reopenedLibraryDialog).getByRole('navigation', {
      name: '도서관 검색 결과 페이지네이션',
    });
    const detailPanel = within(reopenedLibraryDialog).getByLabelText('선택된 도서관 정보 패널');
    const firstLibraryRow = within(reopenedLibraryDialog).getByRole('button', {name: /마포중앙도서관/});
    const secondLibraryRow = within(reopenedLibraryDialog).getByRole('button', {name: /합정열람실/});

    expect(within(reopenedPagination).getByText('1')).toHaveAttribute('aria-current', 'page');
    expect(firstLibraryRow).toHaveAttribute('aria-pressed', 'true');
    expect(secondLibraryRow).toHaveAttribute('aria-pressed', 'false');
    expect(within(detailPanel).getByRole('heading', {name: '마포중앙도서관'})).toBeInTheDocument();
    expect(within(detailPanel).getByText('서울특별시 마포구 월드컵북로 1')).toBeInTheDocument();
    expect(within(reopenedLibraryDialog).getByRole('button', {name: '대출 가능 여부 조회'})).toBeEnabled();
    expect(
      within(reopenedLibraryDialog).queryByRole('button', {name: '대출이 가능해요'}),
    ).not.toBeInTheDocument();
  });

  it('도서관을 찾지 못했을 때 다른 책을 다시 고를 수 있다', async () => {
    const user = userEvent.setup();

    mockUseGetSearchLibraries.mockReturnValue({
      isbn: '9788954682155',
      items: [],
      page: 1,
      pageSize: 10,
      region: '11',
      resultCount: 0,
      totalCount: 0,
    });

    renderRouter(['/books?title=파친코&page=1']);

    await user.click(await screen.findByRole('button', {name: '소장 도서관 찾기'}));
    await user.click(await screen.findByRole('button', {name: '서울'}));
    await user.click(screen.getByRole('button', {name: '선택 완료'}));

    expect(await screen.findByText('소장 중인 도서관을 찾지 못했어요.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', {name: '다른 책 다시 선택'}));

    await waitFor(() => {
      expect(screen.queryByRole('dialog', {name: '도서관 검색 결과'})).not.toBeInTheDocument();
    });
    expect(screen.getByRole('form', {name: '도서 결과 재검색'})).toBeInTheDocument();
  });

  it('책 검색 흐름을 다시 시작한 뒤 다시 들어오면 책을 다시 확인하기 전 상태로 보인다', async () => {
    const user = userEvent.setup();
    const {router} = renderRouter(['/books?title=파친코&page=1']);

    await user.click(await screen.findByRole('button', {name: '소장 도서관 찾기'}));
    await user.click(await screen.findByRole('button', {name: '서울'}));
    await user.click(screen.getByRole('button', {name: '마포구'}));
    await user.click(screen.getByRole('button', {name: '선택 완료'}));

    const firstLibraryDialog = await screen.findByRole('dialog', {name: '도서관 검색 결과'});

    await user.click(within(firstLibraryDialog).getByRole('button', {name: '대출 가능 여부 조회'}));

    expect(await screen.findByRole('button', {name: '대출이 가능해요'})).toBeInTheDocument();

    await act(async () => {
      await router.navigate('/');
    });

    expect(await screen.findByRole('heading', {level: 1, name: /이 책,/})).toBeInTheDocument();

    await act(async () => {
      await router.navigate('/books?title=파친코&page=1');
    });

    expect(await screen.findByRole('form', {name: '도서 결과 재검색'})).toBeInTheDocument();
    expect(screen.queryByRole('dialog', {name: '검색 지역 선택'})).not.toBeInTheDocument();
    expect(screen.queryByRole('dialog', {name: '도서관 검색 결과'})).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', {name: '소장 도서관 찾기'}));

    const regionDialog = await screen.findByRole('dialog', {name: '검색 지역 선택'});

    expect(screen.getByText('지역을 선택해주세요')).toBeInTheDocument();
    expect(screen.queryByText('서울 > 마포구')).not.toBeInTheDocument();

    await user.click(within(regionDialog).getByRole('button', {name: '서울'}));
    await user.click(within(regionDialog).getByRole('button', {name: '마포구'}));
    await user.click(within(regionDialog).getByRole('button', {name: '선택 완료'}));

    const reopenedLibraryDialog = await screen.findByRole('dialog', {name: '도서관 검색 결과'});

    expect(within(reopenedLibraryDialog).getByRole('button', {name: '대출 가능 여부 조회'})).toBeEnabled();
    expect(
      within(reopenedLibraryDialog).queryByRole('button', {name: '대출이 가능해요'}),
    ).not.toBeInTheDocument();
  });

  it('검색어 없이 결과 화면 주소로 들어오면 홈으로 이동한다', async () => {
    renderRouter(['/books']);

    expect(await screen.findByRole('heading', {level: 1, name: /이 책,/})).toBeInTheDocument();
    expect(screen.getByRole('tablist', {name: '검색 기준 선택'})).toBeInTheDocument();
  });

  it('잘못된 검색 결과 주소로 들어오면 다시 검색할 수 있는 안내를 보여준다', () => {
    renderRouter(['/books?title=&page=abc']);

    expect(screen.getByRole('link', {name: '메인으로'})).toHaveAttribute('href', '/');
    expect(screen.getByRole('heading', {level: 1, name: '검색 결과를 불러올 수 없어요'})).toBeInTheDocument();
    expect(screen.getByRole('link', {name: '검색 다시 시작'})).toHaveAttribute('href', '/');
  });

  it('없는 주소로 들어오면 찾을 수 없다는 안내를 보여준다', () => {
    renderRouter(['/missing']);

    expect(screen.queryByRole('link', {name: '메인으로'})).not.toBeInTheDocument();
    expect(screen.getByRole('heading', {name: '페이지를 찾을 수 없어요'})).toBeInTheDocument();
    expect(screen.getByRole('link', {name: '홈으로 돌아가기'})).toHaveAttribute('href', '/');
  });
});
