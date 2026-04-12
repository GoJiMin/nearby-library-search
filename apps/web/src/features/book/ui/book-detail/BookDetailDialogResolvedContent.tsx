import type {Isbn13} from '@nearby-library-search/contracts';
import {BookOpen} from 'lucide-react';
import {useGetBookDetail} from '@/entities/book';
import {Heading, LucideIcon, Text} from '@/shared/ui';
import {BookDetailDialogFrame} from './BookDetailDialogFrame';
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
  const detailItems = [
    publicationLabel ? {label: '출판 정보', value: publicationLabel} : null,
    {label: 'ISBN13', value: book.isbn13},
    book.isbn ? {label: 'ISBN', value: book.isbn} : null,
  ].filter((item): item is {label: string; value: string} => item != null);

  return (
    <BookDetailDialogFrame
      cover={
        book.imageUrl ? (
          <img
            alt={`${book.title} 표지 이미지`}
            className="aspect-[3/4] w-full max-w-52 rounded-3xl object-cover sm:max-w-56"
            src={book.imageUrl}
          />
        ) : (
          <div className="bg-surface border-line flex aspect-[3/4] w-full max-w-52 items-center justify-center rounded-3xl border sm:max-w-56">
            <LucideIcon className="text-text-muted h-10 w-10" icon={BookOpen} strokeWidth={1.8} />
          </div>
        )
      }
    >
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
          {detailItems.map(item => (
            <div className="space-y-1" key={item.label}>
              <Text as="dt" size="sm">
                {item.label}
              </Text>
              <Text as="dd" size="sm" tone="default">
                {item.value}
              </Text>
            </div>
          ))}
        </dl>
      </section>
    </BookDetailDialogFrame>
  );
}

export {BookDetailDialogResolvedContent};
