import {LibrarySearchResultMapPlaceholderBody} from '../../map/ui/LibrarySearchResultMapFallback';
import {LibrarySearchResultDetailPlaceholder} from '../panels/loading/LibrarySearchResultDetailPlaceholder';
import {LibrarySearchResultListPlaceholderBody} from '../panels/loading/LibrarySearchResultListPlaceholderBody';
import {LibrarySearchResultListPanel} from '../panels/LibrarySearchResultListPanel';
import {LibrarySearchResultMapPanel} from '../panels/LibrarySearchResultMapPanel';

function LibrarySearchResultLoadingContent() {
  return (
    <div className="grid h-full min-h-0 grid-cols-1 md:grid-cols-[334px_minmax(0,1fr)]">
      <LibrarySearchResultListPanel summary="도서관 검색 결과를 불러오고 있어요.">
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
