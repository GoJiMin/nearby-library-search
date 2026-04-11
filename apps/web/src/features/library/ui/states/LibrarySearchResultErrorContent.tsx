import {useFindLibraryStore} from '@/features/find-library';
import {getServerErrorDisplayMessage} from '@/shared/request';
import {Button, Card, Heading, Text} from '@/shared/ui';

type LibrarySearchResultErrorContentProps = {
  error: Error;
  onRetry: () => void;
};

function LibrarySearchResultErrorContent({error, onRetry}: LibrarySearchResultErrorContentProps) {
  const closeLibraryResultDialog = useFindLibraryStore(state => state.closeLibraryResultDialog);

  return (
    <section className="flex h-full items-center justify-center px-6 py-10 sm:px-10">
      <Card className="w-full max-w-2xl px-6 py-8 text-left sm:px-8 sm:py-10">
        <div className="space-y-4">
          <Heading as="h2" size="lg">
            도서관 검색 결과를 불러오지 못했어요
          </Heading>
          <Text size="sm">
            {getServerErrorDisplayMessage(error)}
          </Text>
          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Button onClick={onRetry} size="sm" type="button">
              다시 시도
            </Button>
            <Button onClick={closeLibraryResultDialog} size="sm" type="button" variant="secondary">
              닫기
            </Button>
          </div>
        </div>
      </Card>
    </section>
  );
}

export {LibrarySearchResultErrorContent};
export type {LibrarySearchResultErrorContentProps};
