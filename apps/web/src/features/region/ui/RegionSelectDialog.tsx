import type {LibrarySearchParams} from '@/entities/library';
import type {BookSelectionActionPayload} from '@/features/book';
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, Text} from '@/shared/ui';
import type {RegionSelectionState} from '../model/regionSelectDialog.contract';

type RegionSelectDialogProps = {
  lastSelection?: RegionSelectionState | null;
  onConfirm: (params: LibrarySearchParams) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  selectedBook: BookSelectionActionPayload | null;
};

function RegionSelectDialog({
  lastSelection,
  onOpenChange,
  open,
  selectedBook,
}: RegionSelectDialogProps) {
  const regionDialogDescription = lastSelection
    ? '이전에 확정한 지역 선택 상태를 다음 단계에서 다시 복원할 예정이에요.'
    : '선택한 책을 기준으로 지역을 고르는 단계를 연결하는 중이에요.';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader className="gap-3">
          <DialogTitle>검색 지역 선택</DialogTitle>
          <DialogDescription>{regionDialogDescription}</DialogDescription>
        </DialogHeader>
        <div className="bg-surface-muted rounded-panel flex min-h-32 items-center justify-center px-6 py-8 text-center">
          <Text className="text-text-muted">
            {selectedBook ? `"${selectedBook.title}" 소장 도서관을 찾기 위한 지역 선택 단계를 준비하고 있어요.` : null}
          </Text>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export {RegionSelectDialog};
export type {RegionSelectDialogProps};
