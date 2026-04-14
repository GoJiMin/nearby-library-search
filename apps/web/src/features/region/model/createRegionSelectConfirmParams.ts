import {parseSearchLibrariesParams, type LibrarySearchParams} from '@/entities/library';
import type {BookSelectionActionPayload} from '@/features/book-search';
import type {RegionSelectionState} from './regionSelectDialog.contract';

type CreateRegionSelectConfirmParamsArgs = {
  draftSelection: RegionSelectionState;
  selectedBook: BookSelectionActionPayload;
};

function createRegionSelectConfirmParams({
  draftSelection,
  selectedBook,
}: CreateRegionSelectConfirmParamsArgs): LibrarySearchParams {
  return parseSearchLibrariesParams({
    detailRegion: draftSelection.detailRegion,
    isbn: selectedBook.isbn13,
    page: 1,
    region: draftSelection.region,
  });
}

export {createRegionSelectConfirmParams};
export type {CreateRegionSelectConfirmParamsArgs};
