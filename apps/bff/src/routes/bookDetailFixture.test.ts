import {beforeEach, describe, expect, it, vi} from 'vitest';

async function importBookDetailFixtureModule() {
  process.env.WEB_APP_ORIGIN = 'https://app.example.com';
  process.env.LIBRARY_API_AUTH_KEY = 'test-auth-key';
  process.env.LIBRARY_API_BASE_URL = 'https://example.com';

  return import('./bookDetailFixture.js');
}

describe('bookDetailFixture', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('풍부한 상세 정보 fixture를 반환한다', () => {
    const run = async () => {
      const {resolveBookDetailFixtureResult} = await importBookDetailFixtureModule();

      expect(
        resolveBookDetailFixtureResult({
          isbn13: '9788954682155',
        }),
      ).toEqual({
        ok: true,
        value: {
          book: {
            author: '이민진',
            className: '문학',
            classNumber: '813.6',
            description: '재일조선인 가족의 삶을 세대에 걸쳐 따라가는 장편소설입니다.',
            imageUrl:
              'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=320&q=80',
            isbn: '895468215X',
            isbn13: '9788954682155',
            publicationDate: '2018-03-09',
            publicationYear: '2018',
            publisher: '문학사상',
            title: '파친코',
          },
          loanInfo: {
            byAge: [
              {
                loanCount: 430,
                name: '20대',
                rank: 1,
              },
              {
                loanCount: 315,
                name: '30대',
                rank: 2,
              },
              {
                loanCount: 188,
                name: '40대',
                rank: 3,
              },
            ],
            total: {
              loanCount: 1240,
              name: '전체',
              rank: 1,
            },
          },
        },
      });
    };

    return run();
  });

  it('최소 상세 정보 fixture를 반환한다', () => {
    const run = async () => {
      const {resolveBookDetailFixtureResult} = await importBookDetailFixtureModule();

      expect(
        resolveBookDetailFixtureResult({
          isbn13: '9791196447182',
        }),
      ).toEqual({
        ok: true,
        value: {
          book: {
            author: '손원평',
            className: null,
            classNumber: null,
            description: null,
            imageUrl:
              'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=320&q=80',
            isbn: null,
            isbn13: '9791196447182',
            publicationDate: null,
            publicationYear: '2017',
            publisher: '창비',
            title: '아몬드',
          },
          loanInfo: {
            byAge: [],
            total: null,
          },
        },
      });
    };

    return run();
  });

  it('empty 상세 정보 fixture를 반환한다', () => {
    const run = async () => {
      const {resolveBookDetailFixtureResult} = await importBookDetailFixtureModule();

      expect(
        resolveBookDetailFixtureResult({
          isbn13: '9788936434124',
        }),
      ).toEqual({
        ok: true,
        value: {
          book: null,
          loanInfo: {
            byAge: [],
            total: null,
          },
        },
      });
    };

    return run();
  });

  it('에러 시나리오 fixture를 반환한다', () => {
    const run = async () => {
      const {resolveBookDetailFixtureResult} = await importBookDetailFixtureModule();

      expect(
        resolveBookDetailFixtureResult({
          isbn13: '9791192389479',
        }),
      ).toEqual({
        error: {
          detail: '도서 상세 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.',
          status: 502,
          title: 'BOOK_DETAIL_UPSTREAM_ERROR',
        },
        ok: false,
      });
    };

    return run();
  });

  it('fixture가 없으면 구조화된 response invalid 에러를 반환한다', () => {
    const run = async () => {
      const {resolveBookDetailFixtureResult} = await importBookDetailFixtureModule();

      expect(
        resolveBookDetailFixtureResult({
          isbn13: '9799999999999',
        }),
      ).toEqual({
        error: {
          detail: '도서 상세 응답을 처리하는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
          status: 502,
          title: 'BOOK_DETAIL_RESPONSE_INVALID',
        },
        ok: false,
      });
    };

    return run();
  });
});
