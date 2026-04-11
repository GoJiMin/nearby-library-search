import {LibrarySearchResultMapPlaceholderBody} from '../../map/ui/LibrarySearchResultMapFallback';
import {LibrarySearchResultSidebar} from '../LibrarySearchResultSidebar';
import {LibrarySearchResultDetailsPlaceholder} from '../loading/LibrarySearchResultDetailsPlaceholder';
import {LibrarySearchResultListPlaceholder} from '../loading/LibrarySearchResultListPlaceholder';

function LibrarySearchResultLoadingContent() {
  return (
    <div className="grid h-full min-h-0 grid-cols-1 md:grid-cols-[334px_minmax(0,1fr)]">
      <LibrarySearchResultSidebar>
        <LibrarySearchResultListPlaceholder />
      </LibrarySearchResultSidebar>
      <div className="grid min-h-0 grid-rows-[minmax(0,1fr)_250px]">
        <section aria-label="도서관 지도 패널" className="bg-surface-muted relative min-h-90 overflow-hidden">
          <LibrarySearchResultMapPlaceholderBody />
        </section>
        <LibrarySearchResultDetailsPlaceholder />
      </div>
    </div>
  );
}

export {LibrarySearchResultLoadingContent};
