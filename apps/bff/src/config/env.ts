const DEFAULT_HOST = '127.0.0.1'
const DEFAULT_PORT = 3001

function readStringEnv(name: string) {
  return process.env[name]?.trim() ?? ''
}

function readRequiredStringEnv(name: string) {
  const value = readStringEnv(name)

  if (!value) {
    throw new Error(`Missing required server env: ${name}`)
  }

  return value
}

function readPortEnv() {
  const value = readStringEnv('PORT')

  if (!value) {
    return DEFAULT_PORT
  }

  const port = Number(value)

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('Invalid server env: PORT must be an integer between 1 and 65535')
  }

  return port
}

function readBaseUrlEnv() {
  const value = readRequiredStringEnv('LIBRARY_API_BASE_URL')
  let url: URL

  try {
    url = new URL(value)
  } catch {
    throw new Error('Invalid server env: LIBRARY_API_BASE_URL must be a valid URL')
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('Invalid server env: LIBRARY_API_BASE_URL must use http or https')
  }

  return value.replace(/\/$/, '')
}

export const serverEnv = {
  host: readStringEnv('HOST') || DEFAULT_HOST,
  port: readPortEnv(),
}

export const libraryApiConfig = {
  baseUrl: readBaseUrlEnv(),
  authKey: readRequiredStringEnv('LIBRARY_API_AUTH_KEY'),
}
