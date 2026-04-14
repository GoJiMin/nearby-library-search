import {useBookDetailDialogStore} from '../../../model/useBookDetailDialogStore';
import {getServerErrorDisplayMessage} from '@/shared/request';
import {Button, Heading, Text} from '@/shared/ui';

type BookDetailDialogErrorContentProps = {
  error: Error;
  onRetry: () => void;
};

function BookDetailDialogErrorContent({error, onRetry}: BookDetailDialogErrorContentProps) {
  const closeBookDetailDialog = useBookDetailDialogStore(state => state.closeBookDetailDialog);

  return (
    <section className="flex h-full flex-col items-center justify-center gap-3 px-6 py-10 sm:px-10">
      <Heading as="h2" size="lg">
        도서 상세 정보를 불러오지 못했어요
      </Heading>
      <Text className="text-center" size="sm">
        {getServerErrorDisplayMessage(error)}
      </Text>
      <div className="flex gap-3 pt-2">
        <Button className="rounded-lg" onClick={onRetry} size="sm" type="button">
          다시 시도
        </Button>
        <Button
          className="rounded-lg"
          onClick={closeBookDetailDialog}
          size="sm"
          type="button"
          variant="secondary"
        >
          닫기
        </Button>
      </div>
    </section>
  );
}

export {BookDetailDialogErrorContent};
export type {BookDetailDialogErrorContentProps};
