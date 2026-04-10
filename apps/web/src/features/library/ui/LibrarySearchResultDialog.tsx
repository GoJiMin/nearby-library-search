import {
  CalendarX2,
  Clock3,
  LocateFixed,
  MapPin,
  Minus,
  Phone,
  Plus,
  Search,
  X,
} from 'lucide-react';
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Heading,
  LucideIcon,
  Skeleton,
  Text,
} from '@/shared/ui';
import type {LibrarySearchResultDialogProps} from '../model/librarySearchResultDialog.contract';

const resultCardSkeletonWidths = [
  {address: 'w-40', meta: 'w-24', title: 'w-28'},
  {address: 'w-36', meta: 'w-20', title: 'w-24'},
  {address: 'w-44', meta: 'w-28', title: 'w-24'},
  {address: 'w-36', meta: 'w-24', title: 'w-32'},
  {address: 'w-40', meta: 'w-20', title: 'w-28'},
] as const;

const detailPlaceholderItems = [
  {icon: Clock3, label: '운영 시간', valueClassName: 'w-40'},
  {icon: MapPin, label: '주소', valueClassName: 'w-44'},
  {icon: CalendarX2, label: '휴관일', valueClassName: 'w-36'},
  {icon: Phone, label: '전화번호', valueClassName: 'w-28'},
] as const;

function LibrarySearchResultListPlaceholder() {
  return (
    <aside
      aria-label="검색 결과 목록 패널"
      className="bg-surface-strong border-line/40 flex min-h-0 flex-col border-r"
    >
      <div className="px-6 pt-6 pb-5">
        <Heading as="h2" className="tracking-[-0.04em]" size="lg">
          검색 결과
        </Heading>
        <Text className="mt-1" size="sm">
          검색된 도서관 결과를 이 영역에 표시합니다.
        </Text>
      </div>
      <ul
        aria-label="도서관 검색 결과 목록"
        className="flex-1 space-y-3 overflow-y-auto px-4 pb-6"
        role="list"
      >
        {resultCardSkeletonWidths.map((widths, index) => (
          <li key={`${widths.title}-${index}`}>
            <div
              className={
                index === 0
                  ? 'bg-surface shadow-card border-line/70 space-y-4 rounded-3xl border px-4 py-4'
                  : 'bg-surface-muted/60 space-y-4 rounded-3xl px-4 py-4'
              }
            >
              <div className="space-y-2.5">
                <Skeleton className={`h-6 rounded-full ${widths.title}`} />
                <Skeleton className={`h-4 rounded-full ${widths.address}`} />
              </div>
              <Skeleton className={`h-3 rounded-full ${widths.meta}`} />
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}

function LibrarySearchResultMapPlaceholder() {
  return (
    <section
      aria-label="도서관 지도 패널"
      className="bg-surface-muted relative min-h-[360px] overflow-hidden"
    >
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.46)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.46)_1px,transparent_1px)] bg-[size:44px_44px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_62%)]" />
      <Skeleton className="absolute top-[28%] left-[42%] h-8 w-8 rounded-full bg-white/75" />
      <Skeleton className="absolute top-[57%] left-[73%] h-8 w-8 rounded-full bg-white/75" />
      <div className="absolute top-1/2 left-[58%] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2">
        <Skeleton className="bg-accent h-12 w-12 rounded-full" />
        <Skeleton className="h-7 w-24 rounded-full bg-white/90" />
      </div>
      <div className="absolute right-6 bottom-6 flex flex-col gap-2.5">
        <LibrarySearchResultMapControl ariaLabel="지도 확대" icon={Plus} />
        <LibrarySearchResultMapControl ariaLabel="지도 축소" icon={Minus} />
        <LibrarySearchResultMapControl ariaLabel="선택 위치로 이동" icon={LocateFixed} />
      </div>
    </section>
  );
}

function LibrarySearchResultMapControl({
  ariaLabel,
  icon,
}: {
  ariaLabel: string;
  icon: typeof Plus;
}) {
  return (
    <button
      aria-label={ariaLabel}
      className="shadow-card bg-surface-strong text-text-muted inline-flex h-11 w-11 items-center justify-center rounded-full"
      type="button"
    >
      <LucideIcon className="h-5 w-5" icon={icon} strokeWidth={2.1} />
    </button>
  );
}

function LibrarySearchResultDetailPlaceholder({
  onCheckAvailability,
}: Pick<LibrarySearchResultDialogProps, 'onCheckAvailability'>) {
  return (
    <section
      aria-label="선택된 도서관 정보 패널"
      className="bg-surface border-line/40 flex min-h-0 flex-col border-t px-6 py-5"
    >
      <div className="flex min-h-0 flex-1 flex-col">
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
        <Button
          className="mt-6 w-full rounded-2xl"
          onClick={onCheckAvailability}
          size="lg"
          variant="default"
        >
          <LucideIcon className="h-4 w-4" icon={Search} strokeWidth={2.2} />
          대출 가능 여부 조회
        </Button>
      </div>
    </section>
  );
}

function LibrarySearchResultDesktopShell({
  onCheckAvailability,
}: Pick<LibrarySearchResultDialogProps, 'onCheckAvailability'>) {
  return (
    <div className="grid h-full min-h-0 grid-cols-1 md:grid-cols-[304px_minmax(0,1fr)]">
      <LibrarySearchResultListPlaceholder />
      <div className="grid min-h-0 grid-rows-[minmax(0,1fr)_220px]">
        <LibrarySearchResultMapPlaceholder />
        <LibrarySearchResultDetailPlaceholder onCheckAvailability={onCheckAvailability} />
      </div>
    </div>
  );
}

function LibrarySearchResultDialog({
  onCheckAvailability,
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
        className="h-[min(calc(100vh-32px),688px)] w-[min(calc(100vw-32px),960px)] gap-0 overflow-hidden p-0 sm:p-0"
        showCloseButton={false}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>도서관 검색 결과</DialogTitle>
        </DialogHeader>
        <DialogClose asChild>
          <button
            aria-label="닫기"
            className="shadow-card bg-surface-strong text-text-muted hover:text-text absolute top-4 right-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full transition-colors focus-visible:ring-4 focus-visible:ring-accent-soft focus-visible:outline-none"
            type="button"
          >
            <LucideIcon icon={X} strokeWidth={2.2} />
          </button>
        </DialogClose>
        <LibrarySearchResultDesktopShell onCheckAvailability={onCheckAvailability} />
      </DialogContent>
    </Dialog>
  );
}

export {LibrarySearchResultDialog};
