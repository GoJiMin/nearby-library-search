import type {BookSearchItem} from '@/entities/book';
import {BookSearchResultCard} from './BookSearchResultCard';

type BookSearchResultListProps = {
  items: BookSearchItem[];
};

function BookSearchResultList({items}: BookSearchResultListProps) {
  return (
    <ul aria-label="도서 검색 결과 목록" className="grid gap-4">
      {items.map(item => (
        <li key={item.isbn13}>
          <BookSearchResultCard item={item} />
        </li>
      ))}
    </ul>
  );
}

export {BookSearchResultList};
export type {BookSearchResultListProps};
