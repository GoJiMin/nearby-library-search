import {useShallow} from 'zustand/react/shallow';
import {useBookDetailDialogStore} from '../../model/useBookDetailDialogStore';
import {Dialog} from '@/shared/ui';
import {BookDetailDialogShell} from './BookDetailDialogShell';

function BookDetailDialog() {
  const {closeBookDetailDialog, open} = useBookDetailDialogStore(
    useShallow(state => ({
      closeBookDetailDialog: state.closeBookDetailDialog,
      open: state.selectedBookDetail != null,
    })),
  );

  return (
    <Dialog
      open={open}
      onOpenChange={nextOpen => {
        if (!nextOpen) {
          closeBookDetailDialog();
        }
      }}
    >
      {open && <BookDetailDialogShell />}
    </Dialog>
  );
}

export {BookDetailDialog};
