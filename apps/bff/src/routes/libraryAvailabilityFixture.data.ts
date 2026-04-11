import type {Isbn13, LibraryAvailabilityFlag, LibraryCode} from '@nearby-library-search/contracts';
import {librarySearchFixtureItems} from './librarySearchFixture.data.js';

type LibraryAvailabilityFixtureItem = {
  isbn13: Isbn13;
  libraryCode: LibraryCode;
  hasBook: LibraryAvailabilityFlag;
  loanAvailable: LibraryAvailabilityFlag;
};

function getLibraryAvailabilityFlags(libraryCode: LibraryCode): Pick<LibraryAvailabilityFixtureItem, 'hasBook' | 'loanAvailable'> {
  const suffix = Number(libraryCode.match(/(\d{2})$/)?.[1] ?? Number.NaN);

  if (Number.isInteger(suffix) && suffix % 6 === 4) {
    return {
      hasBook: 'N',
      loanAvailable: 'N',
    };
  }

  if (Number.isInteger(suffix) && suffix % 2 === 0) {
    return {
      hasBook: 'Y',
      loanAvailable: 'N',
    };
  }

  return {
    hasBook: 'Y',
    loanAvailable: 'Y',
  };
}

const libraryAvailabilityFixtureItems: ReadonlyArray<LibraryAvailabilityFixtureItem> = librarySearchFixtureItems.map(item => ({
  isbn13: item.isbn,
  libraryCode: item.code,
  ...getLibraryAvailabilityFlags(item.code),
}));

export {libraryAvailabilityFixtureItems};
export type {LibraryAvailabilityFixtureItem};
