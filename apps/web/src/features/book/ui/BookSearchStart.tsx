import {type SyntheticEvent, useId} from 'react';
import type {BookSearchParams} from '@/entities/book';
import {createBookSearchStartParams} from '../model/createBookSearchStartParams';
import {useBookSearchStart} from '../model/useBookSearchStart';
import {BookSearchModeTabs} from './BookSearchModeTabs';
import {BookSearchQueryForm} from './BookSearchQueryForm';

type BookSearchStartProps = {
  onSubmitSearch: (params: BookSearchParams) => void;
};

function BookSearchStart({onSubmitSearch}: BookSearchStartProps) {
  const baseId = useId();
  const {queryText, searchMode, setQueryText, setSearchMode} = useBookSearchStart();
  const normalizedQuery = queryText.trim();
  const isSubmitDisabled = normalizedQuery.length === 0;

  function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!normalizedQuery) {
      return;
    }

    onSubmitSearch(createBookSearchStartParams({queryText, searchMode}));
  }

  return (
    <section
      aria-labelledby="book-search-start-heading"
      className="flex w-full max-w-2xl flex-col items-center justify-center gap-4"
    >
      <BookSearchModeTabs baseId={baseId} onChangeSearchMode={setSearchMode} searchMode={searchMode} />
      <BookSearchQueryForm
        baseId={baseId}
        isSubmitDisabled={isSubmitDisabled}
        onQueryTextChange={setQueryText}
        onSubmit={handleSubmit}
        queryText={queryText}
        searchMode={searchMode}
      />
    </section>
  );
}

export {BookSearchStart};
export type {BookSearchStartProps};
