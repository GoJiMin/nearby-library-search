import {LibrarySearchResultMapPlaceholderBody} from '../../map/ui/LibrarySearchResultMapFallback';
import {Heading, Text} from '@/shared/ui';
import {LibrarySearchResultDetailPlaceholder} from '../panels/loading/LibrarySearchResultDetailPlaceholder';
import {LibrarySearchResultListPlaceholderBody} from '../panels/loading/LibrarySearchResultListPlaceholderBody';

function LibrarySearchResultLoadingContent() {
  return (
    <div className="grid h-full min-h-0 grid-cols-1 md:grid-cols-[334px_minmax(0,1fr)]">
      <aside aria-label="검색 결과 목록 패널" className="bg-surface-strong border-line/40 flex min-h-0 flex-col border-r">
        <div className="px-8 pt-8 pb-3">
          <Heading as="h2" className="tracking-[-0.04em]" size="lg">
            검색 결과
          </Heading>
          <Text className="mt-1 text-sm">도서관 검색 결과를 불러오고 있어요.</Text>
        </div>
        <LibrarySearchResultListPlaceholderBody />
      </aside>
      <div className="grid min-h-0 grid-rows-[minmax(0,1fr)_250px]">
        <section aria-label="도서관 지도 패널" className="bg-surface-muted relative min-h-90 overflow-hidden">
          <LibrarySearchResultMapPlaceholderBody />
        </section>
        <LibrarySearchResultDetailPlaceholder />
      </div>
    </div>
  );
}

export {LibrarySearchResultLoadingContent};
