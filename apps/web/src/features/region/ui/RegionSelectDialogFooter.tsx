import {Button, DialogFooter, Text} from '@/shared/ui';

type RegionSelectDialogFooterProps = {
  isConfirmDisabled: boolean;
  isResetDisabled: boolean;
  onConfirm: () => void;
  onReset: () => void;
  selectionSummaryText: string;
};

function RegionSelectDialogFooter({
  isConfirmDisabled,
  isResetDisabled,
  onConfirm,
  onReset,
  selectionSummaryText,
}: RegionSelectDialogFooterProps) {
  return (
    <DialogFooter className="border-line mt-4 flex flex-col items-start gap-4 border-t px-4 pt-5 pb-4 sm:flex-row sm:items-center sm:justify-between sm:pb-0">
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <Text className="text-text-muted">현재 선택 : </Text>
        <Text className="min-w-0 text-sm font-semibold">{selectionSummaryText}</Text>
      </div>
      <div className="flex w-full items-center justify-end gap-3 sm:w-auto">
        <Button className="rounded-full px-5" disabled={isResetDisabled} size="sm" variant="secondary" onClick={onReset}>
          초기화
        </Button>
        <Button className="rounded-full px-6" disabled={isConfirmDisabled} size="sm" onClick={onConfirm}>
          선택 완료
        </Button>
      </div>
    </DialogFooter>
  );
}

export {RegionSelectDialogFooter};
export type {RegionSelectDialogFooterProps};
