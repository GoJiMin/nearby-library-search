import {SearchX} from 'lucide-react';
import {getServerErrorDisplayMessage} from '@/shared/request';
import {Button, Card, Heading, LucideIcon, Text} from '@/shared/ui';

type BookSearchResultErrorContentProps = {
  error: Error;
  onRetry: () => void;
};

function BookSearchResultErrorContent({error, onRetry}: BookSearchResultErrorContentProps) {
  const message = getServerErrorDisplayMessage(error);

  return (
    <Card className="w-full px-6 py-10 sm:min-h-96 sm:px-10 sm:py-14">
      <div className="flex flex-col items-center justify-center gap-6 text-center sm:min-h-80">
        <div className="text-text-muted inline-flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 md:h-20 md:w-20">
          <LucideIcon className="h-10 w-10 md:h-12 md:w-12" icon={SearchX} />
        </div>
        <div className="flex max-w-md flex-col gap-3">
          <Heading as="h1" className="text-center" size="md">
            데이터를 불러오지 못했어요
          </Heading>
          <Text className="text-center" size="sm">
            {message}
          </Text>
        </div>
        <Button onClick={onRetry} size="sm" type="button" className="rounded-xl">
          다시 시도
        </Button>
      </div>
    </Card>
  );
}

export {BookSearchResultErrorContent};
export type {BookSearchResultErrorContentProps};
