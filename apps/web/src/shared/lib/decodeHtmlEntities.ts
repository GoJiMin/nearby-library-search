const namedEntityMap = {
  amp: '&',
  apos: "'",
  gt: '>',
  lt: '<',
  middot: '·',
  nbsp: ' ',
  quot: '"',
} as const;

const htmlEntityPattern = /&(#(?:\d+|x[0-9a-fA-F]+)|[a-zA-Z]+);/g;

function decodeNumericEntity(entityBody: string) {
  const isHex = entityBody[1]?.toLowerCase() === 'x';
  const numericValue = isHex ? Number.parseInt(entityBody.slice(2), 16) : Number.parseInt(entityBody.slice(1), 10);

  if (!Number.isFinite(numericValue) || numericValue < 0 || numericValue > 0x10ffff) {
    return null;
  }

  try {
    return String.fromCodePoint(numericValue);
  } catch {
    return null;
  }
}

function decodeHtmlEntities(value: string) {
  return value.replace(htmlEntityPattern, (match, entityBody: string) => {
    if (entityBody.startsWith('#')) {
      return decodeNumericEntity(entityBody) ?? match;
    }

    return namedEntityMap[entityBody as keyof typeof namedEntityMap] ?? match;
  });
}

export {decodeHtmlEntities};
