import type {Isbn13} from '@nearby-library-search/contracts';
import {BookOpen} from 'lucide-react';
import {useGetBookDetail} from '@/entities/book';
import {Heading, LucideIcon, Text} from '@/shared/ui';
import {BookDetailDialogEmptyContent} from './states/BookDetailDialogEmptyContent';

type BookDetailDialogResolvedContentProps = {
  isbn13: Isbn13;
};

const detailSectionLabelClassName = 'text-text-muted text-sm leading-5 font-semibold tracking-[0.12em] uppercase';

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
    <div className="grid h-full min-h-0 grid-cols-1 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
      <aside className="border-line/60 bg-surface-muted/35 border-b px-6 py-8 lg:border-r lg:border-b-0 lg:px-8 lg:py-10">
        <div className="flex h-full flex-col gap-6 lg:gap-8">
          <div className="space-y-3 lg:pr-6">
            <Heading as="h2" className="text-balance" size="lg">
              {book.title}
            </Heading>
            <Text className="text-accent font-semibold" size="sm" tone="default">
              {book.author}
            </Text>
          </div>

          <div className="flex flex-1 items-center justify-center lg:items-start">
            {book.imageUrl ? (
              <img
                alt={`${book.title} 표지 이미지`}
                className="aspect-[3/4] w-full max-w-64 rounded-3xl object-cover sm:max-w-xs lg:max-w-sm"
                src={book.imageUrl}
              />
            ) : (
              <div className="bg-surface border-line flex aspect-[3/4] w-full max-w-64 items-center justify-center rounded-3xl border sm:max-w-xs lg:max-w-sm">
                <LucideIcon className="text-text-muted h-10 w-10" icon={BookOpen} strokeWidth={1.8} />
              </div>
            )}
          </div>
        </div>
      </aside>
      <div className="bg-surface min-h-0 overflow-y-auto">
        <div className="flex min-h-full flex-col gap-8 px-6 py-8 sm:px-8 sm:py-10">
          {book.description && (
            <section className="space-y-2">
              <p className={detailSectionLabelClassName}>책 소개</p>
              <Text size="sm" tone="default">
                {book.description}
              </Text>
            </section>
          )}

          <section className="space-y-3">
            <dl className="grid gap-4 sm:grid-cols-2">
              {publicationLabel && (
                <div className="space-y-2">
                  <dt className={detailSectionLabelClassName}>출판 정보</dt>
                  <Text as="dd" size="sm" tone="default">
                    {publicationLabel}
                  </Text>
                </div>
              )}
              <div className="space-y-2">
                <dt className={detailSectionLabelClassName}>ISBN13</dt>
                <Text as="dd" size="sm" tone="default">
                  {book.isbn13}
                </Text>
              </div>
              {book.isbn && (
                <div className="space-y-2">
                  <dt className={detailSectionLabelClassName}>ISBN</dt>
                  <Text as="dd" size="sm" tone="default">
                    {book.isbn}
                  </Text>
                </div>
              )}
              {classificationLabel && (
                <div className="space-y-2">
                  <dt className={detailSectionLabelClassName}>분류 정보</dt>
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
