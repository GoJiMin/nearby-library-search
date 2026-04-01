import type { ErrorResponse } from '@nearby-library-search/contracts'

function createErrorResponse(
  title: ErrorResponse['title'],
  detail: string,
  status: number,
): ErrorResponse {
  return {
    detail,
    status,
    title,
  }
}

function isQueryRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readOptionalScalarStringQuery(
  queryRecord: Record<string, unknown>,
  key: string,
  invalidTitle: string,
) {
  if (!(key in queryRecord)) {
    return {
      ok: true as const,
      value: undefined,
    }
  }

  const value = queryRecord[key]

  if (typeof value !== 'string') {
    return {
      ok: false as const,
      error: createErrorResponse(
        invalidTitle,
        `${key}은(는) 하나의 문자열 값만 허용합니다.`,
        400,
      ),
    }
  }

  const normalizedValue = value.trim()

  return {
    ok: true as const,
    value: normalizedValue.length > 0 ? normalizedValue : undefined,
  }
}

function readPositiveIntegerQuery({
  queryRecord,
  key,
  fallbackValue,
  invalidDetail,
  invalidTitle,
  maxValue,
}: {
  fallbackValue: number
  invalidDetail: string
  invalidTitle: string
  key: string
  maxValue?: number
  queryRecord: Record<string, unknown>
}) {
  const valueResult = readOptionalScalarStringQuery(
    queryRecord,
    key,
    invalidTitle,
  )

  if (!valueResult.ok) {
    return valueResult
  }

  if (!valueResult.value) {
    return {
      ok: true as const,
      value: fallbackValue,
    }
  }

  const parsedValue = Number(valueResult.value)

  if (!Number.isInteger(parsedValue) || parsedValue < 1) {
    return {
      ok: false as const,
      error: createErrorResponse(invalidTitle, invalidDetail, 400),
    }
  }

  if (typeof maxValue === 'number' && parsedValue > maxValue) {
    return {
      ok: false as const,
      error: createErrorResponse(invalidTitle, invalidDetail, 400),
    }
  }

  return {
    ok: true as const,
    value: parsedValue,
  }
}

export { isQueryRecord, readOptionalScalarStringQuery, readPositiveIntegerQuery }
