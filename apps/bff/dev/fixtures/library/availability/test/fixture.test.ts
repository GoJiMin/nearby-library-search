import {beforeEach, describe, expect, it, vi} from 'vitest';

async function importLibraryAvailabilityFixtureModule() {
  process.env.WEB_APP_ORIGIN = 'https://app.example.com';
  process.env.LIBRARY_API_AUTH_KEY = 'test-auth-key';
  process.env.LIBRARY_API_BASE_URL = 'https://example.com';

  return import('../fixture.js');
}

describe('library availability fixture', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('준비된 도서관이면 대출 가능 상태를 반환한다', () => {
    const run = async () => {
      const {getLibraryAvailabilityFixtureResult} = await importLibraryAvailabilityFixtureModule();

      expect(
        getLibraryAvailabilityFixtureResult({
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

  it('책은 있지만 대출할 수 없으면 그 상태를 반환한다', () => {
    const run = async () => {
      const {getLibraryAvailabilityFixtureResult} = await importLibraryAvailabilityFixtureModule();

      expect(
        getLibraryAvailabilityFixtureResult({
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

  it('대출 가능 여부를 준비할 수 없으면 표준 에러를 반환한다', () => {
    const run = async () => {
      const {getLibraryAvailabilityFixtureResult} = await importLibraryAvailabilityFixtureModule();

      expect(
        getLibraryAvailabilityFixtureResult({
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

  it('도서관에 책이 없으면 미소장 상태를 반환한다', () => {
    const run = async () => {
      const {getLibraryAvailabilityFixtureResult} = await importLibraryAvailabilityFixtureModule();

      expect(
        getLibraryAvailabilityFixtureResult({
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

  it('준비되지 않은 조합이면 표준 에러를 반환한다', () => {
    const run = async () => {
      const {getLibraryAvailabilityFixtureResult} = await importLibraryAvailabilityFixtureModule();

      expect(
        getLibraryAvailabilityFixtureResult({
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
