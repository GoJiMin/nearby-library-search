import {resolveLibraryAvailabilityFixtureResult} from '../routes/libraryAvailabilityFixture.js';
import {resolveLibrarySearchFixtureResult} from '../routes/librarySearchFixture.js';
import type {AppFixtures} from './fixtures.types.js';

const defaultAppFixtures: AppFixtures = {
  libraryAvailability: {
    resolve: resolveLibraryAvailabilityFixtureResult,
  },
  librarySearch: {
    resolve: resolveLibrarySearchFixtureResult,
  },
};

function createAppFixtures(overrides?: AppFixtures): AppFixtures {
  return {
    bookDetail: overrides?.bookDetail ?? defaultAppFixtures.bookDetail,
    bookSearch: overrides?.bookSearch ?? defaultAppFixtures.bookSearch,
    libraryAvailability: overrides?.libraryAvailability ?? defaultAppFixtures.libraryAvailability,
    librarySearch: overrides?.librarySearch ?? defaultAppFixtures.librarySearch,
  };
}

export {createAppFixtures};
