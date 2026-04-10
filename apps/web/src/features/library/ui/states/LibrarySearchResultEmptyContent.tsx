import {Button, Card, Heading, Text} from '@/shared/ui';

type LibrarySearchResultEmptyContentProps = {
  onBackToRegionSelect: () => void;
  onClose: () => void;
};

function LibrarySearchResultEmptyContent({
  onBackToRegionSelect,
  onClose,
}: LibrarySearchResultEmptyContentProps) {
  return (
    <section className="flex h-full items-center justify-center px-6 py-10 sm:px-10">
      <Card className="w-full max-w-2xl px-6 py-8 text-left sm:px-8 sm:py-10">
        <div className="space-y-4">
          <Heading as="h2" size="lg">
            선택한 지역에서 소장 도서관을 찾지 못했어요
          </Heading>
          <Text size="sm">
            같은 책이라도 지역에 따라 검색 결과가 다를 수 있어요. 지역을 다시 선택하거나 도서 검색
            화면으로 돌아가 다시 시도해 보세요.
          </Text>
          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Button onClick={onBackToRegionSelect} size="sm" type="button">
              지역 다시 선택
            </Button>
            <Button onClick={onClose} size="sm" type="button" variant="secondary">
              다른 책 다시 선택
            </Button>
          </div>
        </div>
      </Card>
    </section>
  );
}

export {LibrarySearchResultEmptyContent};
export type {LibrarySearchResultEmptyContentProps};
