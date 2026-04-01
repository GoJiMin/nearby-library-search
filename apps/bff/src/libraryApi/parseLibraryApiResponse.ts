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

export { getLibraryApiResponseRoot, isLibraryApiRecord }
export type { LibraryApiRecord }
