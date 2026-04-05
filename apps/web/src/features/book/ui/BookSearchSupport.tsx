import {Button, Text} from '@/shared/ui';
import {BOOK_SEARCH_MODE_CONFIG, type BookSearchMode} from '../model/useBookSearchStart';

const BOOK_SEARCH_SUPPORT_COPY =
  '책 제목이나 저자명으로 검색을 시작하면, 원하는 책을 고른 뒤 가까운 도서관을 바로 찾을 수 있어요.';

type BookSearchSupportProps = {
  onSelectExampleQuery: (queryText: string) => void;
  searchMode: BookSearchMode;
};

function BookSearchSupport({onSelectExampleQuery, searchMode}: BookSearchSupportProps) {
  const {exampleQueries} = BOOK_SEARCH_MODE_CONFIG[searchMode];

  return (
    <div className="space-y-3">
      <Text size="sm">{BOOK_SEARCH_SUPPORT_COPY}</Text>
      <div className="flex flex-wrap gap-2">
        {exampleQueries.map(exampleQuery => (
          <Button key={exampleQuery} onClick={() => onSelectExampleQuery(exampleQuery)} size="sm" type="button" variant="secondary">
            {exampleQuery}
          </Button>
        ))}
      </div>
    </div>
  );
}

export {BookSearchSupport};
export type {BookSearchSupportProps};
