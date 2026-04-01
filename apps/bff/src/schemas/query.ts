import { z } from 'zod'

function normalizeOptionalQueryString(value: unknown) {
  if (value === undefined) {
    return undefined
  }

  if (typeof value !== 'string') {
    return value
  }

  const normalizedValue = value.trim()

  return normalizedValue.length > 0 ? normalizedValue : undefined
}

function createPositiveIntegerQuerySchema(
  fallbackValue: number,
  maxValue?: number,
) {
  return z.preprocess(
    (value) => {
      if (value === undefined) {
        return fallbackValue
      }

      if (typeof value !== 'string') {
        return value
      }

      const normalizedValue = value.trim()

      if (!normalizedValue) {
        return fallbackValue
      }

      const parsedValue = Number(normalizedValue)

      return Number.isInteger(parsedValue) ? parsedValue : Number.NaN
    },
    maxValue === undefined
      ? z.number().int().min(1)
      : z.number().int().min(1).max(maxValue),
  )
}

export { createPositiveIntegerQuerySchema, normalizeOptionalQueryString }
