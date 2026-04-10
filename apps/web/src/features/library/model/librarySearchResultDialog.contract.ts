import type {LibraryCode} from '@nearby-library-search/contracts';
import type {LibrarySearchParams} from '@/entities/library';
import type {BookSelectionActionPayload} from '@/features/book';

type LibrarySearchResultDialogProps = {
  onBackToRegionSelect: () => void;
  onChangePage: (page: number) => void;
  onCheckAvailability: () => void;
  onOpenChange: (open: boolean) => void;
  onSelectLibrary: (code: LibraryCode) => void;
  open: boolean;
  params: LibrarySearchParams | null;
  selectedBook: BookSelectionActionPayload | null;
  selectedLibraryCode: LibraryCode | null;
};

export type {LibrarySearchResultDialogProps};
