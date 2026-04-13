import type {AppFixtures} from '../../src/app/fixtures.types.js';
import {getBookDetailFixtureResult} from './book/detail/fixture.js';
import {getBookSearchFixtureResult} from './book/search/fixture.js';
import {getLibraryAvailabilityFixtureResult} from './library/availability/fixture.js';
import {getLibrarySearchFixtureResult} from './library/search/fixture.js';

const devFixtures: AppFixtures = {
  bookDetail: {
    resolve: getBookDetailFixtureResult,
  },
  bookSearch: {
    resolve: getBookSearchFixtureResult,
  },
  libraryAvailability: {
    resolve: getLibraryAvailabilityFixtureResult,
  },
  librarySearch: {
    resolve: getLibrarySearchFixtureResult,
  },
};

export {devFixtures};
