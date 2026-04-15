import {LibrarySearchResultMapPlaceholderBody} from '../../../map/ui/LibrarySearchResultMapFallback';
import {LibrarySearchResultDetailsPlaceholder} from '../../common/loading/LibrarySearchResultDetailsPlaceholder';

function LibrarySearchResultRightPanelPlaceholder() {
  return (
    <div className="grid min-h-0 grid-rows-[minmax(0,1fr)_auto]">
      <section aria-label="도서관 지도 패널" className="bg-surface-muted relative min-h-72 overflow-hidden">
        <LibrarySearchResultMapPlaceholderBody />
      </section>
      <LibrarySearchResultDetailsPlaceholder />
    </div>
  );
}

export {LibrarySearchResultRightPanelPlaceholder};
