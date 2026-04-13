import type {AppFixtures} from './fixtures.types.js';

function createAppFixtures(overrides?: AppFixtures): AppFixtures {
  return {
    bookDetail: overrides?.bookDetail,
    bookSearch: overrides?.bookSearch,
    libraryAvailability: overrides?.libraryAvailability,
    librarySearch: overrides?.librarySearch,
  };
}

export {createAppFixtures};
