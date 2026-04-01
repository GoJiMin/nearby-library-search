import type {Isbn13} from '@nearby-library-search/contracts';
import {useSuspenseQuery} from '@tanstack/react-query';
import {booksQueryOptions} from './bookQueries';

function useGetBookDetail(isbn13: Isbn13) {
  const {data} = useSuspenseQuery(booksQueryOptions.detail(isbn13));

  return data;
}

export {useGetBookDetail};
