import type {DetailRegionCode, Isbn, RegionCode} from '@nearby-library-search/contracts';
import type {LibrarySearchItem} from '@nearby-library-search/contracts';

type LibrarySearchFixtureLibrary = LibrarySearchItem & {
  detailRegion?: DetailRegionCode;
  isbn: Isbn;
  region: RegionCode;
};

type SeoulLibrarySearchFixtureDistrict = {
  detailRegion: DetailRegionCode;
  districtLabel: string;
  homepageSlug: string;
  latitudeOffset: number;
  longitudeOffset: number;
};

const mapoLibrarySearchFixtureLibraries: ReadonlyArray<LibrarySearchItem> = [
  {
    address: '서울특별시 마포구 월드컵북로 1',
    closedDays: '둘째 주 월요일',
    code: 'LIB0001',
    fax: null,
    homepage: 'https://library.example.com/mapo-1',
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
    latitude: 37.5551,
    longitude: 126.9218,
    name: '합정열람실',
    operatingTime: '10:00 - 20:00',
    phone: '02-2222-3333',
  },
  {
    address: '서울특별시 마포구 독막로 3',
    closedDays: '첫째 주 월요일',
    code: 'LIB0003',
    fax: null,
    homepage: 'https://library.example.com/mapo-3',
    latitude: 37.5481,
    longitude: 126.9157,
    name: '서강책마루',
    operatingTime: '09:00 - 18:00',
    phone: '02-3333-4444',
  },
  {
    address: '서울특별시 마포구 토정로 4',
    closedDays: '일요일',
    code: 'LIB0004',
    fax: null,
    homepage: null,
    latitude: null,
    longitude: null,
    name: '토정정보도서관',
    operatingTime: '09:00 - 21:00',
    phone: '02-4444-5555',
  },
  {
    address: '서울특별시 마포구 성산로 5',
    closedDays: '둘째 주 화요일',
    code: 'LIB0005',
    fax: null,
    homepage: 'https://library.example.com/mapo-5',
    latitude: 37.5634,
    longitude: 126.9081,
    name: '성산서고',
    operatingTime: '08:30 - 20:30',
    phone: '02-5555-6666',
  },
  {
    address: '서울특별시 마포구 상암산로 6',
    closedDays: '매월 마지막 수요일',
    code: 'LIB0006',
    fax: null,
    homepage: 'https://library.example.com/mapo-6',
    latitude: 37.5774,
    longitude: 126.8921,
    name: '상암미디어도서관',
    operatingTime: '09:00 - 22:00',
    phone: '02-6666-7777',
  },
  {
    address: '서울특별시 마포구 망원로 7',
    closedDays: '둘째 주 금요일',
    code: 'LIB0007',
    fax: null,
    homepage: null,
    latitude: 37.5546,
    longitude: 126.9012,
    name: '망원책나루',
    operatingTime: '10:00 - 20:00',
    phone: '02-7777-8888',
  },
  {
    address: '서울특별시 마포구 연남로 8',
    closedDays: '설·추석 당일',
    code: 'LIB0008',
    fax: null,
    homepage: 'https://library.example.com/mapo-8',
    latitude: 37.5625,
    longitude: 126.9259,
    name: '연남문고',
    operatingTime: '11:00 - 21:00',
    phone: '02-8888-9999',
  },
  {
    address: '서울특별시 마포구 서교로 9',
    closedDays: '셋째 주 월요일',
    code: 'LIB0009',
    fax: null,
    homepage: null,
    latitude: null,
    longitude: null,
    name: '서교정보서재',
    operatingTime: '09:00 - 18:00',
    phone: '02-9999-0001',
  },
  {
    address: '서울특별시 마포구 와우산로 10',
    closedDays: '넷째 주 화요일',
    code: 'LIB0010',
    fax: null,
    homepage: 'https://library.example.com/mapo-10',
    latitude: 37.5513,
    longitude: 126.9241,
    name: '홍대창작자료실',
    operatingTime: '10:00 - 22:00',
    phone: '02-0001-0002',
  },
  {
    address: '서울특별시 마포구 공덕로 11',
    closedDays: '일요일',
    code: 'LIB0011',
    fax: null,
    homepage: 'https://library.example.com/mapo-11',
    latitude: 37.5455,
    longitude: 126.9521,
    name: '공덕자료보관실',
    operatingTime: '09:00 - 19:00',
    phone: '02-0002-0003',
  },
  {
    address: '서울특별시 마포구 신촌로 12',
    closedDays: '법정 공휴일',
    code: 'LIB0012',
    fax: null,
    homepage: null,
    latitude: 37.5558,
    longitude: 126.9395,
    name: '신촌아카이브',
    operatingTime: '08:00 - 21:00',
    phone: '02-0003-0004',
  },
];

