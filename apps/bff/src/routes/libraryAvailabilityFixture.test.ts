import {beforeEach, describe, expect, it, vi} from 'vitest';

async function importLibraryAvailabilityFixtureModule() {
  process.env.LIBRARY_API_AUTH_KEY = 'test-auth-key';
  process.env.LIBRARY_API_BASE_URL = 'https://example.com';

  return import('./libraryAvailabilityFixture.js');
}

describe('libraryAvailabilityFixture', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('대출 가능 케이스를 반환한다', () => {
    const run = async () => {
      const {resolveLibraryAvailabilityFixtureResult} = await importLibraryAvailabilityFixtureModule();

      expect(
        resolveLibraryAvailabilityFixtureResult({
          isbn13: '9791192389479',
          libraryCode: 'LIB0001',
        }),
      ).toEqual({
        ok: true,
        value: {
          hasBook: 'Y',
          isbn13: '9791192389479',
          libraryCode: 'LIB0001',
          loanAvailable: 'Y',
        },
      });
    };

    return run();
  });

  it('대출 불가 케이스를 반환한다', () => {
    const run = async () => {
      const {resolveLibraryAvailabilityFixtureResult} = await importLibraryAvailabilityFixtureModule();

      expect(
        resolveLibraryAvailabilityFixtureResult({
          isbn13: '9791192389479',
          libraryCode: 'LIB0002',
        }),
      ).toEqual({
        ok: true,
        value: {
          hasBook: 'Y',
          isbn13: '9791192389479',
          libraryCode: 'LIB0002',
          loanAvailable: 'N',
        },
      });
    };

    return run();
  });

  it('에러 케이스를 반환한다', () => {
    const run = async () => {
      const {resolveLibraryAvailabilityFixtureResult} = await importLibraryAvailabilityFixtureModule();

      expect(
        resolveLibraryAvailabilityFixtureResult({
          isbn13: '9791192389479',
          libraryCode: 'LIB0003',
        }),
      ).toEqual({
        error: {
          detail: '대출 가능 여부 조회 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.',
          status: 502,
          title: 'LIBRARY_AVAILABILITY_UPSTREAM_ERROR',
        },
        ok: false,
      });
    };

    return run();
  });

  it('미소장 케이스를 반환한다', () => {
    const run = async () => {
      const {resolveLibraryAvailabilityFixtureResult} = await importLibraryAvailabilityFixtureModule();

      expect(
        resolveLibraryAvailabilityFixtureResult({
          isbn13: '9791192389479',
          libraryCode: 'LIB0004',
        }),
      ).toEqual({
        ok: true,
        value: {
          hasBook: 'N',
          isbn13: '9791192389479',
          libraryCode: 'LIB0004',
          loanAvailable: 'N',
        },
      });
    };

    return run();
  });

  it('fixture가 없으면 구조화된 response invalid 에러를 반환한다', () => {
    const run = async () => {
      const {resolveLibraryAvailabilityFixtureResult} = await importLibraryAvailabilityFixtureModule();

      expect(
        resolveLibraryAvailabilityFixtureResult({
          isbn13: '9791192389479',
          libraryCode: 'LIB9999',
        }),
      ).toEqual({
        error: {
          detail: '대출 가능 여부 조회 응답을 처리하는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
          status: 502,
          title: 'LIBRARY_AVAILABILITY_RESPONSE_INVALID',
        },
        ok: false,
      });
    };

    return run();
  });
});
