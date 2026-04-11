import type {Isbn13, LibraryCode} from './identifiers.js';

export type LibraryAvailabilityFlag = 'Y' | 'N';

export type LibraryAvailabilityResponse = {
  libraryCode: LibraryCode;
  isbn13: Isbn13;
  hasBook: LibraryAvailabilityFlag;
  loanAvailable: LibraryAvailabilityFlag;
};
