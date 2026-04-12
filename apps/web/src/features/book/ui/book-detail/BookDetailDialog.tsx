import {Suspense} from 'react';
import {useShallow} from 'zustand/react/shallow';
import {useBookDetailDialogStore} from '../../model/useBookDetailDialogStore';
import {Dialog} from '@/shared/ui';
import {BookDetailDialogLoadingContent} from './BookDetailDialogLoadingContent';
import {BookDetailDialogResolvedContent} from './BookDetailDialogResolvedContent';

function BookDetailDialog() {
  const {closeBookDetailDialog, selectedBookDetail} = useBookDetailDialogStore(
    useShallow(state => ({
      closeBookDetailDialog: state.closeBookDetailDialog,
      selectedBookDetail: state.selectedBookDetail,
    })),
  );
  const open = selectedBookDetail != null;

  return (
    <Dialog
      open={open}
      onOpenChange={nextOpen => {
        if (!nextOpen) {
          closeBookDetailDialog();
        }
      }}
    >
      {selectedBookDetail != null && (
        <Suspense fallback={<BookDetailDialogLoadingContent />}>
          <BookDetailDialogResolvedContent isbn13={selectedBookDetail.isbn13} />
        </Suspense>
      )}
    </Dialog>
  );
}

export {BookDetailDialog};
