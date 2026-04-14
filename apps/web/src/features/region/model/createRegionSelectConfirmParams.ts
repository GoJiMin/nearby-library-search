import {parseSearchLibrariesParams, type LibrarySearchParams} from '@/entities/library';
import type {BookSelectionActionPayload} from '@/features/book-search';
import type {RegionSelectionState} from './regionSelection.contract';

type CreateRegionSelectConfirmParamsArgs = {
  selection: RegionSelectionState;
  selectedBook: BookSelectionActionPayload;
};

function createRegionSelectConfirmParams({
  selection,
  selectedBook,
}: CreateRegionSelectConfirmParamsArgs): LibrarySearchParams {
  return parseSearchLibrariesParams({
    detailRegion: selection.detailRegion,
    isbn: selectedBook.isbn13,
    page: 1,
    region: selection.region,
  });
}

export {createRegionSelectConfirmParams};
export type {CreateRegionSelectConfirmParamsArgs};
