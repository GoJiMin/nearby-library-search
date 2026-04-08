import {type SyntheticEvent, useId} from 'react';
import type {BookSearchParams} from '@/entities/book';
import type {BookSearchMode} from '../../model/bookSearchStart.contract';
import {createBookSearchStartParams} from '../../model/createBookSearchStartParams';
import {useBookSearchStart} from '../../model/useBookSearchStart';
import {BookSearchModeTabs} from '../search-controls/BookSearchModeTabs';
import {BookSearchQueryForm} from '../search-controls/BookSearchQueryForm';

type BookSearchResultSearchBarProps = {
  params: BookSearchParams;
  onSubmitSearch: (params: BookSearchParams) => void;
};

function BookSearchResultSearchBar({params, onSubmitSearch}: BookSearchResultSearchBarProps) {
  const baseId = useId();
  const initialSearchMode: BookSearchMode = params.title ? 'title' : 'author';
  const initialQueryText = params.title ?? params.author ?? '';
  const {canSubmit, normalizedQuery, queryText, searchMode, setQueryText, setSearchMode} =
    useBookSearchStart({
      initialQueryText,
      initialSearchMode,
    });

  function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    onSubmitSearch(createBookSearchStartParams({normalizedQuery, searchMode}));
  }

  return (
    <section aria-label="도서 결과 재검색" className="flex w-full flex-col items-center gap-4">
      <BookSearchModeTabs baseId={baseId} onChangeSearchMode={setSearchMode} searchMode={searchMode} />
      <BookSearchQueryForm
        baseId={baseId}
        canSubmit={canSubmit}
        formLabel="도서 결과 재검색"
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
