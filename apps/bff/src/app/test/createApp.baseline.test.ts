import {beforeEach, describe, expect, it, vi} from 'vitest';

describe('createApp baseline integration', () => {
  beforeEach(() => {
    vi.resetModules();
    delete process.env.ALLOW_DEV_CORS_ORIGINS;
    delete process.env.USE_DEV_FIXTURES;
    process.env.WEB_APP_ORIGIN = 'https://app.example.com';
    process.env.LIBRARY_API_BASE_URL = 'https://example.com';
    process.env.LIBRARY_API_AUTH_KEY = 'test-auth-key';
  });

  it('헬스체크 라우트가 no-store 헤더와 ok 상태를 반환한다', async () => {
    const {createApp} = await import('../createApp.js');
    const app = createApp();

    const response = await app.inject({
      method: 'GET',
      url: '/health',
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers['cache-control']).toBe('no-store');
    expect(response.json()).toEqual({
      status: 'ok',
    });

    await app.close();
  });

  it('운영 web custom domain origin 요청에 CORS 허용 헤더를 반환한다', async () => {
    const {createApp} = await import('../createApp.js');
    const app = createApp();

    const response = await app.inject({
      headers: {
        origin: 'https://app.example.com',
      },
      method: 'GET',
      url: '/health',
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers['access-control-allow-origin']).toBe('https://app.example.com');
    expect(response.headers['access-control-allow-methods']).toBe('GET,HEAD,OPTIONS');
    expect(response.headers.vary).toBe('Origin');

    await app.close();
  });

  it('개발용 CORS 허용 플래그가 꺼져 있으면 localhost origin 요청을 허용하지 않는다', async () => {
    const {createApp} = await import('../createApp.js');
    const app = createApp();

    const response = await app.inject({
      headers: {
        origin: 'http://127.0.0.1:5173',
      },
      method: 'GET',
      url: '/health',
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers['access-control-allow-origin']).toBeUndefined();
    expect(response.headers['access-control-allow-methods']).toBeUndefined();

    await app.close();
  });

  it('개발용 CORS 허용 플래그가 켜져 있으면 localhost origin 요청을 허용한다', async () => {
    process.env.ALLOW_DEV_CORS_ORIGINS = 'true';

    const {createApp} = await import('../createApp.js');
    const app = createApp();

    const response = await app.inject({
      headers: {
        origin: 'http://localhost:5173',
      },
      method: 'GET',
      url: '/health',
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers['access-control-allow-origin']).toBe('http://localhost:5173');
    expect(response.headers['access-control-allow-methods']).toBe('GET,HEAD,OPTIONS');
    expect(response.headers.vary).toBe('Origin');

    await app.close();
  });

  it('허용되지 않은 외부 origin 요청에는 CORS 허용 헤더를 반환하지 않는다', async () => {
    const {createApp} = await import('../createApp.js');
    const app = createApp();

    const response = await app.inject({
      headers: {
        origin: 'https://evil.example.com',
      },
      method: 'GET',
      url: '/health',
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers['access-control-allow-origin']).toBeUndefined();
    expect(response.headers['access-control-allow-methods']).toBeUndefined();

    await app.close();
  });

  it('허용 origin preflight OPTIONS 요청에 204와 허용 헤더를 반환한다', async () => {
    const {createApp} = await import('../createApp.js');
    const app = createApp();

    const response = await app.inject({
      headers: {
        'access-control-request-headers': 'content-type',
        origin: 'https://app.example.com',
      },
      method: 'OPTIONS',
      url: '/api/books/search',
    });

    expect(response.statusCode).toBe(204);
    expect(response.headers['access-control-allow-origin']).toBe('https://app.example.com');
    expect(response.headers['access-control-allow-methods']).toBe('GET,HEAD,OPTIONS');
    expect(response.headers['access-control-allow-headers']).toBe('content-type');

    await app.close();
  });

  it('허용되지 않은 origin preflight OPTIONS 요청에는 CORS 허용 헤더를 반환하지 않는다', async () => {
    const {createApp} = await import('../createApp.js');
    const app = createApp();

    const response = await app.inject({
      headers: {
        'access-control-request-headers': 'content-type',
        origin: 'https://evil.example.com',
      },
      method: 'OPTIONS',
      url: '/api/books/search',
    });

    expect(response.statusCode).toBe(204);
    expect(response.headers['access-control-allow-origin']).toBeUndefined();
    expect(response.headers['access-control-allow-methods']).toBeUndefined();
    expect(response.headers['access-control-allow-headers']).toBeUndefined();

    await app.close();
  });

  it('unknown route에 404 structured error를 반환한다', async () => {
    const {createApp} = await import('../createApp.js');
    const app = createApp();

    const response = await app.inject({
      method: 'GET',
      url: '/missing',
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({
      detail: '요청한 경로를 찾을 수 없습니다.',
      status: 404,
      title: 'NOT_FOUND',
    });

    await app.close();
  });

  it('앱 레벨 unknown exception을 500 structured error로 감싼다', async () => {
    const {createApp} = await import('../createApp.js');
    const app = createApp();

    app.get('/__test/error', async () => {
      throw new Error('boom');
    });

    const response = await app.inject({
      method: 'GET',
      url: '/__test/error',
    });

    expect(response.statusCode).toBe(500);
    expect(response.json()).toEqual({
      detail: '서버 내부에서 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
      status: 500,
      title: 'INTERNAL_SERVER_ERROR',
    });
    expect(response.body).not.toContain('boom');

    await app.close();
  });

  it('security headers를 응답에 포함한다', async () => {
    const {createApp} = await import('../createApp.js');
    const app = createApp();

    const response = await app.inject({
      method: 'GET',
      url: '/health',
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['x-frame-options']).toBe('SAMEORIGIN');
    expect(response.headers['content-security-policy']).toBeUndefined();
    expect(response.headers['strict-transport-security']).toBeUndefined();

    await app.close();
  });
});
