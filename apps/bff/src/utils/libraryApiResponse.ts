type LibraryApiRecord = Record<string, unknown>;

function isLibraryApiRecord(value: unknown): value is LibraryApiRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getLibraryApiResponseRoot(payload: unknown): LibraryApiRecord {
  if (!isLibraryApiRecord(payload)) {
    return {};
  }

  const response = payload.response;

  return isLibraryApiRecord(response) ? response : {};
}

function getNestedRecords(responseRoot: LibraryApiRecord, listKey: string, itemKey: string) {
  const items = responseRoot[listKey];

  if (!Array.isArray(items)) {
    return [];
  }

  return items.flatMap(item => {
    if (!isLibraryApiRecord(item)) {
      return [];
    }

    const nestedItem = item[itemKey];

    return isLibraryApiRecord(nestedItem) ? [nestedItem] : [];
  });
}

function getDocRecords(responseRoot: LibraryApiRecord) {
  return getNestedRecords(responseRoot, 'docs', 'doc');
}

function getBookRecords(responseRoot: LibraryApiRecord) {
  return getNestedRecords(responseRoot, 'detail', 'book');
}

function getLibraryRecords(responseRoot: LibraryApiRecord) {
  return getNestedRecords(responseRoot, 'libs', 'lib');
}

export {getBookRecords, getDocRecords, getLibraryApiResponseRoot, getLibraryRecords, isLibraryApiRecord};
export type {LibraryApiRecord};
