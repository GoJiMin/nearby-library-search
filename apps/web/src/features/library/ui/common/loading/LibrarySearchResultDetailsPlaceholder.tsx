import {Search} from 'lucide-react';
import {Button, LucideIcon, Skeleton} from '@/shared/ui';

const detailPlaceholderItems = [
  {label: '운영 시간', valueClassName: 'w-40'},
  {label: '휴관일', valueClassName: 'w-32'},
  {label: '주소', valueClassName: 'w-44'},
  {label: '전화번호', valueClassName: 'w-28'},
] as const;

type LibrarySearchResultDetailsPlaceholderProps = {
  layout?: 'desktop' | 'mobile';
};

function LibrarySearchResultDetailsFieldsPlaceholder() {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-36 rounded-full" />
        <Skeleton className="h-6 w-6 rounded-full" />
      </div>
      <div className="grid gap-x-8 gap-y-4 md:grid-cols-2">
        {detailPlaceholderItems.map(item => (
          <div className="min-w-0 flex-1 space-y-1.5" key={item.label}>
            <p className="text-text-muted text-xs leading-none font-semibold tracking-[0.16em] uppercase">
              {item.label}
            </p>
            <Skeleton className={`h-4 rounded-full ${item.valueClassName}`} />
          </div>
        ))}
      </div>
    </div>
  );
}

function LibrarySearchResultDetailsPlaceholder({
  layout = 'desktop',
}: LibrarySearchResultDetailsPlaceholderProps) {
  const sectionClassName =
    layout === 'mobile'
      ? 'bg-surface border-line/40 border-b px-6 py-5'
      : 'bg-surface border-line/40 flex min-h-0 flex-col border-t px-6 py-5';
  const bodyClassName =
    layout === 'mobile'
      ? 'flex flex-col gap-6'
      : 'flex min-h-0 flex-1 flex-col justify-between gap-6';

  return (
    <section aria-label="선택된 도서관 정보 패널" className={sectionClassName}>
      <div className={bodyClassName}>
        <LibrarySearchResultDetailsFieldsPlaceholder />
        <Button className="w-full rounded-2xl" disabled size="lg" variant="default">
          <LucideIcon className="h-4 w-4" icon={Search} strokeWidth={2.2} />
          대출 가능 여부 조회
        </Button>
      </div>
    </section>
  );
}

export {LibrarySearchResultDetailsFieldsPlaceholder, LibrarySearchResultDetailsPlaceholder};
export type {LibrarySearchResultDetailsPlaceholderProps};
