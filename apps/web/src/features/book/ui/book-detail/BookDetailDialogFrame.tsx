import type {ReactNode} from 'react';
import {X} from 'lucide-react';
import {DialogClose, DialogContent, DialogHeader, DialogTitle, LucideIcon} from '@/shared/ui';

type BookDetailDialogFrameProps = {
  bodyAriaLabel?: string;
  bodyRole?: 'status';
  children: ReactNode;
  cover: ReactNode;
};

function BookDetailDialogFrame({bodyAriaLabel, bodyRole, children, cover}: BookDetailDialogFrameProps) {
  return (
    <DialogContent
      aria-describedby={undefined}
      className="h-[min(calc(100vh-32px),760px)] w-[min(calc(100vw-32px),980px)] gap-0 overflow-hidden p-0 sm:p-0"
      showCloseButton={false}
    >
      <DialogHeader className="sr-only">
        <DialogTitle>도서 상세 정보</DialogTitle>
      </DialogHeader>
      <DialogClose asChild>
        <button
          aria-label="닫기"
          className="shadow-card bg-surface-strong text-text-muted hover:text-text focus-visible:ring-accent-soft absolute top-4 right-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full transition-colors focus-visible:ring-4 focus-visible:outline-none"
          type="button"
        >
          <LucideIcon icon={X} strokeWidth={2.2} />
        </button>
      </DialogClose>
      <div className="grid h-full min-h-0 grid-cols-1 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
        <aside className="border-line bg-surface-muted/35 flex items-center justify-center border-b px-6 py-8 lg:border-r lg:border-b-0 lg:px-8 lg:py-10">
          {cover}
        </aside>
        <div className="min-h-0 overflow-y-auto">
          <div
            aria-label={bodyAriaLabel}
            aria-live={bodyRole === 'status' ? 'polite' : undefined}
            className="flex min-h-full flex-col px-6 py-8 sm:px-8 sm:py-10"
            role={bodyRole}
          >
            {children}
          </div>
        </div>
      </div>
    </DialogContent>
  );
}

export {BookDetailDialogFrame};
