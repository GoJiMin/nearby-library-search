import type {DetailRegionCode, RegionCode} from './region.js';
import type {Isbn, LibraryCode} from './identifiers.js';

export type LibrarySearchItem = {
  code: LibraryCode;
  name: string;
  address: string | null;
  phone: string | null;
  fax: string | null;
  latitude: number | null;
  longitude: number | null;
  homepage: string | null;
  closedDays: string | null;
  operatingTime: string | null;
};

export type LibrarySearchResponse = {
  isbn: Isbn;
  region: RegionCode;
  detailRegion?: DetailRegionCode;
  totalCount: number;
  resultCount: number;
  page: number | null;
  pageSize: number | null;
  items: LibrarySearchItem[];
};
