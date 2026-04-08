import type {BookSearchItem} from '@/entities/book';
import type {BookDetailActionPayload, BookSelectionActionPayload} from '../../model/bookSearchResult.contract';
import {BookSearchResultCard} from './BookSearchResultCard';

type BookSearchResultListProps = {
  items: BookSearchItem[];
  onOpenBookDetail?: (payload: BookDetailActionPayload) => void;
  onSelectBook?: (payload: BookSelectionActionPayload) => void;
};

function BookSearchResultList({items, onOpenBookDetail, onSelectBook}: BookSearchResultListProps) {
  return (
    <ul aria-label="도서 검색 결과 목록" className="grid gap-4">
      {items.map(item => (
        <li key={item.isbn13}>
          <BookSearchResultCard
            item={item}
            onOpenBookDetail={onOpenBookDetail}
            onSelectBook={onSelectBook}
          />
        </li>
      ))}
    </ul>
  );
}

export {BookSearchResultList};
export type {BookSearchResultListProps};
