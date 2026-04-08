import type {BookSearchItem, Isbn13} from '@nearby-library-search/contracts';

type BookSearchFixtureSeriesOptions = {
  author: string;
  count: number;
  detailUrlBase: string;
  imageUrls?: readonly string[];
  isbnPrefix: string;
  loanCountStart: number;
  publicationYearStart: number;
  publisher: string;
  titlePrefix: string;
};

function formatSeriesNumber(index: number) {
  return String(index).padStart(2, '0');
}

function createBookSearchFixtureSeries({
  author,
  count,
  detailUrlBase,
  imageUrls = [],
  isbnPrefix,
  loanCountStart,
  publicationYearStart,
  publisher,
  titlePrefix,
}: BookSearchFixtureSeriesOptions): BookSearchItem[] {
  return Array.from({length: count}, (_, index) => {
    const itemNumber = index + 1;
    const isbn13 = `${isbnPrefix}${String(itemNumber).padStart(3, '0')}` as Isbn13;

    return {
      author,
      detailUrl: `${detailUrlBase}/${isbn13}`,
      imageUrl: imageUrls.length > 0 ? imageUrls[index % imageUrls.length] : null,
      isbn13,
      loanCount: loanCountStart + index * 7,
      publicationYear: String(publicationYearStart + index),
      publisher,
      title: `${titlePrefix} ${formatSeriesNumber(itemNumber)}`,
    };
  });
}

export {createBookSearchFixtureSeries};
