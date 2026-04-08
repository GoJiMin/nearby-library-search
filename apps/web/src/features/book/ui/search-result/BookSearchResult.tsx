import {Suspense} from 'react';
import type {BookSearchParams} from '@/entities/book';
import type {BookDetailActionPayload, BookSelectionActionPayload} from '../../model/bookSearchResult.contract';
import {Text} from '@/shared/ui';
import {BookSearchResultActionContext} from './bookSearchResultActionContext';
import {BookSearchResultContent} from './BookSearchResultContent';
import {BookSearchResultSearchBar} from './BookSearchResultSearchBar';

type BookSearchResultProps = {
  onOpenBookDetail?: (payload: BookDetailActionPayload) => void;
  onSelectBook?: (payload: BookSelectionActionPayload) => void;
  onSubmitSearch: (params: BookSearchParams) => void;
  params: BookSearchParams;
};

function BookSearchResult({params, onOpenBookDetail, onSelectBook, onSubmitSearch}: BookSearchResultProps) {
  const searchBarKey = `${params.title ? 'title' : 'author'}:${params.title ?? params.author ?? ''}`;

  return (
    <section aria-label="도서 검색 결과 화면" className="flex w-full flex-1 justify-center px-4 py-12 sm:px-6">
      <div className="flex w-full max-w-5xl flex-col items-center gap-6">
        <BookSearchResultSearchBar
          key={searchBarKey}
          onSubmitSearch={onSubmitSearch}
          params={params}
        />
        <BookSearchResultActionContext.Provider
          value={{
            onOpenBookDetail,
            onSelectBook,
          }}
        >
          <Suspense
            fallback={
              <Text className="w-full px-2" role="status" size="sm">
                도서를 찾고 있습니다.
              </Text>
            }
          >
            <BookSearchResultContent params={params} />
          </Suspense>
        </BookSearchResultActionContext.Provider>
      </div>
    </section>
  );
}

export {BookSearchResult};
export type {BookSearchResultProps};
