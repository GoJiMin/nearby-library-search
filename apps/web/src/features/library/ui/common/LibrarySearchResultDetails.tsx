import type {LibrarySearchItem} from '@nearby-library-search/contracts';
import {Clock3, MapPin, Phone, Search, ExternalLink, CalendarX2} from 'lucide-react';
import {Button, Heading, LucideIcon, Text} from '@/shared/ui';

type LibrarySearchResultDetailsProps = {
  library: LibrarySearchItem | null;
  layout?: 'desktop' | 'mobile';
};

type LibrarySearchResultDetailsFieldsProps = {
  library: LibrarySearchItem | null;
};

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

function handleCheckAvailability() {}

function LibrarySearchResultDetailsFields({library}: LibrarySearchResultDetailsFieldsProps) {
  if (library == null) {
    return null;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Heading as="h2" size="md">
          {library.name}
        </Heading>
        {library.homepage && (
          <a href={library.homepage} rel="noreferrer" target="_blank">
            <LucideIcon className="text-text-muted hover:text-accent transition-colors" icon={ExternalLink} size={24} />
          </a>
        )}
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

function LibrarySearchResultDetails({
  layout = 'desktop',
  library,
}: LibrarySearchResultDetailsProps) {
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
        <div>
          <LibrarySearchResultDetailsFields library={library} />
        </div>
        <Button
          className="w-full rounded-2xl"
          disabled={library == null}
          onClick={handleCheckAvailability}
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

export {LibrarySearchResultDetails, LibrarySearchResultDetailsFields};
export type {LibrarySearchResultDetailsFieldsProps, LibrarySearchResultDetailsProps};
