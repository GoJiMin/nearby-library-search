import {BookOpen, X} from 'lucide-react';
import {Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, LucideIcon, Card, Text} from '@/shared/ui';
import type {LibrarySearchResultDialogProps} from '../model/librarySearchResultDialog.contract';

function createLibrarySearchSummary(params: NonNullable<LibrarySearchResultDialogProps['params']>) {
  return [
    `ISBN ${params.isbn}`,
    `region ${params.region}`,
    params.detailRegion ? `detailRegion ${params.detailRegion}` : null,
    `page ${params.page}`,
  ]
    .filter(Boolean)
    .join(' / ');
}

function LibrarySearchResultDialog({
  onOpenChange,
  open,
  params,
  selectedBook,
}: LibrarySearchResultDialogProps) {
  if (!open || params == null || selectedBook == null) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        aria-describedby={undefined}
        className="w-[min(calc(100vw-32px),720px)] gap-5 overflow-hidden p-0"
        showCloseButton={false}
      >
        <DialogHeader className="border-line/50 flex-row items-center justify-between border-b px-6 py-5">
          <div className="flex items-center gap-3">
            <LucideIcon className="text-accent h-6 w-6" icon={BookOpen} strokeWidth={2.1} />
            <DialogTitle className="text-xl">도서관 검색 결과</DialogTitle>
          </div>
          <DialogClose asChild>
            <button
              aria-label="닫기"
              className="text-text-muted hover:text-text hover:bg-surface-muted focus-visible:ring-accent-soft inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors focus-visible:ring-4 focus-visible:outline-none"
              type="button"
            >
              <LucideIcon icon={X} strokeWidth={2.2} />
            </button>
          </DialogClose>
        </DialogHeader>
        <div className="space-y-3 px-6 pb-6">
          <Text className="text-sm">
            <span className="font-medium">{selectedBook.title}</span> 도서의 도서관 검색 결과 다이얼로그가
            여기서 열립니다.
          </Text>
          <Card className="bg-surface-muted border-line/50 border px-4 py-4">
            <div className="space-y-2">
              <Text className="text-sm font-medium">현재 검색 조건</Text>
              <Text className="text-text-muted text-sm">{createLibrarySearchSummary(params)}</Text>
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export {LibrarySearchResultDialog};
