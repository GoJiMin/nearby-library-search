import {LibrarySearchResultMapPlaceholderBody} from '../../map/ui/LibrarySearchResultMapFallback';
import {Heading, Text} from '@/shared/ui';
import {LibrarySearchResultDetailPlaceholder} from '../panels/loading/LibrarySearchResultDetailPlaceholder';
import {LibrarySearchResultListPlaceholderBody} from '../panels/loading/LibrarySearchResultListPlaceholderBody';
import {LibrarySearchResultListPanel} from '../panels/LibrarySearchResultListPanel';
import {LibrarySearchResultMapPanel} from '../panels/LibrarySearchResultMapPanel';

function LibrarySearchResultLoadingContent() {
  return (
    <div className="grid h-full min-h-0 grid-cols-1 md:grid-cols-[334px_minmax(0,1fr)]">
      <LibrarySearchResultListPanel>
        <div className="px-8 pt-8 pb-3">
          <Heading as="h2" className="tracking-[-0.04em]" size="lg">
            검색 결과
          </Heading>
          <Text className="mt-1 text-sm">도서관 검색 결과를 불러오고 있어요.</Text>
        </div>
        <LibrarySearchResultListPlaceholderBody />
      </LibrarySearchResultListPanel>
      <div className="grid min-h-0 grid-rows-[minmax(0,1fr)_250px]">
        <LibrarySearchResultMapPanel>
          <LibrarySearchResultMapPlaceholderBody />
        </LibrarySearchResultMapPanel>
        <LibrarySearchResultDetailPlaceholder />
      </div>
    </div>
  );
}

export {LibrarySearchResultLoadingContent};
