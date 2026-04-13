import {describe, expect, it} from 'vitest';
import {normalizeHttpUrl, normalizeNullableNumber, normalizeNullableString} from '../normalize.js';

describe('normalize utils', () => {
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
});
