import {describe, expect, it} from 'vitest';
import {getBookSearchResultPaginationItems} from '../bookSearchResultPagination';

describe('getBookSearchResultPaginationItems', () => {
  it('총 페이지가 1개면 현재 페이지만 표시한다', () => {
    expect(getBookSearchResultPaginationItems(1, 1)).toEqual([{page: 1, type: 'page'}]);
  });

  it('전체 페이지가 3개이면 모든 페이지를 표시한다', () => {
    expect(getBookSearchResultPaginationItems(1, 3)).toEqual([
      {page: 1, type: 'page'},
      {page: 2, type: 'page'},
      {page: 3, type: 'page'},
    ]);
  });

  it('전체 페이지가 5 이하이면 모든 페이지를 표시한다', () => {
    expect(getBookSearchResultPaginationItems(2, 5)).toEqual([
      {page: 1, type: 'page'},
      {page: 2, type: 'page'},
      {page: 3, type: 'page'},
      {page: 4, type: 'page'},
      {page: 5, type: 'page'},
    ]);
  });

  it('첫 페이지에서는 앞쪽 숫자와 마지막 페이지, 말줄임을 올바르게 표시한다', () => {
    expect(getBookSearchResultPaginationItems(1, 10)).toEqual([
      {page: 1, type: 'page'},
      {page: 2, type: 'page'},
      {page: 3, type: 'page'},
      {id: 'ellipsis-end', type: 'ellipsis'},
      {page: 10, type: 'page'},
    ]);
  });

  it('중간 페이지에서는 첫 페이지, 말줄임, 현재 주변 페이지, 말줄임, 마지막 페이지를 표시한다', () => {
    expect(getBookSearchResultPaginationItems(5, 10)).toEqual([
      {page: 1, type: 'page'},
      {id: 'ellipsis-start', type: 'ellipsis'},
      {page: 4, type: 'page'},
      {page: 5, type: 'page'},
      {page: 6, type: 'page'},
      {id: 'ellipsis-end', type: 'ellipsis'},
      {page: 10, type: 'page'},
    ]);
  });

  it('마지막 페이지에서는 마지막 주변 숫자와 첫 페이지, 말줄임을 올바르게 표시한다', () => {
    expect(getBookSearchResultPaginationItems(10, 10)).toEqual([
      {page: 1, type: 'page'},
      {id: 'ellipsis-start', type: 'ellipsis'},
      {page: 8, type: 'page'},
      {page: 9, type: 'page'},
      {page: 10, type: 'page'},
    ]);
  });

  it('마지막 페이지 근처에서는 끝쪽 숫자 묶음을 자연스럽게 붙여서 표시한다', () => {
    expect(getBookSearchResultPaginationItems(9, 10)).toEqual([
      {page: 1, type: 'page'},
      {id: 'ellipsis-start', type: 'ellipsis'},
      {page: 8, type: 'page'},
      {page: 9, type: 'page'},
      {page: 10, type: 'page'},
    ]);
  });

  it('현재 페이지가 전체 페이지보다 커도 유효한 범위 기준으로 표시한다', () => {
    expect(getBookSearchResultPaginationItems(99, 6)).toEqual([
      {page: 1, type: 'page'},
      {id: 'ellipsis-start', type: 'ellipsis'},
      {page: 4, type: 'page'},
      {page: 5, type: 'page'},
      {page: 6, type: 'page'},
    ]);
  });

  it('현재 페이지가 1보다 작아도 유효한 범위 기준으로 표시한다', () => {
    expect(getBookSearchResultPaginationItems(0, 6)).toEqual([
      {page: 1, type: 'page'},
      {page: 2, type: 'page'},
      {page: 3, type: 'page'},
      {id: 'ellipsis-end', type: 'ellipsis'},
      {page: 6, type: 'page'},
    ]);
  });
});
