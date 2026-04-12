import type {Isbn13} from '@nearby-library-search/contracts';
import {BookOpen} from 'lucide-react';
import {useGetBookDetail} from '@/entities/book';
import {Badge, Heading, LucideIcon, Text} from '@/shared/ui';
import {BookDetailDialogEmptyContent} from './states/BookDetailDialogEmptyContent';

type BookDetailDialogResolvedContentProps = {
  isbn13: Isbn13;
};

const detailSectionLabelClassName = 'text-text-muted text-sm leading-5 font-semibold tracking-[0.12em] uppercase';

function resolveMostPopularAgeGroup(
  byAge: Array<{
    loanCount: number | null;
    name: string;
    rank: number | null;
  }>,
) {
  const highestLoanCountAgeGroup = byAge.reduce<typeof byAge[number] | null>((currentHighest, currentItem) => {
    if (currentItem.loanCount == null) {
      return currentHighest;
    }

    if (currentHighest == null || currentHighest.loanCount == null || currentItem.loanCount > currentHighest.loanCount) {
      return currentItem;
    }

    return currentHighest;
  }, null);

  if (highestLoanCountAgeGroup != null) {
    return highestLoanCountAgeGroup;
  }

  return byAge.find(ageStat => ageStat.rank === 1) ?? null;
}

function BookDetailDialogResolvedContent({isbn13}: BookDetailDialogResolvedContentProps) {
  const {book, loanInfo} = useGetBookDetail(isbn13);

  if (book == null) {
    return <BookDetailDialogEmptyContent />;
  }

  const publicationValue = book.publicationDate ?? book.publicationYear;
  const publicationLabel =
    book.publisher && publicationValue ? `${book.publisher} · ${publicationValue}` : book.publisher ?? publicationValue;
  const classificationLabel =
    book.className && book.classNumber ? `${book.className} · ${book.classNumber}` : book.className ?? book.classNumber;
  const totalLoanInfo = loanInfo.total;
  const totalLoanCount = totalLoanInfo?.loanCount;
  const hasLoanTotal = totalLoanCount != null;
  const hasLoanAgeStats = loanInfo.byAge.length > 0;
  const totalLoanCountLabel = hasLoanTotal ? `총 대출 ${totalLoanCount.toLocaleString('ko-KR')}건` : null;
  const totalLoanRankLabel = totalLoanInfo?.rank != null ? `대출 순위 ${totalLoanInfo.rank.toLocaleString('ko-KR')}위` : null;
  const mostPopularAgeGroup = hasLoanAgeStats ? resolveMostPopularAgeGroup(loanInfo.byAge) : null;
  const mostPopularAgeLoanCountLabel =
    mostPopularAgeGroup?.loanCount != null
      ? `연령별 대출 ${mostPopularAgeGroup.loanCount.toLocaleString('ko-KR')}건으로 가장 높아요.`
      : null;

  return (
    <div className="grid h-full min-h-0 grid-cols-1 lg:grid-cols-[minmax(18rem,24rem)_minmax(0,1fr)]">
      <aside className="border-line/60 bg-surface-muted/35 border-b px-6 py-8 lg:border-r lg:border-b-0 lg:px-6 lg:py-10">
        <div className="flex h-full items-center justify-center lg:items-start">
          {book.imageUrl ? (
            <img
              alt={`${book.title} 표지 이미지`}
              className="aspect-3/4 w-full max-w-64 rounded-3xl object-cover sm:max-w-xs lg:max-w-full"
              src={book.imageUrl}
            />
          ) : (
            <div className="bg-surface border-line flex aspect-3/4 w-full max-w-64 items-center justify-center rounded-3xl border sm:max-w-xs lg:max-w-full">
              <LucideIcon className="text-text-muted h-10 w-10" icon={BookOpen} strokeWidth={1.8} />
            </div>
          )}
        </div>
      </aside>
      <div className="bg-surface min-h-0 overflow-y-auto">
        <div className="flex min-h-full flex-col gap-8 px-6 py-8 sm:px-8 sm:py-10">
          <section className="border-line/60 space-y-3 border-b pb-6">
            <Heading as="h2" className="text-balance" size="lg">
              {book.title}
            </Heading>
            <Text className="text-accent font-semibold" size="sm" tone="default">
              {book.author}
            </Text>
          </section>

          <div className="space-y-8">
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

          <section className="border-line/60 space-y-3 border-t pt-6">
            <p className={detailSectionLabelClassName}>대출 정보</p>
            {hasLoanTotal || hasLoanAgeStats ? (
              <div className="space-y-4">
                {hasLoanTotal && (
                  <div className="space-y-1">
                    <Heading as="h3" size="sm">
                      {totalLoanCountLabel}
                    </Heading>
                    {totalLoanRankLabel && (
                      <Text size="sm">
                        {totalLoanRankLabel}
                      </Text>
                    )}
                  </div>
                )}

                {mostPopularAgeGroup && (
                  <div className="space-y-1">
                    <Heading as="h3" size="sm">
                      {`가장 많이 읽는 연령대는 ${mostPopularAgeGroup.name}예요.`}
                    </Heading>
                    {mostPopularAgeLoanCountLabel && <Text size="sm">{mostPopularAgeLoanCountLabel}</Text>}
                  </div>
                )}

                {hasLoanAgeStats && (
                  <div className="flex flex-wrap gap-2">
                    {loanInfo.byAge.map(ageStat => {
                      if (ageStat.loanCount == null) {
                        return <Badge key={ageStat.name} variant="muted">{ageStat.name}</Badge>;
                      }

                      return (
                        <Badge key={ageStat.name} variant="muted">
                          {`${ageStat.name} · ${ageStat.loanCount.toLocaleString('ko-KR')}건`}
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <Text size="sm" tone="default">
                대출 정보가 없어요.
              </Text>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export {BookDetailDialogResolvedContent};
