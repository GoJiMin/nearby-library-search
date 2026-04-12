import type {LibraryAvailabilityResponse} from '@nearby-library-search/contracts';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {getLibraryAvailability} from './libraryApi';

const {requestGetMock} = vi.hoisted(() => ({
  requestGetMock: vi.fn(),
}));

vi.mock('@/shared/request', () => ({
  requestGet: requestGetMock,
}));

describe('entities/library api', () => {
  beforeEach(() => {
    requestGetMock.mockReset();
  });

  it('getLibraryAvailability가 availability endpoint를 requestGet으로 호출한다', async () => {
    const response: LibraryAvailabilityResponse = {
      hasBook: 'Y',
      isbn13: '9791190157551',
      libraryCode: 'LIB0001',
      loanAvailable: 'N',
    };

    requestGetMock.mockResolvedValue(response);

    await expect(
      getLibraryAvailability({
        isbn13: '9791190157551',
        libraryCode: 'LIB0001',
      }),
    ).resolves.toEqual(response);

    expect(requestGetMock).toHaveBeenCalledTimes(1);
    expect(requestGetMock).toHaveBeenCalledWith({
      endpoint: '/api/libraries/LIB0001/books/9791190157551/availability',
    });
  });
});
