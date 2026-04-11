import {beforeEach, describe, expect, it, vi} from 'vitest';

async function importLibraryAvailabilityResponseModule() {
  process.env.LIBRARY_API_AUTH_KEY = 'test-auth-key';
  process.env.LIBRARY_API_BASE_URL = 'https://example.com';

  return import('./libraryAvailabilityResponse.js');
}

describe('libraryAvailabilityResponse', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('bookExist 정상 응답을 내부 availability 계약으로 정규화한다', async () => {
    const {normalizeLibraryAvailabilityResponse} = await importLibraryAvailabilityResponseModule();

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
      ok: true,
      value: {
        hasBook: 'Y',
        isbn13: '9791190157551',
        libraryCode: 'LIB0001',
        loanAvailable: 'N',
      },
    });
  });

  it('hasBook가 Y/N이 아니면 정규화하지 않는다', async () => {
    const {normalizeLibraryAvailabilityResponse} = await importLibraryAvailabilityResponseModule();

    expect(
      normalizeLibraryAvailabilityResponse(
        {
          response: {
            result: {
              hasBook: 'M',
              loanAvailable: 'Y',
            },
          },
        },
        {
          isbn13: '9791190157551',
          libraryCode: 'LIB0001',
        },
      ),
    ).toEqual({
      error: {
        detail: '대출 가능 여부 조회 응답을 처리하는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
        status: 502,
        title: 'LIBRARY_AVAILABILITY_RESPONSE_INVALID',
      },
      ok: false,
    });
  });

  it('loanAvailable이 Y/N이 아니면 정규화하지 않는다', async () => {
    const {normalizeLibraryAvailabilityResponse} = await importLibraryAvailabilityResponseModule();

    expect(
      normalizeLibraryAvailabilityResponse(
        {
          response: {
            result: {
              hasBook: 'Y',
              loanAvailable: 'maybe',
            },
          },
        },
        {
          isbn13: '9791190157551',
          libraryCode: 'LIB0001',
        },
      ),
    ).toEqual({
      error: {
        detail: '대출 가능 여부 조회 응답을 처리하는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
        status: 502,
        title: 'LIBRARY_AVAILABILITY_RESPONSE_INVALID',
      },
      ok: false,
    });
  });

  it('result record가 없으면 response invalid 에러로 실패한다', async () => {
    const {normalizeLibraryAvailabilityResponse} = await importLibraryAvailabilityResponseModule();

    expect(
      normalizeLibraryAvailabilityResponse(
        {
          response: {},
        },
        {
          isbn13: '9791190157551',
          libraryCode: 'LIB0001',
        },
      ),
    ).toEqual({
      error: {
        detail: '대출 가능 여부 조회 응답을 처리하는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
        status: 502,
        title: 'LIBRARY_AVAILABILITY_RESPONSE_INVALID',
      },
      ok: false,
    });
  });
});
