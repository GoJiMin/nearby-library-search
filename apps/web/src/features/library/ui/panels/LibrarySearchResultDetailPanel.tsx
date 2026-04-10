import {CalendarX2, Clock3, MapPin, Phone, Search} from 'lucide-react';
import type {ReactNode} from 'react';
import {Button, LucideIcon, Skeleton} from '@/shared/ui';
import type {LibrarySearchResultDialogProps} from '../../model/librarySearchResultDialog.contract';

const detailPlaceholderItems = [
  {icon: Clock3, label: '운영 시간', valueClassName: 'w-40'},
  {icon: MapPin, label: '주소', valueClassName: 'w-44'},
  {icon: CalendarX2, label: '휴관일', valueClassName: 'w-36'},
  {icon: Phone, label: '전화번호', valueClassName: 'w-28'},
] as const;

type LibrarySearchResultDetailPanelProps = {
  children: ReactNode;
  footer?: ReactNode;
};

function LibrarySearchResultDetailPanel({children, footer}: LibrarySearchResultDetailPanelProps) {
  return (
    <section
      aria-label="선택된 도서관 정보 패널"
      className="bg-surface border-line/40 flex min-h-0 flex-col border-t px-6 py-5"
    >
      <div className="flex min-h-0 flex-1 flex-col justify-between gap-6">
        <div>{children}</div>
        {footer}
      </div>
    </section>
  );
}

function LibrarySearchResultDetailPlaceholder({
  onCheckAvailability,
}: Pick<LibrarySearchResultDialogProps, 'onCheckAvailability'>) {
  return (
    <LibrarySearchResultDetailPanel
      footer={
        <Button className="w-full rounded-2xl" onClick={onCheckAvailability} size="lg" variant="default">
          <LucideIcon className="h-4 w-4" icon={Search} strokeWidth={2.2} />
          대출 가능 여부 조회
        </Button>
      }
    >
      <div className="space-y-4">
        <Skeleton className="h-8 w-36 rounded-full" />
        <div className="grid gap-x-8 gap-y-4 md:grid-cols-2">
          {detailPlaceholderItems.map(item => (
            <div className="flex items-start gap-3" key={item.label}>
              <span className="bg-accent-soft text-accent inline-flex h-8 w-8 items-center justify-center rounded-full">
                <LucideIcon className="h-4 w-4" icon={item.icon} strokeWidth={2.1} />
              </span>
              <div className="min-w-0 flex-1 space-y-1.5">
                <p className="text-text-muted text-xs leading-none font-semibold tracking-[0.16em] uppercase">
                  {item.label}
                </p>
                <Skeleton className={`h-4 rounded-full ${item.valueClassName}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </LibrarySearchResultDetailPanel>
  );
}

export {LibrarySearchResultDetailPanel, LibrarySearchResultDetailPlaceholder};
export type {LibrarySearchResultDetailPanelProps};
