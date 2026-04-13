import {resolveBookDetailFixtureResult} from '../routes/bookDetailFixture.js';
import {resolveBookSearchFixtureResult} from '../routes/bookSearchFixture.js';
import {resolveLibraryAvailabilityFixtureResult} from '../routes/libraryAvailabilityFixture.js';
import {resolveLibrarySearchFixtureResult} from '../routes/librarySearchFixture.js';
import type {AppFixtures} from './fixtures.js';

const defaultAppFixtures: Required<AppFixtures> = {
  bookDetail: {
    resolve: resolveBookDetailFixtureResult,
  },
  bookSearch: {
    resolve: resolveBookSearchFixtureResult,
  },
  libraryAvailability: {
    resolve: resolveLibraryAvailabilityFixtureResult,
  },
  librarySearch: {
    resolve: resolveLibrarySearchFixtureResult,
  },
};

function createAppFixtures(overrides?: AppFixtures): Required<AppFixtures> {
  return {
    bookDetail: overrides?.bookDetail ?? defaultAppFixtures.bookDetail,
    bookSearch: overrides?.bookSearch ?? defaultAppFixtures.bookSearch,
    libraryAvailability: overrides?.libraryAvailability ?? defaultAppFixtures.libraryAvailability,
    librarySearch: overrides?.librarySearch ?? defaultAppFixtures.librarySearch,
  };
}

export {createAppFixtures};