const seoulLibrarySearchFixtureDistricts: ReadonlyArray<SeoulLibrarySearchFixtureDistrict> = [
  {
    detailRegion: '11140',
    districtLabel: '마포구',
    homepageSlug: 'mapo',
    latitudeOffset: 0,
    longitudeOffset: 0,
  },
  {
    detailRegion: '11130',
    districtLabel: '서대문구',
    homepageSlug: 'seodaemun',
    latitudeOffset: 0.018,
    longitudeOffset: 0.014,
  },
  {
    detailRegion: '11120',
    districtLabel: '은평구',
    homepageSlug: 'eunpyeong',
    latitudeOffset: 0.034,
    longitudeOffset: -0.008,
  },
  {
    detailRegion: '11190',
    districtLabel: '영등포구',
    homepageSlug: 'yeongdeungpo',
    latitudeOffset: -0.012,
    longitudeOffset: 0.031,
  },
  {
    detailRegion: '11200',
    districtLabel: '동작구',
    homepageSlug: 'dongjak',
    latitudeOffset: -0.02,
    longitudeOffset: 0.009,
  },
  {
    detailRegion: '11220',
    districtLabel: '서초구',
    homepageSlug: 'seocho',
    latitudeOffset: -0.048,
    longitudeOffset: 0.058,
  },
  {
    detailRegion: '11230',
    districtLabel: '강남구',
    homepageSlug: 'gangnam',
    latitudeOffset: -0.038,
    longitudeOffset: 0.081,
  },
  {
    detailRegion: '11240',
    districtLabel: '송파구',
    homepageSlug: 'songpa',
    latitudeOffset: -0.024,
    longitudeOffset: 0.112,
  },
];

const supportedLibrarySearchFixtureBaseIsbns: ReadonlyArray<Isbn> = [
  '9788954682155',
  '9791196447182',
  '9788936434124',
  '9791192389479',
  '9788932021670',
  '9788954683374',
  '9788937482674',
  '9788956609952',
  '9788972976519',
  '9791157842728',
  '9788932471635',
  '9791191234567',
];

const supportedLibrarySearchFixturePaginatedIsbns: ReadonlyArray<Isbn> = Array.from({length: 24}, (_, index) => {
  const itemNumber = index + 1;

  return `9791198800${String(itemNumber).padStart(3, '0')}` as Isbn;
});

const supportedLibrarySearchFixtureIsbns = [
  ...supportedLibrarySearchFixtureBaseIsbns,
  ...supportedLibrarySearchFixturePaginatedIsbns,
];

function formatCoordinate(value: number) {
  return Number(value.toFixed(4));
}

function createDistrictScopedLibrarySearchFixtureLibraries(
  isbn: Isbn,
  district: SeoulLibrarySearchFixtureDistrict,
): ReadonlyArray<LibrarySearchFixtureLibrary> {
  if (district.detailRegion === '11140') {
    return mapoLibrarySearchFixtureLibraries.map(library => ({
      ...library,
      detailRegion: district.detailRegion,
      isbn,
      region: '11',
    }));
  }

  return mapoLibrarySearchFixtureLibraries.map((library, index) => ({
    ...library,
    address: library.address == null ? null : library.address.replace('마포구', district.districtLabel),
    code: `LIB${district.detailRegion}${String(index + 1).padStart(2, '0')}`,
    detailRegion: district.detailRegion,
    homepage:
      library.homepage == null ? null : library.homepage.replace('/mapo-', `/${district.homepageSlug}-`),
    isbn,
    latitude: library.latitude == null ? null : formatCoordinate(library.latitude + district.latitudeOffset),
    longitude: library.longitude == null ? null : formatCoordinate(library.longitude + district.longitudeOffset),
    name: `${district.districtLabel.replace(/구$/, '')} ${library.name}`,
    region: '11',
  }));
}

const librarySearchFixtureLibraries: ReadonlyArray<LibrarySearchFixtureLibrary> =
  supportedLibrarySearchFixtureIsbns.flatMap(isbn =>
    seoulLibrarySearchFixtureDistricts.flatMap(district =>
      createDistrictScopedLibrarySearchFixtureLibraries(isbn, district),
    ),
  );

export {librarySearchFixtureLibraries};
export type {LibrarySearchFixtureLibrary};
