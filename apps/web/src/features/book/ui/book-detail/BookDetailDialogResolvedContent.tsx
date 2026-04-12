import type {Isbn13} from '@nearby-library-search/contracts';
import {BookOpen} from 'lucide-react';
import {useGetBookDetail} from '@/entities/book';
import {Heading, LucideIcon, Text} from '@/shared/ui';
import {BookDetailDialogEmptyContent} from './states/BookDetailDialogEmptyContent';

type BookDetailDialogResolvedContentProps = {
  isbn13: Isbn13;
};

function BookDetailDialogResolvedContent({isbn13}: BookDetailDialogResolvedContentProps) {
  const {book} = useGetBookDetail(isbn13);

  if (book == null) {
    return <BookDetailDialogEmptyContent />;
  }

  const publicationValue = book.publicationDate ?? book.publicationYear;
  const publicationLabel =
    book.publisher && publicationValue ? `${book.publisher} · ${publicationValue}` : book.publisher ?? publicationValue;
  const classificationLabel =
    book.className && book.classNumber ? `${book.className} · ${book.classNumber}` : book.className ?? book.classNumber;

  return (
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

          {book.description && (
            <section className="border-line space-y-2 border-b py-6 sm:py-8">
              <p className="text-text-muted text-xs leading-none font-semibold tracking-[0.16em] uppercase">책 소개</p>
              <Text size="sm" tone="default">
                {book.description}
              </Text>
            </section>
          )}

          <section className="py-6 sm:py-8">
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
              {classificationLabel && (
                <div className="space-y-1">
                  <Text as="dt" size="sm">
                    분류 정보
                  </Text>
                  <Text as="dd" size="sm" tone="default">
                    {classificationLabel}
                  </Text>
                </div>
              )}
            </dl>
          </section>
        </div>
      </div>
    </div>
  );
}

export {BookDetailDialogResolvedContent};
