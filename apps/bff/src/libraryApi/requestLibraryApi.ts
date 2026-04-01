import { libraryApiConfig } from '../config/env.js'

type LibraryApiEndpoint = '/srchBooks' | '/srchDtlList' | '/libSrchByBook'

type LibraryApiQueryValue = string | number | boolean | null | undefined

type LibraryApiQueryParams = Record<string, LibraryApiQueryValue>

void libraryApiConfig

export type {
  LibraryApiEndpoint,
  LibraryApiQueryParams,
  LibraryApiQueryValue,
}
