import {describe, expect, it} from 'vitest';
import {decodeHtmlEntities} from '../decodeHtmlEntities';

describe('decodeHtmlEntities', () => {
  it('named html entity를 사람이 읽을 수 있는 문자로 바꾼다', () => {
    expect(decodeHtmlEntities('어린이&middot;디지털자료실')).toBe('어린이·디지털자료실');
    expect(decodeHtmlEntities('&lt;채식주의자&gt;')).toBe('<채식주의자>');
    expect(decodeHtmlEntities('A&amp;B')).toBe('A&B');
  });

  it('numeric html entity를 사람이 읽을 수 있는 문자로 바꾼다', () => {
    expect(decodeHtmlEntities('&#39;파친코&#39;')).toBe("'파친코'");
    expect(decodeHtmlEntities('&#xB7;')).toBe('·');
  });

  it('알 수 없는 entity는 그대로 둔다', () => {
    expect(decodeHtmlEntities('&not-supported;')).toBe('&not-supported;');
  });
});
