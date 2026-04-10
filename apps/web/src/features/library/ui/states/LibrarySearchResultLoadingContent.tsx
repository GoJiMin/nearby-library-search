import type {LibrarySearchResultDialogProps} from '../../model/librarySearchResultDialog.contract';
import {LibrarySearchResultDesktopShell} from '../LibrarySearchResultDesktopShell';
import {LibrarySearchResultDetailPlaceholder} from '../LibrarySearchResultDetailPanel';
import {LibrarySearchResultListPanel, LibrarySearchResultListPlaceholderBody} from '../LibrarySearchResultListPanel';
import {LibrarySearchResultMapPanel, LibrarySearchResultMapPlaceholderBody} from '../LibrarySearchResultMapPanel';

function LibrarySearchResultLoadingContent({
  onCheckAvailability,
}: Pick<LibrarySearchResultDialogProps, 'onCheckAvailability'>) {
  return (
    <LibrarySearchResultDesktopShell
      detailPanel={<LibrarySearchResultDetailPlaceholder onCheckAvailability={onCheckAvailability} />}
      listPanel={
        <LibrarySearchResultListPanel summary="도서관 검색 결과를 불러오고 있어요.">
          <LibrarySearchResultListPlaceholderBody />
        </LibrarySearchResultListPanel>
      }
      mapPanel={
        <LibrarySearchResultMapPanel>
          <LibrarySearchResultMapPlaceholderBody />
        </LibrarySearchResultMapPanel>
      }
    />
  );
}

export {LibrarySearchResultLoadingContent};
