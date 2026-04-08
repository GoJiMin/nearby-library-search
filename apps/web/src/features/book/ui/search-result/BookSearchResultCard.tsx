import {BarChart3, BookOpen, Fingerprint} from 'lucide-react';
import type {BookSearchItem} from '@/entities/book';
import {Card, Heading, LucideIcon, Text} from '@/shared/ui';
import {useBookSearchResultActions} from './bookSearchResultActionContext';

type BookSearchResultCardProps = {
  item: BookSearchItem;
};

function createPublisherPublicationLabel(item: BookSearchItem) {
  if (item.publisher && item.publicationYear) {
    return `${item.publisher}, ${item.publicationYear}`;
  }

  return item.publisher ?? item.publicationYear;
}

type BookSearchResultActionButtonProps = {
  children: string;
  onClick: () => void;
  tone: 'default' | 'muted';
};

function BookSearchResultActionButton({children, onClick, tone}: BookSearchResultActionButtonProps) {
  return (
    <button
      className={`focus-visible:ring-accent-soft rounded-full px-1 py-1 text-sm transition-colors outline-none focus-visible:ring-4 ${
        tone === 'default'
          ? 'text-text font-semibold hover:text-accent focus-visible:text-accent'
          : 'text-text-muted font-medium hover:text-accent focus-visible:text-accent'
      }`}
      type="button"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function BookSearchResultCard({item}: BookSearchResultCardProps) {
  const publisherPublicationLabel = createPublisherPublicationLabel(item);
  const {onOpenBookDetail, onSelectBook} = useBookSearchResultActions();

  return (
    <article>
      <Card className="border-line bg-surface-strong w-full rounded-3xl border px-4 py-4 shadow-[0_12px_32px_-8px_rgba(15,23,42,0.08)] sm:px-5 sm:py-5">
        <div className="flex gap-4 sm:gap-6">
          <div className="bg-surface-muted relative flex h-32 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl sm:h-40 sm:w-28">
            {item.imageUrl ? (
              <img alt={`${item.title} 표지 이미지`} className="h-full w-full object-cover" src={item.imageUrl} />
            ) : (
              <div
                aria-label={`${item.title} 표지 없음`}
                className="flex h-full w-full flex-col items-center justify-center gap-2 px-3 text-center"
                role="img"
              >
                <LucideIcon className="text-text-muted h-7 w-7" icon={BookOpen} strokeWidth={1.75} />
                <Text as="span" className="text-text-muted text-xs leading-4">
                  표지 없음
                </Text>
              </div>
            )}
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <div className="space-y-3">
              <div className="space-y-1">
                <Heading as="h2" className="line-clamp-2" size="md">
                  {item.title}
                </Heading>
                <Text className="text-accent font-semibold" size="sm">
                  {item.author}
                </Text>
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-2">
                {publisherPublicationLabel ? (
                  <Text
                    as="span"
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm"
                    size="sm"
                    tone="muted"
                  >
                    <LucideIcon className="h-3.5 w-3.5 shrink-0" icon={BookOpen} strokeWidth={1.75} />
                    {publisherPublicationLabel}
                  </Text>
                ) : null}

                <Text as="span" className="inline-flex items-center gap-1.5 text-xs sm:text-sm" size="sm" tone="muted">
                  <LucideIcon className="h-3.5 w-3.5 shrink-0" icon={Fingerprint} strokeWidth={1.75} />
                  {`ISBN: ${item.isbn13}`}
                </Text>

                {item.loanCount != null ? (
                  <Text
                    as="span"
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm"
                    size="sm"
                    tone="muted"
                  >
                    <LucideIcon className="h-3.5 w-3.5 shrink-0" icon={BarChart3} strokeWidth={1.75} />
                    {`총 대출 ${item.loanCount}건`}
                  </Text>
                ) : null}
              </div>
            </div>

            <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2">
              <BookSearchResultActionButton
                tone="muted"
                onClick={() => {
                  onOpenBookDetail?.({
                    isbn13: item.isbn13,
                  });
                }}
              >
                상세 보기
              </BookSearchResultActionButton>
              <BookSearchResultActionButton
                tone="default"
                onClick={() => {
                  onSelectBook?.({
                    author: item.author,
                    isbn13: item.isbn13,
                    title: item.title,
                  });
                }}
              >
                소장 도서관 찾기
              </BookSearchResultActionButton>
            </div>
          </div>
        </div>
      </Card>
    </article>
  );
}

export {BookSearchResultCard};
export type {BookSearchResultCardProps};
