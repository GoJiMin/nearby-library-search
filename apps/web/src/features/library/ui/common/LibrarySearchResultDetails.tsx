import type {Isbn13, LibrarySearchItem} from '@nearby-library-search/contracts';
import {Clock3, MapPin, Phone, ExternalLink, CalendarX2} from 'lucide-react';
import {decodeHtmlEntities} from '@/shared/lib/decodeHtmlEntities';
import {Heading, LucideIcon, Text} from '@/shared/ui';
import {
  LibrarySearchResultAvailabilityAction,
  LibrarySearchResultAvailabilityCta,
} from './LibrarySearchResultAvailabilityCta';
import {LibrarySearchResultExpandableFieldValue} from './LibrarySearchResultExpandableFieldValue';

type LibrarySearchResultDetailsProps = {
  isbn13?: Isbn13;
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
          <div className="flex items-start gap-3" key={`${library.code}:${item.key}`}>
            <div className="min-w-0 flex-1 space-y-1.5">
              <p className="text-text-muted text-xs leading-none font-semibold tracking-[0.16em] uppercase">
                {item.label}
              </p>
              {item.key === 'operatingTime' || item.key === 'closedDays' ? (
                <LibrarySearchResultExpandableFieldValue
                  label={item.label}
                  value={getLibraryDetailValue(library, item.key)}
                />
              ) : (
                <Text className="text-sm break-words" tone="default">
                  {decodeHtmlEntities(getLibraryDetailValue(library, item.key))}
                </Text>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LibrarySearchResultDetails({isbn13, layout = 'desktop', library}: LibrarySearchResultDetailsProps) {
  const availabilityCta =
    library != null && isbn13 != null ? (
      <LibrarySearchResultAvailabilityCta isbn13={isbn13} key={library.code} libraryCode={library.code} />
    ) : (
      <LibrarySearchResultAvailabilityAction disabled />
    );

  return (
    <section
      aria-label="선택된 도서관 정보 패널"
      className={
        layout === 'mobile'
          ? 'bg-surface border-line/40 overflow-x-hidden border-b px-6 pt-5 pb-4'
          : 'bg-surface border-line/40 min-h-0 overflow-x-hidden overflow-y-auto border-t px-6 pt-5 pb-2'
      }
    >
      <div className="flex flex-col gap-6">
        <LibrarySearchResultDetailsFields library={library} />
        {availabilityCta}
      </div>
    </section>
  );
}

export {LibrarySearchResultDetails, LibrarySearchResultDetailsFields};
export type {LibrarySearchResultDetailsFieldsProps, LibrarySearchResultDetailsProps};
