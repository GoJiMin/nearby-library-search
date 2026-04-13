import type {AppFixtures} from '../fixtures.types.js';
import {beforeEach, describe, expect, it, vi} from 'vitest';

const {fetchLibraryApiMock} = vi.hoisted(() => ({
  fetchLibraryApiMock: vi.fn(),
}));

vi.mock('../../libraryApi/fetchLibraryApi.js', async importOriginal => {
  const actual = await importOriginal<typeof import('../../libraryApi/fetchLibraryApi.js')>();

  return {
    ...actual,
    fetchLibraryApi: fetchLibraryApiMock,
  };
});

function createBookSearchFixtureResolver(
  response = {
    items: [],
    totalCount: 0,
  },
): AppFixtures['bookSearch'] {
  return {
    resolve() {
      return {
        ok: true,
        value: response,
      };
    },
  };
}

async function importBootstrapModule() {
  process.env.WEB_APP_ORIGIN = 'https://app.example.com';
  process.env.LIBRARY_API_BASE_URL = 'https://example.com';
  process.env.LIBRARY_API_AUTH_KEY = 'test-auth-key';

  return import('../bootstrap.js');
}

describe('app bootstrap', () => {
  beforeEach(() => {
    vi.resetModules();
    fetchLibraryApiMock.mockReset();
    delete process.env.ALLOW_DEV_CORS_ORIGINS;
    delete process.env.USE_DEV_FIXTURES;
  });

  it('production bootstrap은 fixture 플래그가 켜져 있으면 부팅을 거절한다', async () => {
    process.env.USE_DEV_FIXTURES = 'true';

    const {createProductionApp} = await importBootstrapModule();

    expect(() => createProductionApp()).toThrowError(
      'Invalid production bootstrap: USE_DEV_FIXTURES=true is not allowed',
    );
  });

  it('production bootstrap은 fixture 플래그가 꺼져 있으면 앱을 만든다', async () => {
    const {createProductionApp} = await importBootstrapModule();
    const app = createProductionApp();

    const response = await app.inject({
      method: 'GET',
      url: '/health',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      status: 'ok',
    });

    await app.close();
  });

  it('dev bootstrap은 fixture 플래그가 켜져 있으면 준비된 fixture registry를 연결한다', async () => {
    process.env.USE_DEV_FIXTURES = 'true';

    const {createDevApp} = await importBootstrapModule();
    const app = createDevApp({
      fixtures: {
        bookSearch: createBookSearchFixtureResolver(),
      },
    });

    const response = await app.inject({
      method: 'GET',
      url: '/api/books/search?title=파친코',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      items: [],
      totalCount: 0,
    });
    expect(fetchLibraryApiMock).not.toHaveBeenCalled();

    await app.close();
  });

  it('dev bootstrap은 fixture 플래그가 켜져 있는데 registry가 없으면 부팅을 거절한다', async () => {
    process.env.USE_DEV_FIXTURES = 'true';

    const {createDevApp} = await importBootstrapModule();

    expect(() => createDevApp()).toThrowError(
      'Invalid dev bootstrap: USE_DEV_FIXTURES=true requires a fixture registry',
    );
  });

  it('dev bootstrap은 fixture 플래그가 꺼져 있으면 fixture 없이도 앱을 만든다', async () => {
    const {createDevApp} = await importBootstrapModule();
    const app = createDevApp();

    const response = await app.inject({
      method: 'GET',
      url: '/health',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      status: 'ok',
    });
    expect(fetchLibraryApiMock).not.toHaveBeenCalled();

    await app.close();
  });
});
