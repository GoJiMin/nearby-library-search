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

export { normalizeNullableNumber, normalizeNullableString }
