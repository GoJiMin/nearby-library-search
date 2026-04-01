function normalizeNullableString(value: unknown) {
  if (typeof value !== 'string') {
    return null;
  }

  const normalizedValue = value.trim();

  return normalizedValue.length > 0 ? normalizedValue : null;
}

function normalizeNullableNumber(value: unknown) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  const normalizedValue = normalizeNullableString(value);

  if (normalizedValue === null) {
    return null;
  }

  const parsedNumber = Number(normalizedValue);

  return Number.isFinite(parsedNumber) ? parsedNumber : null;
}

function normalizeHttpUrl(value: unknown) {
  const normalizedValue = normalizeNullableString(value);

  if (!normalizedValue) {
    return null;
  }

  try {
    const url = new URL(normalizedValue);

    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}

export {normalizeHttpUrl, normalizeNullableNumber, normalizeNullableString};
