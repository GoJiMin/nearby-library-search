import { beforeEach, describe, expect, it, vi } from 'vitest'
import { RequestError, RequestGetError, requestGet, requestPost } from '@/shared/request'

function createJsonResponse(body: unknown, url: string, status = 200) {
  const response = new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json' },
    status,
  })

  Object.defineProperty(response, 'url', {
    value: url,
  })

  return response
}

function createTextResponse(body: string, url: string, status: number) {
  const response = new Response(body, {
    status,
    statusText: 'Internal Server Error',
  })

  Object.defineProperty(response, 'url', {
    value: url,
  })

  return response
}

describe('shared/request', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('requestGet이 query string을 직렬화하고 nullish 값은 제외한다', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        createJsonResponse(
          { items: [] },
          'https://example.com/libraries?hasBook=true&page=2&query=react'
        )
      )

    vi.stubGlobal('fetch', fetchMock)

    await requestGet({
      baseUrl: 'https://example.com/',
      endpoint: '/libraries',
      queryParams: {
        hasBook: true,
        page: 2,
        query: 'react',
        unused: undefined,
        zone: null,
      },
    })

    expect(fetchMock).toHaveBeenCalledWith(
      'https://example.com/libraries?hasBook=true&page=2&query=react',
      {
        headers: {},
        method: 'GET',
      }
    )
  })

  it('requestPost가 JSON body와 헤더를 올바르게 구성한다', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(null, {
        status: 204,
      })
    )

    vi.stubGlobal('fetch', fetchMock)

    await requestPost({
      baseUrl: 'https://example.com',
      body: {
        isbn: '1234567890',
        title: 'React Testing',
      },
      endpoint: '/books',
      headers: {
        'X-Trace-Id': 'trace-id',
      },
    })

    expect(fetchMock).toHaveBeenCalledWith('https://example.com/books', {
      body: JSON.stringify({
        isbn: '1234567890',
        title: 'React Testing',
      }),
      headers: {
        'Content-Type': 'application/json',
        'X-Trace-Id': 'trace-id',
      },
      method: 'POST',
    })
  })

  it('requestPost가 FormData body를 그대로 전달한다', async () => {
    const formData = new FormData()
    formData.append('file', new Blob(['content']), 'book.txt')

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(null, {
        status: 204,
      })
    )

    vi.stubGlobal('fetch', fetchMock)

    await requestPost({
      baseUrl: 'https://example.com',
      body: formData,
      endpoint: '/upload',
      headers: {
        'X-Upload-Source': 'manual',
      },
    })

    expect(fetchMock).toHaveBeenCalledWith('https://example.com/upload', {
      body: formData,
      headers: {
        'X-Upload-Source': 'manual',
      },
      method: 'POST',
    })
  })

  it('GET 실패 응답은 RequestGetError로 변환한다', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        createJsonResponse(
          {
            detail: '도서 목록을 불러오지 못했습니다.',
            status: 503,
            title: 'LIBRARY_FETCH_FAILED',
          },
          'https://example.com/libraries',
          503
        )
      )

    vi.stubGlobal('fetch', fetchMock)

    await expect(
      requestGet({
        baseUrl: 'https://example.com',
        endpoint: '/libraries',
        errorHandlingType: 'toast',
      })
    ).rejects.toMatchObject({
      endpoint: 'https://example.com/libraries',
      errorHandlingType: 'toast',
      message: '도서 목록을 불러오지 못했습니다.',
      method: 'GET',
      name: 'LIBRARY_FETCH_FAILED',
      status: 503,
    })
  })

  it('쓰기 요청 실패 응답은 RequestError로 변환한다', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        createTextResponse('server exploded', 'https://example.com/books', 500)
      )

    vi.stubGlobal('fetch', fetchMock)

    const requestBody = {
      isbn: '1234567890',
    }

    const promise = requestPost({
      baseUrl: 'https://example.com',
      body: requestBody,
      endpoint: '/books',
      withResponse: true,
    })

    await expect(promise).rejects.toBeInstanceOf(RequestError)
    await expect(promise).rejects.not.toBeInstanceOf(RequestGetError)
    await expect(promise).rejects.toMatchObject({
      endpoint: 'https://example.com/books',
      message: '요청을 처리하는 중 문제가 발생했습니다.',
      method: 'POST',
      name: 'REQUEST_ERROR',
      requestBody,
      status: 500,
    })
  })
})
