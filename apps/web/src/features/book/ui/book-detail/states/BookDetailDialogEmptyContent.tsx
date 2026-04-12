import {useBookDetailDialogStore} from '../../../model/useBookDetailDialogStore';
import {Button, Heading, Text} from '@/shared/ui';

function BookDetailDialogEmptyContent() {
  const closeBookDetailDialog = useBookDetailDialogStore(state => state.closeBookDetailDialog);

  return (
    <section className="flex h-full flex-col items-center justify-center gap-3 px-6 py-10 text-center sm:px-10">
      <Heading as="h2" size="lg">
        도서 상세 정보를 찾지 못했어요.
      </Heading>
      <div>
        <Text size="sm">선택한 책의 상세 정보가 제공되지 않을 수 있어요.</Text>
        <Text size="sm">창을 닫고 다른 도서를 선택해 다시 확인해주세요.</Text>
      </div>
      <Button className="mt-2 rounded-lg" onClick={closeBookDetailDialog} size="sm" type="button" variant="secondary">
        다른 도서 보기
      </Button>
    </section>
  );
}

export {BookDetailDialogEmptyContent};
