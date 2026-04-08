import {type SyntheticEvent, useId} from 'react';
import type {BookSearchParams} from '@/entities/book';
import {createBookSearchStartParams} from '../../model/createBookSearchStartParams';
import {useBookSearchStart} from '../../model/useBookSearchStart';
import {BookSearchModeTabs} from '../search-controls/BookSearchModeTabs';
import {BookSearchQueryForm} from '../search-controls/BookSearchQueryForm';

type BookSearchStartProps = {
  onSubmitSearch: (params: BookSearchParams) => void;
};

function BookSearchStart({onSubmitSearch}: BookSearchStartProps) {
  const baseId = useId();
  const {canSubmit, normalizedQuery, queryText, searchMode, setQueryText, setSearchMode} =
    useBookSearchStart();

  function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    onSubmitSearch(createBookSearchStartParams({normalizedQuery, searchMode}));
  }

  return (
    <section
      aria-labelledby="book-search-start-heading"
      className="flex w-full max-w-2xl flex-col items-center justify-center gap-4"
    >
      <BookSearchModeTabs baseId={baseId} onChangeSearchMode={setSearchMode} searchMode={searchMode} />
      <BookSearchQueryForm
        baseId={baseId}
        canSubmit={canSubmit}
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
