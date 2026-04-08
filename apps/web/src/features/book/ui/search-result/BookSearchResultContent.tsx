import {useGetSearchBooks, type BookSearchParams} from '@/entities/book';
import type {BookDetailActionPayload, BookSelectionActionPayload} from '../../model/bookSearchResult.contract';
import {Heading} from '@/shared/ui';
import {BookSearchResultList} from './BookSearchResultList';

type BookSearchResultContentProps = {
  onOpenBookDetail?: (payload: BookDetailActionPayload) => void;
  onSelectBook?: (payload: BookSelectionActionPayload) => void;
  params: BookSearchParams;
};

function BookSearchResultContent({params, onOpenBookDetail, onSelectBook}: BookSearchResultContentProps) {
  const {items, totalCount} = useGetSearchBooks(params);
  const queryText = params.title ?? params.author ?? '';

  return (
    <div className="flex w-full flex-col gap-5">
      <Heading as="h1" size="xl">
        {`"${queryText}"에 대한 ${totalCount}개의 검색 결과가 있습니다.`}
      </Heading>
      <BookSearchResultList
        items={items}
        onOpenBookDetail={onOpenBookDetail}
        onSelectBook={onSelectBook}
      />
    </div>
  );
}

export {BookSearchResultContent};
export type {BookSearchResultContentProps};
