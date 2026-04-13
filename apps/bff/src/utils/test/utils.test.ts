import {describe, expect, it} from 'vitest';
import {getBookRecords, getDocRecords, getLibraryApiResponseRoot, getLibraryRecords} from '../libraryApiResponse.js';
import {normalizeHttpUrl, normalizeNullableNumber, normalizeNullableString} from '../normalize.js';

describe('bff utils', () => {
  it('nullable 문자열과 숫자 값을 정규화한다', () => {
    expect(normalizeNullableString('  청주가로수도서관  ')).toBe('청주가로수도서관');
    expect(normalizeNullableString('   ')).toBeNull();
    expect(normalizeNullableNumber(' 42 ')).toBe(42);
    expect(normalizeNullableNumber('not-a-number')).toBeNull();
  });

  it('http/https URL만 허용한다', () => {
    expect(normalizeHttpUrl('https://example.com/books')).toBe('https://example.com/books');
    expect(normalizeHttpUrl('javascript:alert(1)')).toBeNull();
    expect(normalizeHttpUrl('ftp://example.com')).toBeNull();
  });

  it('response 루트와 중첩 레코드를 안전하게 추출한다', () => {
    const responseRoot = getLibraryApiResponseRoot({
      response: {
        detail: [{book: {isbn13: '9791190157551'}}],
        docs: [{doc: {bookname: 'React'}}, {invalid: true}],
        libs: [{lib: {libCode: '143136'}}, {lib: null}],
      },
    });

    expect(responseRoot).toMatchObject({
      detail: [{book: {isbn13: '9791190157551'}}],
    });
    expect(getDocRecords(responseRoot)).toEqual([{bookname: 'React'}]);
    expect(getBookRecords(responseRoot)).toEqual([{isbn13: '9791190157551'}]);
    expect(getLibraryRecords(responseRoot)).toEqual([{libCode: '143136'}]);
  });

  it('잘못된 payload에서는 빈 구조를 반환한다', () => {
    const responseRoot = getLibraryApiResponseRoot(null);

    expect(responseRoot).toEqual({});
    expect(getDocRecords(responseRoot)).toEqual([]);
    expect(getLibraryRecords(responseRoot)).toEqual([]);
  });
});
