import type {LibraryAvailabilityResponse} from '@nearby-library-search/contracts';
import type {LibraryAvailabilityParams} from '../schemas/library.js';
import {libraryAvailabilityFixtureItems} from './libraryAvailabilityFixture.data.js';

function createLibraryAvailabilityFixtureResponse(params: LibraryAvailabilityParams): LibraryAvailabilityResponse {
  const fixtureItem = libraryAvailabilityFixtureItems.find(
    item => item.isbn13 === params.isbn13 && item.libraryCode === params.libraryCode,
  );

  if (fixtureItem === undefined) {
    throw new Error(
      `Missing availability fixture for libraryCode=${params.libraryCode}, isbn13=${params.isbn13}`,
    );
  }

  return {
    hasBook: fixtureItem.hasBook,
    isbn13: fixtureItem.isbn13,
    libraryCode: fixtureItem.libraryCode,
    loanAvailable: fixtureItem.loanAvailable,
  };
}

export {createLibraryAvailabilityFixtureResponse};
