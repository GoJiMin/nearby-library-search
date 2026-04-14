import {describe, expect, it} from 'vitest';
import {createRegionSelectConfirmParams} from '../createRegionSelectConfirmParams';

describe('createRegionSelectConfirmParams', () => {
  it('전체 선택이면 detailRegion 없이 canonical params를 만든다', () => {
    expect(
      createRegionSelectConfirmParams({
        selection: {
          region: '11',
        },
        selectedBook: {
          author: '이민진',
          isbn13: '9788954682155',
          title: '파친코',
        },
      }),
    ).toEqual({
      isbn: '9788954682155',
      page: 1,
      region: '11',
    });
  });

  it('세부 지역 선택이면 detailRegion을 포함한 canonical params를 만든다', () => {
    expect(
      createRegionSelectConfirmParams({
        selection: {
          detailRegion: '11140',
          region: '11',
        },
        selectedBook: {
          author: '이민진',
          isbn13: '9788954682155',
          title: '파친코',
        },
      }),
    ).toEqual({
      detailRegion: '11140',
      isbn: '9788954682155',
      page: 1,
      region: '11',
    });
  });
});
