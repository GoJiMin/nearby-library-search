import {useShallow} from 'zustand/react/shallow';
import {useFindLibraryStore} from '@/features/find-library';
import {Button, Heading, Text} from '@/shared/ui';

function LibrarySearchResultEmptyContent() {
  const {backToRegionSelect, closeLibraryResultDialog} = useFindLibraryStore(
    useShallow(state => ({
      backToRegionSelect: state.backToRegionSelect,
      closeLibraryResultDialog: state.closeLibraryResultDialog,
    })),
  );

  return (
    <section className="flex h-full flex-col items-center justify-center gap-3 px-6 py-10 sm:px-10">
      <Heading as="h2" size="lg">
        소장 중인 도서관을 찾지 못했어요.
      </Heading>
      <div className="text-center">
        <Text size="sm">지역에 따라 검색 결과가 다를 수 있어요.</Text>
        <Text size="sm">지역을 다시 선택하거나 다른 도서를 검색해주세요.</Text>
      </div>
      <div className="flex gap-3 pt-2">
        <Button onClick={backToRegionSelect} size="sm" type="button" className="rounded-lg">
          지역 다시 선택
        </Button>
        <Button onClick={closeLibraryResultDialog} size="sm" type="button" variant="secondary" className="rounded-lg">
          다른 책 다시 선택
        </Button>
      </div>
    </section>
  );
}

export {LibrarySearchResultEmptyContent};
