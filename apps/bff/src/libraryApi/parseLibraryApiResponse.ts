type LibraryApiRecord = Record<string, unknown>

function isLibraryApiRecord(value: unknown): value is LibraryApiRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function getLibraryApiResponseRoot(payload: unknown): LibraryApiRecord {
  if (!isLibraryApiRecord(payload)) {
    return {}
  }

  const response = payload.response

  return isLibraryApiRecord(response) ? response : {}
}

function getNestedRecords(
  responseRoot: LibraryApiRecord,
  listKey: string,
  itemKey: string,
) {
  const items = responseRoot[listKey]

  if (!Array.isArray(items)) {
    return []
  }

  return items.flatMap((item) => {
    if (!isLibraryApiRecord(item)) {
      return []
    }

    const nestedItem = item[itemKey]

    return isLibraryApiRecord(nestedItem) ? [nestedItem] : []
  })
}

function getDocRecords(responseRoot: LibraryApiRecord) {
  return getNestedRecords(responseRoot, 'docs', 'doc')
}

function getLibraryRecords(responseRoot: LibraryApiRecord) {
  return getNestedRecords(responseRoot, 'libs', 'lib')
}

function normalizeNullableString(value: unknown) {
  if (typeof value !== 'string') {
    return null
  }

  const normalizedValue = value.trim()

  return normalizedValue.length > 0 ? normalizedValue : null
}

function normalizeNullableNumber(value: unknown) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null
  }

  const normalizedValue = normalizeNullableString(value)

  if (normalizedValue === null) {
    return null
  }

  const parsedNumber = Number(normalizedValue)

  return Number.isFinite(parsedNumber) ? parsedNumber : null
}

export {
  getDocRecords,
  getLibraryApiResponseRoot,
  getLibraryRecords,
  isLibraryApiRecord,
  normalizeNullableNumber,
  normalizeNullableString,
}
export type { LibraryApiRecord }
