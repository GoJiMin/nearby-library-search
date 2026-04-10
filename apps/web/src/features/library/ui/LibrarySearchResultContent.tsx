import {isEmptyLibrarySearchResult, useGetSearchLibraries} from '@/entities/library';
import type {LibrarySearchResultDialogProps} from '../model/librarySearchResultDialog.contract';
import {LibrarySearchResultDesktopShell} from './LibrarySearchResultDesktopShell';
import {LibrarySearchResultDetailPlaceholder} from './LibrarySearchResultDetailPanel';
import {LibrarySearchResultListPanel, LibrarySearchResultListPlaceholderBody} from './LibrarySearchResultListPanel';
import {LibrarySearchResultMapPanel, LibrarySearchResultMapPlaceholderBody} from './LibrarySearchResultMapPanel';
import {LibrarySearchResultEmptyContent} from './states/LibrarySearchResultEmptyContent';

type LibrarySearchResultContentProps = Pick<
  LibrarySearchResultDialogProps,
  'onBackToRegionSelect' | 'onCheckAvailability' | 'onOpenChange'
> & {
  params: NonNullable<LibrarySearchResultDialogProps['params']>;
};

function LibrarySearchResultContent({
  onBackToRegionSelect,
  onCheckAvailability,
  onOpenChange,
  params,
}: LibrarySearchResultContentProps) {
  const response = useGetSearchLibraries(params);

  if (isEmptyLibrarySearchResult(response)) {
    return (
      <LibrarySearchResultEmptyContent
        onBackToRegionSelect={onBackToRegionSelect}
        onClose={() => onOpenChange(false)}
      />
    );
  }

  return (
    <LibrarySearchResultDesktopShell
      detailPanel={<LibrarySearchResultDetailPlaceholder onCheckAvailability={onCheckAvailability} />}
      listPanel={
        <LibrarySearchResultListPanel summary={`총 ${response.totalCount}개의 도서관을 검색했어요.`}>
          <LibrarySearchResultListPlaceholderBody itemCount={Math.max(1, Math.min(response.items.length, 5))} />
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

export {LibrarySearchResultContent};
export type {LibrarySearchResultContentProps};
