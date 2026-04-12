import {describe, expect, it, vi} from 'vitest';
import {librariesQueryKeys, librariesQueryOptions} from './libraryQueries';

const {getLibraryAvailabilityMock} = vi.hoisted(() => ({
  getLibraryAvailabilityMock: vi.fn(),
}));

vi.mock('../api/libraryApi', async importOriginal => {
  const actual = await importOriginal<typeof import('../api/libraryApi')>();

  return {
    ...actual,
    getLibraryAvailability: getLibraryAvailabilityMock,
  };
});

describe('entities/library query config', () => {
  it('availability query key는 libraryCode와 isbn13을 함께 포함한다', () => {
    expect(
      librariesQueryKeys.availability.detail({
        isbn13: '9791190157551',
        libraryCode: 'LIB0001',
      }),
    ).toEqual(['libraries', 'availability', {isbn13: '9791190157551', libraryCode: 'LIB0001'}]);
  });

  it('availability query options는 getLibraryAvailability를 queryFn으로 위임한다', async () => {
    getLibraryAvailabilityMock.mockResolvedValue({
      hasBook: 'Y',
      isbn13: '9791190157551',
      libraryCode: 'LIB0001',
      loanAvailable: 'N',
    });

    const options = librariesQueryOptions.availability({
      isbn13: '9791190157551',
      libraryCode: 'LIB0001',
    });

    await expect(options.queryFn()).resolves.toEqual({
      hasBook: 'Y',
      isbn13: '9791190157551',
      libraryCode: 'LIB0001',
      loanAvailable: 'N',
    });
    expect(getLibraryAvailabilityMock).toHaveBeenCalledWith({
      isbn13: '9791190157551',
      libraryCode: 'LIB0001',
    });
  });
});
