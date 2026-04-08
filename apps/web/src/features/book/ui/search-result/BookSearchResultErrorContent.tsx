import {Button, Card, Heading, Text} from '@/shared/ui';

type BookSearchResultErrorContentProps = {
  onRetry: () => void;
  queryText: string;
};

function BookSearchResultErrorContent({onRetry, queryText}: BookSearchResultErrorContentProps) {
  return (
    <div className="flex w-full flex-col gap-5">
      <Heading as="h1" size="lg">
        <span className="text-accent">{queryText}</span> 검색 결과를 불러오지 못했어요.
      </Heading>
      <Card className="border-line w-full rounded-3xl border px-5 py-5 shadow-[0_12px_32px_-8px_rgba(15,23,42,0.08)]">
        <div className="flex flex-col gap-4">
          <Text size="sm">잠시 후 다시 시도하거나 검색어를 수정해보세요.</Text>
          <div>
            <Button onClick={onRetry} size="sm" type="button">
              다시 시도
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export {BookSearchResultErrorContent};
export type {BookSearchResultErrorContentProps};
