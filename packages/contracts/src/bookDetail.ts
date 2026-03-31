import type { Isbn, Isbn13 } from './identifiers'

export type BookDetailLoanStat = {
  rank: number | null
  name: string
  loanCount: number | null
}

export type BookDetailLoanInfo = {
  total: BookDetailLoanStat | null
  byRegion: BookDetailLoanStat[]
  byAge: BookDetailLoanStat[]
  byGender: BookDetailLoanStat[]
}

export type BookDetail = {
  title: string
  author: string
  publisher: string | null
  publicationDate: string | null
  publicationYear: string | null
  isbn: Isbn | null
  isbn13: Isbn13
  description: string | null
  imageUrl: string | null
  classNumber: string | null
  className: string | null
}

export type BookDetailResponse = {
  book: BookDetail | null
  loanInfo: BookDetailLoanInfo
}
