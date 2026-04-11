import type {LibrarySearchItem} from '@nearby-library-search/contracts';
import {CalendarX2, Clock3, MapPin, Phone, Search, ExternalLink} from 'lucide-react';
import type {ReactNode} from 'react';
import {Button, Heading, LucideIcon, Skeleton, Text} from '@/shared/ui';
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

type LibrarySearchResultDetailBodyProps = {
  library: LibrarySearchItem;
};

type LibrarySearchResultDetailFooterCtaProps = Pick<LibrarySearchResultDialogProps, 'onCheckAvailability'> & {
  disabled?: boolean;
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

const detailFieldItems = [
  {icon: Clock3, key: 'operatingTime', label: '운영 시간'},
  {icon: CalendarX2, key: 'closedDays', label: '휴관일'},
  {icon: MapPin, key: 'address', label: '주소'},
  {icon: Phone, key: 'phone', label: '전화번호'},
] as const satisfies ReadonlyArray<{
  icon: typeof Clock3;
  key: 'address' | 'closedDays' | 'operatingTime' | 'phone';
  label: string;
}>;

function getLibraryDetailValue(library: LibrarySearchItem, key: (typeof detailFieldItems)[number]['key']) {
  switch (key) {
    case 'operatingTime':
      return library.operatingTime ?? '운영 시간 정보 없음';
    case 'closedDays':
      return library.closedDays ?? '휴관일 정보 없음';
    case 'address':
      return library.address ?? '주소 정보 없음';
    case 'phone':
      return library.phone ?? '전화번호 정보 없음';
  }
}

function LibrarySearchResultDetailBody({library}: LibrarySearchResultDetailBodyProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Heading as="h2" size="md">
          {library.name}
        </Heading>
        {library.homepage ? (
          <a href={library.homepage} rel="noreferrer" target="_blank">
            <LucideIcon className="text-text-muted hover:text-accent transition-colors" icon={ExternalLink} size={24} />
          </a>
        ) : null}
      </div>
      <div className="grid gap-x-8 gap-y-4 md:grid-cols-2">
        {detailFieldItems.map(item => (
          <div className="flex items-start gap-3" key={item.label}>
            <div className="min-w-0 flex-1 space-y-1.5">
              <p className="text-text-muted text-xs leading-none font-semibold tracking-[0.16em] uppercase">
                {item.label}
              </p>
              <Text className="text-sm wrap-break-word" tone="default">
                {getLibraryDetailValue(library, item.key)}
              </Text>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LibrarySearchResultDetailFooterCta({
  disabled = false,
  onCheckAvailability,
}: LibrarySearchResultDetailFooterCtaProps) {
  return (
    <Button
      className="w-full rounded-2xl"
      disabled={disabled}
      onClick={onCheckAvailability}
      size="lg"
      variant="default"
    >
      <LucideIcon className="h-4 w-4" icon={Search} strokeWidth={2.2} />
      대출 가능 여부 조회
    </Button>
  );
}

function LibrarySearchResultDetailPlaceholder({
  onCheckAvailability,
}: Pick<LibrarySearchResultDialogProps, 'onCheckAvailability'>) {
  return (
    <LibrarySearchResultDetailPanel
      footer={<LibrarySearchResultDetailFooterCta onCheckAvailability={onCheckAvailability} />}
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

export {
  LibrarySearchResultDetailBody,
  LibrarySearchResultDetailFooterCta,
  LibrarySearchResultDetailPanel,
  LibrarySearchResultDetailPlaceholder,
};
export type {
  LibrarySearchResultDetailBodyProps,
  LibrarySearchResultDetailFooterCtaProps,
  LibrarySearchResultDetailPanelProps,
};
