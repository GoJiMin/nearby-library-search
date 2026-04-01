import { z } from 'zod'

function normalizeOptionalString(value: unknown) {
  if (value === undefined) {
    return undefined
  }

  if (typeof value !== 'string') {
    return value
  }

  const normalizedValue = value.trim()

  return normalizedValue.length > 0 ? normalizedValue : undefined
}

function createOptionalTrimmedStringSchema(maxLength?: number) {
  const stringSchema =
    maxLength === undefined ? z.string() : z.string().max(maxLength)

  return z.preprocess(normalizeOptionalString, stringSchema.optional())
}

function createPositiveIntegerSchema(defaultValue: number, maxValue?: number) {
  const numberSchema =
    maxValue === undefined
      ? z.number().int().min(1)
      : z.number().int().min(1).max(maxValue)

  return z.preprocess((value) => {
    if (value === undefined) {
      return defaultValue
    }

    if (typeof value === 'string') {
      const normalizedValue = value.trim()

      if (!normalizedValue) {
        return defaultValue
      }

      const parsedValue = Number(normalizedValue)

      return Number.isInteger(parsedValue) ? parsedValue : Number.NaN
    }

    return value
  }, numberSchema)
}

export {
  createOptionalTrimmedStringSchema,
  createPositiveIntegerSchema,
  normalizeOptionalString,
}
