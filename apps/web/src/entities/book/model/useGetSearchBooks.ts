import {useSuspenseQuery} from '@tanstack/react-query';
import {booksQueryOptions} from './bookQueries';
import type {BookSearchParams} from './bookSchema';

function useGetSearchBooks(params: BookSearchParams) {
  const {data} = useSuspenseQuery(booksQueryOptions.search(params));

  return data;
}

export {useGetSearchBooks};
