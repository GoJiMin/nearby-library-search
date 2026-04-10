import {isEmptyLibrarySearchResult, useGetSearchLibraries} from '@/entities/library';
import type {LibrarySearchResultDialogProps} from '../model/librarySearchResultDialog.contract';
import {LibrarySearchResultDetailPlaceholder} from './panels/LibrarySearchResultDetailPanel';
import {LibrarySearchResultListPanel, LibrarySearchResultListPlaceholderBody} from './panels/LibrarySearchResultListPanel';
import {LibrarySearchResultMapPanel, LibrarySearchResultMapPlaceholderBody} from './panels/LibrarySearchResultMapPanel';
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
    <div className="grid h-full min-h-0 grid-cols-1 md:grid-cols-[304px_minmax(0,1fr)]">
      <LibrarySearchResultListPanel summary={`총 ${response.totalCount}개의 도서관을 검색했어요.`}>
        <LibrarySearchResultListPlaceholderBody itemCount={Math.max(1, Math.min(response.items.length, 5))} />
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

export {LibrarySearchResultContent};
export type {LibrarySearchResultContentProps};
