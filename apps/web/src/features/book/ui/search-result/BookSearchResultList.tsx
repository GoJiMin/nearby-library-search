import type {BookSearchItem} from '@/entities/book';
import {Card, Heading, Text} from '@/shared/ui';

type BookSearchResultListProps = {
  items: BookSearchItem[];
};

function BookSearchResultList({items}: BookSearchResultListProps) {
  return (
    <ul aria-label="도서 검색 결과 목록" className="grid gap-4">
      {items.map(item => (
        <li key={item.isbn13}>
          <Card className="px-6 py-5">
            <div className="space-y-2">
              <Heading as="h2" size="md">
                {item.title}
              </Heading>
              <Text size="sm">{item.author}</Text>
            </div>
          </Card>
        </li>
      ))}
    </ul>
  );
}

export {BookSearchResultList};
export type {BookSearchResultListProps};
