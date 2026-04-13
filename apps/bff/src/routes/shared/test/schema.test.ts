import {describe, expect, it} from 'vitest';
import {z} from 'zod';
import {createPositiveIntegerQuerySchema, normalizeOptionalInputString} from '../schema.js';

describe('route shared schema helper', () => {
  it('공백 문자열은 비어 있는 입력으로 정리한다', () => {
    expect(normalizeOptionalInputString('  파친코  ')).toBe('파친코');
    expect(normalizeOptionalInputString('   ')).toBeUndefined();
    expect(normalizeOptionalInputString(undefined)).toBeUndefined();
  });

  it('양의 정수 query schema는 빈 값에 기본값을 채운다', () => {
    const schema = createPositiveIntegerQuerySchema(10, 20);

    expect(schema.parse(undefined)).toBe(10);
    expect(schema.parse('')).toBe(10);
    expect(schema.parse('15')).toBe(15);
  });

  it('양의 정수 query schema는 형식이 잘못되면 실패한다', () => {
    const schema = z.object({
      pageSize: createPositiveIntegerQuerySchema(10, 20),
    });

    expect(schema.safeParse({pageSize: '0'}).success).toBe(false);
    expect(schema.safeParse({pageSize: '21'}).success).toBe(false);
    expect(schema.safeParse({pageSize: 'abc'}).success).toBe(false);
  });
});
