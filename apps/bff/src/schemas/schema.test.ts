import {describe, expect, it} from 'vitest';
import {bookDetailParamsSchema, bookSearchQuerySchema, DEFAULT_PAGE, DEFAULT_PAGE_SIZE} from './book.js';
import {DEFAULT_LIBRARY_SEARCH_PAGE, DEFAULT_LIBRARY_SEARCH_PAGE_SIZE, librarySearchQuerySchema} from './library.js';

describe('bff schemas', () => {
  it('도서 검색은 검색 조건 중 하나가 있어야 하고 기본 페이지 값을 채운다', () => {
    expect(bookSearchQuerySchema.safeParse({}).success).toBe(false);

    const result = bookSearchQuerySchema.safeParse({
      page: '',
      pageSize: '',
      title: '  React  ',
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data).toMatchObject({
        page: DEFAULT_PAGE,
        pageSize: DEFAULT_PAGE_SIZE,
        title: 'React',
      });
    }
  });

  it('도서 상세는 13자리 isbn13만 허용한다', () => {
    expect(bookDetailParamsSchema.safeParse({isbn13: '9791190157551'}).success).toBe(true);
    expect(bookDetailParamsSchema.safeParse({isbn13: '1234'}).success).toBe(false);
  });

  it('도서관 검색은 기본 페이지 값을 채우고 region/detailRegion 조합을 검증한다', () => {
    const validResult = librarySearchQuerySchema.safeParse({
      detailRegion: '33043',
      isbn: '9791190157551',
      page: '',
      pageSize: '',
      region: '33',
    });

    expect(validResult.success).toBe(true);

    if (validResult.success) {
      expect(validResult.data).toMatchObject({
        detailRegion: '33043',
        isbn: '9791190157551',
        page: DEFAULT_LIBRARY_SEARCH_PAGE,
        pageSize: DEFAULT_LIBRARY_SEARCH_PAGE_SIZE,
        region: '33',
      });
    }

    expect(
      librarySearchQuerySchema.safeParse({
        detailRegion: '31043',
        isbn: '9791190157551',
        region: '33',
      }).success,
    ).toBe(false);
  });

  it('도서관 검색은 pageSize 범위를 초과하면 실패한다', () => {
    expect(
      librarySearchQuerySchema.safeParse({
        isbn: '9791190157551',
        pageSize: '30',
        region: '33',
      }).success,
    ).toBe(false);
  });
});
