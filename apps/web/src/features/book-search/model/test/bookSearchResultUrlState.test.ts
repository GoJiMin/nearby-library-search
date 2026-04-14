import {describe, expect, it} from 'vitest';
import {readBookSearchResultUrlState} from '../bookSearchResultUrlState';

describe('readBookSearchResultUrlState', () => {
  it('책 제목 검색 URL을 canonical 결과 상태로 해석한다', () => {
    const searchParams = new URLSearchParams({
      page: '2',
      title: '파친코',
    });

    expect(readBookSearchResultUrlState(searchParams)).toEqual({
      data: {
        params: {
          page: 2,
          title: '파친코',
        },
        queryText: '파친코',
        searchMode: 'title',
      },
      kind: 'ok',
    });
  });

  it('저자명 검색 URL을 canonical 결과 상태로 해석한다', () => {
    const searchParams = new URLSearchParams({
      author: '한강',
      page: '1',
    });

    expect(readBookSearchResultUrlState(searchParams)).toEqual({
      data: {
        params: {
          author: '한강',
          page: 1,
        },
        queryText: '한강',
        searchMode: 'author',
      },
      kind: 'ok',
    });
  });

  it('page가 없으면 1페이지로 보정한다', () => {
    const searchParams = new URLSearchParams({
      title: '아몬드',
    });

    expect(readBookSearchResultUrlState(searchParams)).toEqual({
      data: {
        params: {
          page: 1,
          title: '아몬드',
        },
        queryText: '아몬드',
        searchMode: 'title',
      },
      kind: 'ok',
    });
  });

  it('비정상 page 값은 1페이지로 보정한다', () => {
    const searchParams = new URLSearchParams({
      page: '0',
      title: '채식주의자',
    });

    expect(readBookSearchResultUrlState(searchParams)).toEqual({
      data: {
        params: {
          page: 1,
          title: '채식주의자',
        },
        queryText: '채식주의자',
        searchMode: 'title',
      },
      kind: 'ok',
    });
  });

  it('title과 author가 동시에 있으면 invalid 상태로 본다', () => {
    const searchParams = new URLSearchParams({
      author: '한강',
      title: '소년이 온다',
    });

    expect(readBookSearchResultUrlState(searchParams)).toEqual({
      defaultUiHint: 'inline',
      kind: 'recoverable',
      message: '잘못된 검색 주소입니다. 검색어를 다시 입력해주세요.',
      reason: 'multiple-query-types',
    });
  });

  it('검색어가 없으면 empty 상태로 본다', () => {
    expect(readBookSearchResultUrlState(new URLSearchParams())).toEqual({kind: 'empty'});
  });

  it('공백만 있는 검색어는 recoverable invalid 상태로 본다', () => {
    const searchParams = new URLSearchParams({
      title: '   ',
    });

    expect(readBookSearchResultUrlState(searchParams)).toEqual({
      defaultUiHint: 'inline',
      kind: 'recoverable',
      message: '잘못된 검색 주소입니다. 검색어를 다시 입력해주세요.',
      reason: 'invalid-search-params',
    });
  });

  it('길이 제한을 넘는 검색어는 recoverable invalid 상태로 본다', () => {
    const searchParams = new URLSearchParams({
      title: '가'.repeat(101),
    });

    expect(readBookSearchResultUrlState(searchParams)).toEqual({
      defaultUiHint: 'inline',
      kind: 'recoverable',
      message: '잘못된 검색 주소입니다. 검색어를 다시 입력해주세요.',
      reason: 'invalid-search-params',
    });
  });
});
