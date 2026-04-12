import {describe, expect, it} from 'vitest';
import {librariesQueryKeys} from './libraryQueries';

describe('entities/library query config', () => {
  it('availability query key는 libraryCode와 isbn13을 함께 포함한다', () => {
    expect(
      librariesQueryKeys.availability.detail({
        isbn13: '9791190157551',
        libraryCode: 'LIB0001',
      }),
    ).toEqual(['libraries', 'availability', {isbn13: '9791190157551', libraryCode: 'LIB0001'}]);
  });
});
