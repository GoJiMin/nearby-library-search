import {describe, expect, it} from 'vitest';
import {normalizeLibraryAvailabilityResponse} from './libraryAvailabilityResponse.js';

describe('libraryAvailabilityResponse', () => {
  it('bookExist 정상 응답을 내부 availability 계약으로 정규화한다', () => {
    expect(
      normalizeLibraryAvailabilityResponse(
        {
          response: {
            result: {
              hasBook: 'Y',
              loanAvailable: 'N',
            },
          },
        },
        {
          isbn13: '9791190157551',
          libraryCode: 'LIB0001',
        },
      ),
    ).toEqual({
      hasBook: 'Y',
      isbn13: '9791190157551',
      libraryCode: 'LIB0001',
      loanAvailable: 'N',
    });
  });
});
