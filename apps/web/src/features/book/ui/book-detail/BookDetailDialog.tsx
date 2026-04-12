import {useShallow} from 'zustand/react/shallow';
import {useBookDetailDialogStore} from '../../model/useBookDetailDialogStore';
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from '@/shared/ui';

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
      {open && (
        <DialogContent aria-describedby={undefined} className="max-w-lg">
          <DialogHeader>
            <DialogTitle>도서 상세 정보</DialogTitle>
            <DialogDescription>도서 상세 정보를 불러올 준비 중이에요.</DialogDescription>
          </DialogHeader>
        </DialogContent>
      )}
    </Dialog>
  );
}

export {BookDetailDialog};
