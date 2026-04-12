import {useQuery} from '@tanstack/react-query';
import {librariesQueryOptions} from './libraryQueries';
import type {LibraryAvailabilityParams} from './librarySchema';

function useGetLibraryAvailability(params: LibraryAvailabilityParams) {
  return useQuery({
    ...librariesQueryOptions.availability(params),
    enabled: false,
    retry: 0,
  });
}

export {useGetLibraryAvailability};
