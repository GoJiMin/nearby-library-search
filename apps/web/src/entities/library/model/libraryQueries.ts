import {getLibraries, getLibraryAvailability} from '../api/libraryApi';
import type {LibraryAvailabilityParams, LibrarySearchParams} from './librarySchema';

function createLibrarySearchQueryKey(params: LibrarySearchParams) {
  return [...librariesQueryKeys.search.all(), params] as const;
}

function createLibraryAvailabilityQueryKey(params: LibraryAvailabilityParams) {
  return [...librariesQueryKeys.availability.all(), params] as const;
}

const librariesQueryKeys = {
  all: () => ['libraries'] as const,
  availability: {
    all: () => [...librariesQueryKeys.all(), 'availability'] as const,
    detail: (params: LibraryAvailabilityParams) => createLibraryAvailabilityQueryKey(params),
  },
  search: {
    all: () => [...librariesQueryKeys.all(), 'search'] as const,
    list: (params: LibrarySearchParams) => createLibrarySearchQueryKey(params),
  },
};

const librariesQueryOptions = {
  availability: (params: LibraryAvailabilityParams) => ({
    queryFn: () => getLibraryAvailability(params),
    queryKey: createLibraryAvailabilityQueryKey(params),
  }),
  search: (params: LibrarySearchParams) => ({
    queryFn: () => getLibraries(params),
    queryKey: createLibrarySearchQueryKey(params),
  }),
};

export {librariesQueryKeys, librariesQueryOptions};
