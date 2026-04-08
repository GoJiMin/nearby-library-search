import {Link, Navigate, useSearchParams} from 'react-router-dom';
import {BookSearchResultScreen, readBookSearchResultUrlState} from '@/features/book';
import {Button, Card, Heading, Text} from '@/shared/ui';

function BookSearchResultPage() {
  const [searchParams] = useSearchParams();
  const urlStateResult = readBookSearchResultUrlState(searchParams);

  if (urlStateResult.kind === 'empty') {
    return <Navigate replace to="/" />;
  }

  if (urlStateResult.kind === 'recoverable') {
    return (
      <section className="flex w-full flex-1 items-center justify-center px-4 py-12 sm:px-6">
        <Card className="w-full max-w-2xl px-6 py-8 text-left sm:px-8">
          <div className="space-y-4">
            <Heading as="h1" size="xl">
              검색 결과를 불러올 수 없어요
            </Heading>
            <Text>{urlStateResult.message}</Text>
            <Button asChild className="mt-2">
              <Link to="/">검색 다시 시작</Link>
            </Button>
          </div>
        </Card>
      </section>
    );
  }

  return <BookSearchResultScreen params={urlStateResult.data.params} />;
}

export {BookSearchResultPage};
