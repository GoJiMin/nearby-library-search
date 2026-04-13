import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

const originalEnv = {...process.env};

async function importEnvModule() {
  return import('./env.js');
}

describe('env', () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = {
      ...originalEnv,
      LIBRARY_API_AUTH_KEY: 'test-auth-key',
      LIBRARY_API_BASE_URL: 'https://data4library.kr/api',
      WEB_APP_ORIGIN: 'https://app.example.com',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('유효한 https 환경 변수를 읽고 origin과 baseUrl을 정규화한다', async () => {
    process.env.WEB_APP_ORIGIN = 'https://app.example.com/';
    process.env.LIBRARY_API_BASE_URL = 'https://data4library.kr/api/';

    const {libraryApiConfig, webAppConfig} = await importEnvModule();

    expect(webAppConfig.origin).toBe('https://app.example.com');
    expect(libraryApiConfig.baseUrl).toBe('https://data4library.kr/api');
  });

  it('WEB_APP_ORIGIN이 없으면 실패한다', async () => {
    delete process.env.WEB_APP_ORIGIN;

    await expect(importEnvModule()).rejects.toThrow('Missing required server env: WEB_APP_ORIGIN');
  });

  it('WEB_APP_ORIGIN이 유효한 URL이 아니면 실패한다', async () => {
    process.env.WEB_APP_ORIGIN = 'not-a-url';

    await expect(importEnvModule()).rejects.toThrow('Invalid server env: WEB_APP_ORIGIN must be a valid URL');
  });

  it('WEB_APP_ORIGIN이 http면 실패한다', async () => {
    process.env.WEB_APP_ORIGIN = 'http://app.example.com';

    await expect(importEnvModule()).rejects.toThrow('Invalid server env: WEB_APP_ORIGIN must use https');
  });

  it('WEB_APP_ORIGIN이 localhost면 실패한다', async () => {
    process.env.WEB_APP_ORIGIN = 'https://localhost:5173';

    await expect(importEnvModule()).rejects.toThrow(
      'Invalid server env: WEB_APP_ORIGIN must not use localhost or 127.0.0.1',
    );
  });

  it('WEB_APP_ORIGIN에 path가 포함되면 실패한다', async () => {
    process.env.WEB_APP_ORIGIN = 'https://app.example.com/books';

    await expect(importEnvModule()).rejects.toThrow(
      'Invalid server env: WEB_APP_ORIGIN must be an exact origin without path, query, or hash',
    );
  });

  it('LIBRARY_API_BASE_URL이 http면 실패한다', async () => {
    process.env.LIBRARY_API_BASE_URL = 'http://data4library.kr/api';

    await expect(importEnvModule()).rejects.toThrow('Invalid server env: LIBRARY_API_BASE_URL must use https');
  });
});
