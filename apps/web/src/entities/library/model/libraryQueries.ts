import { getLibraries } from '../api/libraryApi'
import type { LibrarySearchParams } from './librarySchema'

function createLibrarySearchQueryKey(params: LibrarySearchParams) {
  return [...librariesQueryKeys.search.all(), params] as const
}

const librariesQueryKeys = {
  all: () => ['libraries'] as const,
  search: {
    all: () => [...librariesQueryKeys.all(), 'search'] as const,
    list: (params: LibrarySearchParams) =>
      createLibrarySearchQueryKey(params),
  },
}

const librariesQueryOptions = {
  search: (params: LibrarySearchParams) => ({
    queryFn: () => getLibraries(params),
    queryKey: createLibrarySearchQueryKey(params),
  }),
}

export { librariesQueryKeys, librariesQueryOptions }
