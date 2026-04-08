import {type SyntheticEvent, useId} from 'react';
import type {BookSearchParams} from '@/entities/book';
import type {BookSearchMode} from '../model/bookSearchStart.contract';
import {createBookSearchStartParams} from '../model/createBookSearchStartParams';
import {useBookSearchStart} from '../model/useBookSearchStart';
import {BookSearchModeTabs} from './BookSearchModeTabs';
import {BookSearchQueryForm} from './BookSearchQueryForm';

type BookSearchResultSearchBarProps = {
  params: BookSearchParams;
  onSubmitSearch: (params: BookSearchParams) => void;
};

function BookSearchResultSearchBar({params, onSubmitSearch}: BookSearchResultSearchBarProps) {
  const baseId = useId();
  const initialSearchMode: BookSearchMode = params.title ? 'title' : 'author';
  const initialQueryText = params.title ?? params.author ?? '';
  const {queryText, searchMode, setQueryText, setSearchMode} = useBookSearchStart({
    initialQueryText,
    initialSearchMode,
  });
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
    <section aria-label="도서 결과 재검색" className="flex w-full flex-col items-center gap-4">
      <BookSearchModeTabs baseId={baseId} onChangeSearchMode={setSearchMode} searchMode={searchMode} />
      <BookSearchQueryForm
        baseId={baseId}
        formLabel="도서 결과 재검색"
        isSubmitDisabled={isSubmitDisabled}
        onQueryTextChange={setQueryText}
        onSubmit={handleSubmit}
        queryText={queryText}
        searchMode={searchMode}
      />
    </section>
  );
}

export {BookSearchResultSearchBar};
export type {BookSearchResultSearchBarProps};
