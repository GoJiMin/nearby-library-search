import type {LibrarySearchResultDialogProps} from '../../model/librarySearchResultDialog.contract';
import {LibrarySearchResultMapPlaceholderBody} from '../../map/ui/LibrarySearchResultMapFallback';
import {LibrarySearchResultDetailPlaceholder} from '../panels/LibrarySearchResultDetailPanel';
import {LibrarySearchResultListPanel, LibrarySearchResultListPlaceholderBody} from '../panels/LibrarySearchResultListPanel';
import {LibrarySearchResultMapPanel} from '../panels/LibrarySearchResultMapPanel';

function LibrarySearchResultLoadingContent({
  onCheckAvailability,
}: Pick<LibrarySearchResultDialogProps, 'onCheckAvailability'>) {
  return (
    <div className="grid h-full min-h-0 grid-cols-1 md:grid-cols-[304px_minmax(0,1fr)]">
      <LibrarySearchResultListPanel summary="도서관 검색 결과를 불러오고 있어요.">
        <LibrarySearchResultListPlaceholderBody />
      </LibrarySearchResultListPanel>
      <div className="grid min-h-0 grid-rows-[minmax(0,1fr)_220px]">
        <LibrarySearchResultMapPanel>
          <LibrarySearchResultMapPlaceholderBody />
        </LibrarySearchResultMapPanel>
        <LibrarySearchResultDetailPlaceholder onCheckAvailability={onCheckAvailability} />
      </div>
    </div>
  );
}

export {LibrarySearchResultLoadingContent};
