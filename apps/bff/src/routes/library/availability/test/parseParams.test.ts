import {beforeEach, describe, expect, it, vi} from 'vitest';

async function importLibraryAvailabilityParamsModule() {
  process.env.WEB_APP_ORIGIN = 'https://app.example.com';
  process.env.LIBRARY_API_AUTH_KEY = 'test-auth-key';
  process.env.LIBRARY_API_BASE_URL = 'https://example.com';

  return import('../parseParams.js');
}

describe('libraryAvailabilityParams', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('유효한 params는 trim된 값으로 통과시킨다', async () => {
    const {parseLibraryAvailabilityParams} = await importLibraryAvailabilityParamsModule();

    expect(
      parseLibraryAvailabilityParams({
        isbn13: '9791190157551',
        libraryCode: ' LIB0001 ',
      }),
    ).toEqual({
      ok: true,
      value: {
        isbn13: '9791190157551',
        libraryCode: 'LIB0001',
      },
    });
  });

  it('숫자만 있는 libraryCode도 통과시킨다', async () => {
    const {parseLibraryAvailabilityParams} = await importLibraryAvailabilityParamsModule();

    expect(
      parseLibraryAvailabilityParams({
        isbn13: '9791190157551',
        libraryCode: '143136',
      }),
    ).toEqual({
      ok: true,
      value: {
        isbn13: '9791190157551',
        libraryCode: '143136',
      },
    });
  });

  it('빈 libraryCode는 availability 전용 error title로 실패한다', async () => {
    const {parseLibraryAvailabilityParams} = await importLibraryAvailabilityParamsModule();

    expect(
      parseLibraryAvailabilityParams({
        isbn13: '9791190157551',
        libraryCode: '   ',
      }),
    ).toEqual({
      error: {
        detail: 'libraryCode는 1~20자의 영문자 또는 숫자여야 합니다.',
        status: 400,
        title: 'LIBRARY_AVAILABILITY_LIBRARY_CODE_INVALID',
      },
      ok: false,
    });
  });

  it('하이픈이 포함된 libraryCode는 실패한다', async () => {
    const {parseLibraryAvailabilityParams} = await importLibraryAvailabilityParamsModule();

    expect(
      parseLibraryAvailabilityParams({
        isbn13: '9791190157551',
        libraryCode: 'LIB-0001',
      }),
    ).toEqual({
      error: {
        detail: 'libraryCode는 1~20자의 영문자 또는 숫자여야 합니다.',
        status: 400,
        title: 'LIBRARY_AVAILABILITY_LIBRARY_CODE_INVALID',
      },
      ok: false,
    });
  });

  it('특수문자가 포함된 libraryCode는 실패한다', async () => {
    const {parseLibraryAvailabilityParams} = await importLibraryAvailabilityParamsModule();

    expect(
      parseLibraryAvailabilityParams({
        isbn13: '9791190157551',
        libraryCode: 'LIB_0001',
      }),
    ).toEqual({
      error: {
        detail: 'libraryCode는 1~20자의 영문자 또는 숫자여야 합니다.',
        status: 400,
        title: 'LIBRARY_AVAILABILITY_LIBRARY_CODE_INVALID',
      },
      ok: false,
    });
  });

  it('21자를 넘는 libraryCode는 실패한다', async () => {
    const {parseLibraryAvailabilityParams} = await importLibraryAvailabilityParamsModule();

    expect(
      parseLibraryAvailabilityParams({
        isbn13: '9791190157551',
        libraryCode: 'ABCDEFGHIJKLMNOPQRSTU',
      }),
    ).toEqual({
      error: {
        detail: 'libraryCode는 1~20자의 영문자 또는 숫자여야 합니다.',
        status: 400,
        title: 'LIBRARY_AVAILABILITY_LIBRARY_CODE_INVALID',
      },
      ok: false,
    });
  });

  it('잘못된 isbn13은 availability 전용 error title로 실패한다', async () => {
    const {parseLibraryAvailabilityParams} = await importLibraryAvailabilityParamsModule();

    expect(
      parseLibraryAvailabilityParams({
        isbn13: '1234',
        libraryCode: 'LIB0001',
      }),
    ).toEqual({
      error: {
        detail: 'isbn13은 13자리 숫자 문자열이어야 합니다.',
        status: 400,
        title: 'LIBRARY_AVAILABILITY_ISBN13_INVALID',
      },
      ok: false,
    });
  });

  it('경로 객체 자체가 비정상이면 generic params invalid로 실패한다', async () => {
    const {parseLibraryAvailabilityParams} = await importLibraryAvailabilityParamsModule();

    expect(parseLibraryAvailabilityParams(null)).toEqual({
      error: {
        detail: '대출 가능 여부 요청 경로가 올바르지 않습니다.',
        status: 400,
        title: 'LIBRARY_AVAILABILITY_PARAMS_INVALID',
      },
      ok: false,
    });
  });
});
