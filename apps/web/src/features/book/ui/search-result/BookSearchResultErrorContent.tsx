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
        <div className="bg-surface-muted text-text-muted inline-flex h-20 w-20 items-center justify-center rounded-full">
          <LucideIcon className="h-9 w-9" icon={SearchX} />
        </div>
        <div className="flex max-w-md flex-col gap-2">
          <Heading as="h1" className="text-center" size="md">
            데이터를 불러오는 중 오류가 발생했습니다
          </Heading>
          <Text className="text-center" size="sm">
            조용한 서고에서 길을 잃은 것 같습니다.
          </Text>
          <Text className="text-center" size="sm">
            {message}
          </Text>
        </div>
        <Button onClick={onRetry} size="sm" type="button">
          다시 시도
        </Button>
      </div>
    </Card>
  );
}

export {BookSearchResultErrorContent};
export type {BookSearchResultErrorContentProps};
