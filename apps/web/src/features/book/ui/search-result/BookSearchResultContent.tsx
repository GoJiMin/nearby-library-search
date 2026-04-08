import {useGetSearchBooks, type BookSearchParams} from '@/entities/book';
import {Heading} from '@/shared/ui';
import {BookSearchResultList} from './BookSearchResultList';

type BookSearchResultContentProps = {
  params: BookSearchParams;
};

function BookSearchResultContent({params}: BookSearchResultContentProps) {
  const {items, totalCount} = useGetSearchBooks(params);
  const queryText = params.title ?? params.author ?? '';

  return (
    <div className="flex w-full flex-col gap-5">
      <Heading as="h1" size="lg">
        <span className="text-accent">{queryText}</span>에 대한 {totalCount}개의 검색 결과가 있습니다.
      </Heading>
      <BookSearchResultList items={items} />
    </div>
  );
}

export {BookSearchResultContent};
export type {BookSearchResultContentProps};
