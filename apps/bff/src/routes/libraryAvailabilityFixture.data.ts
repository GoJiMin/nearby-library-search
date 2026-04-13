import type {Isbn13, LibraryCode} from '@nearby-library-search/contracts';

type LibraryAvailabilityFixtureItem = {
  isbn13: Isbn13;
  libraryCode: LibraryCode;
  scenario: LibraryAvailabilityFixtureScenario;
};

type LibraryAvailabilityFixtureScenario = 'available' | 'error' | 'not-owned' | 'unavailable';

const FIXTURE_SCENARIO_BY_CODE_SUFFIX: Readonly<Record<string, LibraryAvailabilityFixtureScenario>> = {
  '01': 'available',
  '02': 'unavailable',
  '03': 'error',
  '04': 'not-owned',
};

function resolveLibraryAvailabilityFixtureScenario(libraryCode: LibraryCode): LibraryAvailabilityFixtureScenario {
  const suffix = libraryCode.match(/(\d{2})$/)?.[1];

  if (suffix == null) {
    return 'available';
  }

  return FIXTURE_SCENARIO_BY_CODE_SUFFIX[suffix] ?? 'available';
}

const libraryAvailabilityFixtureSeeds: ReadonlyArray<Pick<LibraryAvailabilityFixtureItem, 'isbn13' | 'libraryCode'>> = [
  {
    isbn13: '9791192389479',
    libraryCode: 'LIB0001',
  },
  {
    isbn13: '9791192389479',
    libraryCode: 'LIB0002',
  },
  {
    isbn13: '9791192389479',
    libraryCode: 'LIB0003',
  },
  {
    isbn13: '9791192389479',
    libraryCode: 'LIB0004',
  },
];

const libraryAvailabilityFixtureItems: ReadonlyArray<LibraryAvailabilityFixtureItem> = libraryAvailabilityFixtureSeeds.map(
  item => ({
    ...item,
    scenario: resolveLibraryAvailabilityFixtureScenario(item.libraryCode),
  }),
);

export {libraryAvailabilityFixtureItems, resolveLibraryAvailabilityFixtureScenario};
export type {LibraryAvailabilityFixtureItem, LibraryAvailabilityFixtureScenario};
