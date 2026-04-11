import {describe, expect, it} from 'vitest';
import {createLibraryAvailabilityFixtureResponse} from './libraryAvailabilityFixture.js';

describe('libraryAvailabilityFixture', () => {
  it('대출 가능 케이스를 반환한다', () => {
    expect(
      createLibraryAvailabilityFixtureResponse({
        isbn13: '9791192389479',
        libraryCode: 'LIB0001',
      }),
    ).toEqual({
      hasBook: 'Y',
      isbn13: '9791192389479',
      libraryCode: 'LIB0001',
      loanAvailable: 'Y',
    });
  });

  it('대출 불가 케이스를 반환한다', () => {
    expect(
      createLibraryAvailabilityFixtureResponse({
        isbn13: '9791192389479',
        libraryCode: 'LIB0002',
      }),
    ).toEqual({
      hasBook: 'Y',
      isbn13: '9791192389479',
      libraryCode: 'LIB0002',
      loanAvailable: 'N',
    });
  });

  it('미소장 케이스를 반환한다', () => {
    expect(
      createLibraryAvailabilityFixtureResponse({
        isbn13: '9791192389479',
        libraryCode: 'LIB0004',
      }),
    ).toEqual({
      hasBook: 'N',
      isbn13: '9791192389479',
      libraryCode: 'LIB0004',
      loanAvailable: 'N',
    });
  });
});
