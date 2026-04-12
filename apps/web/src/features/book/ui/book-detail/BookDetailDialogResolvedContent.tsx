import type {Isbn13} from '@nearby-library-search/contracts';
import {BookOpen, X} from 'lucide-react';
import {useGetBookDetail} from '@/entities/book';
import {DialogClose, DialogContent, DialogHeader, DialogTitle, Heading, LucideIcon, Text} from '@/shared/ui';
import {BookDetailDialogLoadingContent} from './BookDetailDialogLoadingContent';

type BookDetailDialogResolvedContentProps = {
  isbn13: Isbn13;
};

function createPublicationLabel({
  publicationDate,
  publicationYear,
  publisher,
}: {
  publicationDate: string | null;
  publicationYear: string | null;
  publisher: string | null;
}) {
  const publicationLabel = publicationDate ?? publicationYear;

  if (publisher && publicationLabel) {
    return `${publisher} · ${publicationLabel}`;
  }

  return publisher ?? publicationLabel;
}

function BookDetailDialogResolvedContent({isbn13}: BookDetailDialogResolvedContentProps) {
  const {book} = useGetBookDetail(isbn13);

  if (book == null) {
    return <BookDetailDialogLoadingContent />;
  }

  const publicationLabel = createPublicationLabel(book);

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
          {book.imageUrl ? (
            <img
              alt={`${book.title} 표지 이미지`}
              className="aspect-[3/4] w-full max-w-52 rounded-3xl object-cover sm:max-w-56"
              src={book.imageUrl}
            />
          ) : (
            <div className="bg-surface border-line flex aspect-[3/4] w-full max-w-52 items-center justify-center rounded-3xl border sm:max-w-56">
              <LucideIcon className="text-text-muted h-10 w-10" icon={BookOpen} strokeWidth={1.8} />
            </div>
          )}
        </aside>
        <div className="min-h-0 overflow-y-auto">
          <div className="flex min-h-full flex-col px-6 py-8 sm:px-8 sm:py-10">
            <section className="border-line flex flex-col gap-3 border-b pb-6 pr-12 sm:pb-8">
              <Heading as="h2" className="text-balance" size="lg">
                {book.title}
              </Heading>
              <Text className="text-accent font-semibold" size="sm" tone="default">
                {book.author}
              </Text>
            </section>

            <section className="border-line py-6 sm:py-8">
              <dl className="grid gap-4 sm:grid-cols-2">
                {publicationLabel && (
                  <div className="space-y-1">
                    <Text as="dt" size="sm">
                      출판 정보
                    </Text>
                    <Text as="dd" size="sm" tone="default">
                      {publicationLabel}
                    </Text>
                  </div>
                )}
                <div className="space-y-1">
                  <Text as="dt" size="sm">
                    ISBN13
                  </Text>
                  <Text as="dd" size="sm" tone="default">
                    {book.isbn13}
                  </Text>
                </div>
                {book.isbn && (
                  <div className="space-y-1">
                    <Text as="dt" size="sm">
                      ISBN
                    </Text>
                    <Text as="dd" size="sm" tone="default">
                      {book.isbn}
                    </Text>
                  </div>
                )}
              </dl>
            </section>
          </div>
        </div>
      </div>
    </DialogContent>
  );
}

export {BookDetailDialogResolvedContent};
