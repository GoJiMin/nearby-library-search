type ErrorResponse = {
  detail: string
  status: number
  title: string
}

function createErrorResponse({
  title,
  detail,
  status,
}: ErrorResponse): ErrorResponse {
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
      error: createErrorResponse({
        detail: `${key}은(는) 하나의 문자열 값만 허용합니다.`,
        status: 400,
        title: invalidTitle,
      }),
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
      error: createErrorResponse({
        detail: invalidDetail,
        status: 400,
        title: invalidTitle,
      }),
    }
  }

  if (typeof maxValue === 'number' && parsedValue > maxValue) {
    return {
      ok: false as const,
      error: createErrorResponse({
        detail: invalidDetail,
        status: 400,
        title: invalidTitle,
      }),
    }
  }

  return {
    ok: true as const,
    value: parsedValue,
  }
}

export { isQueryRecord, readOptionalScalarStringQuery, readPositiveIntegerQuery }
