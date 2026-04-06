import {describe, expect, it} from 'vitest';
import {readBookSearchResultUrlState} from '../bookSearchResultUrlState';

describe('readBookSearchResultUrlState', () => {
  it('책 제목 검색 URL을 canonical 결과 상태로 해석한다', () => {
    const searchParams = new URLSearchParams({
      page: '2',
      title: '파친코',
    });

    expect(readBookSearchResultUrlState(searchParams)).toEqual({
      params: {
        page: 2,
        title: '파친코',
      },
      queryText: '파친코',
      searchMode: 'title',
    });
  });

  it('저자명 검색 URL을 canonical 결과 상태로 해석한다', () => {
    const searchParams = new URLSearchParams({
      author: '한강',
      page: '1',
    });

    expect(readBookSearchResultUrlState(searchParams)).toEqual({
      params: {
        author: '한강',
        page: 1,
      },
      queryText: '한강',
      searchMode: 'author',
    });
  });

  it('page가 없으면 1페이지로 보정한다', () => {
    const searchParams = new URLSearchParams({
      title: '아몬드',
    });

    expect(readBookSearchResultUrlState(searchParams)).toEqual({
      params: {
        page: 1,
        title: '아몬드',
      },
      queryText: '아몬드',
      searchMode: 'title',
    });
  });

  it('비정상 page 값은 1페이지로 보정한다', () => {
    const searchParams = new URLSearchParams({
      page: '0',
      title: '채식주의자',
    });

    expect(readBookSearchResultUrlState(searchParams)).toEqual({
      params: {
        page: 1,
        title: '채식주의자',
      },
      queryText: '채식주의자',
      searchMode: 'title',
    });
  });

  it('title과 author가 동시에 있으면 invalid 상태로 본다', () => {
    const searchParams = new URLSearchParams({
      author: '한강',
      title: '소년이 온다',
    });

    expect(readBookSearchResultUrlState(searchParams)).toBeNull();
  });

  it('검색어가 없으면 invalid 상태로 본다', () => {
    expect(readBookSearchResultUrlState(new URLSearchParams())).toBeNull();
  });

  it('공백만 있는 검색어는 invalid 상태로 본다', () => {
    const searchParams = new URLSearchParams({
      title: '   ',
    });

    expect(readBookSearchResultUrlState(searchParams)).toBeNull();
  });
});
