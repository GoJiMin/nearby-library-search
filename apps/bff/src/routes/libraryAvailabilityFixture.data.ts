import type {Isbn13, LibraryCode} from '@nearby-library-search/contracts';
import {librarySearchFixtureItems} from './librarySearchFixture.data.js';

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

const libraryAvailabilityFixtureItems: ReadonlyArray<LibraryAvailabilityFixtureItem> = librarySearchFixtureItems.map(item => ({
  isbn13: item.isbn,
  libraryCode: item.code,
  scenario: resolveLibraryAvailabilityFixtureScenario(item.code),
}));

export {libraryAvailabilityFixtureItems, resolveLibraryAvailabilityFixtureScenario};
export type {LibraryAvailabilityFixtureItem, LibraryAvailabilityFixtureScenario};
