import type {Isbn13, LibraryCode} from '@nearby-library-search/contracts';

type LibraryAvailabilityHoldingStatus = 'available' | 'error' | 'not-owned' | 'unavailable';

type LibraryAvailabilityHolding = {
  isbn13: Isbn13;
  libraryCode: LibraryCode;
  status: LibraryAvailabilityHoldingStatus;
};

const FIXTURE_STATUS_BY_LIBRARY_CODE_SUFFIX: Readonly<Record<string, LibraryAvailabilityHoldingStatus>> = {
  '01': 'available',
  '02': 'unavailable',
  '03': 'error',
  '04': 'not-owned',
};

function getLibraryAvailabilityHoldingStatus(libraryCode: LibraryCode): LibraryAvailabilityHoldingStatus {
  const suffix = libraryCode.match(/(\d{2})$/)?.[1];

  if (suffix == null) {
    return 'available';
  }

  return FIXTURE_STATUS_BY_LIBRARY_CODE_SUFFIX[suffix] ?? 'available';
}

const libraryAvailabilityHoldingSeeds: ReadonlyArray<Pick<LibraryAvailabilityHolding, 'isbn13' | 'libraryCode'>> = [
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

const libraryAvailabilityHoldings: ReadonlyArray<LibraryAvailabilityHolding> = libraryAvailabilityHoldingSeeds.map(
  holding => ({
    ...holding,
    status: getLibraryAvailabilityHoldingStatus(holding.libraryCode),
  }),
);

export {getLibraryAvailabilityHoldingStatus, libraryAvailabilityHoldings};
export type {LibraryAvailabilityHolding, LibraryAvailabilityHoldingStatus};
