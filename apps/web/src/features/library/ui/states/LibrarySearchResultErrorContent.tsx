import {useFindLibraryStore} from '@/features/find-library';
import {getServerErrorDisplayMessage} from '@/shared/request';
import {Button, Heading, Text} from '@/shared/ui';

type LibrarySearchResultErrorContentProps = {
  error: Error;
  onRetry: () => void;
};

function LibrarySearchResultErrorContent({error, onRetry}: LibrarySearchResultErrorContentProps) {
  const closeLibraryResultDialog = useFindLibraryStore(state => state.closeLibraryResultDialog);

  return (
    <section className="flex h-full flex-col items-center justify-center gap-3 px-6 py-10 sm:px-10">
      <Heading as="h2" size="lg">
        검색 결과를 불러오지 못했어요
      </Heading>
      <Text className="text-center" size="sm">
        {getServerErrorDisplayMessage(error)}
      </Text>
      <div className="flex gap-3 pt-2">
        <Button onClick={onRetry} size="sm" type="button" className="rounded-lg">
          다시 시도
        </Button>
        <Button onClick={closeLibraryResultDialog} size="sm" type="button" variant="secondary" className="rounded-lg">
          닫기
        </Button>
      </div>
    </section>
  );
}

export {LibrarySearchResultErrorContent};
export type {LibrarySearchResultErrorContentProps};
