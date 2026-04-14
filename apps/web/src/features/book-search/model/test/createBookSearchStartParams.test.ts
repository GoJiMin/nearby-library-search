import {describe, expect, it} from 'vitest';
import {createBookSearchStartParams} from '../createBookSearchStartParams';

describe('createBookSearchStartParams', () => {
  it('책 제목 모드에서 canonical payload를 만든다', () => {
    expect(createBookSearchStartParams({normalizedQuery: '파친코', searchMode: 'title'})).toEqual({
      page: 1,
      title: '파친코',
    });
  });

  it('저자명 모드에서 canonical payload를 만든다', () => {
    expect(createBookSearchStartParams({normalizedQuery: '한강', searchMode: 'author'})).toEqual({
      author: '한강',
      page: 1,
    });
  });

  it('정규화된 값이 빈 입력이면 validation error를 던진다', () => {
    expect(() => createBookSearchStartParams({normalizedQuery: '', searchMode: 'title'})).toThrow();
  });
});
