import {useSuspenseQuery} from '@tanstack/react-query';
import {librariesQueryOptions} from './libraryQueries';
import type {LibrarySearchParams} from './librarySchema';

function useGetSearchLibraries(params: LibrarySearchParams) {
  const {data} = useSuspenseQuery(librariesQueryOptions.search(params));

  return data;
}

export {useGetSearchLibraries};
