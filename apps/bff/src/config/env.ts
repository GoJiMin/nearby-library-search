const DEFAULT_HOST = '127.0.0.1'
const DEFAULT_PORT = 3001

function readStringEnv(name: string) {
  return process.env[name]?.trim() ?? ''
}

function readPortEnv() {
  return Number(process.env.PORT ?? DEFAULT_PORT)
}

export const serverEnv = {
  host: readStringEnv('HOST') || DEFAULT_HOST,
  port: readPortEnv(),
}

export const libraryApiConfig = {
  baseUrl: readStringEnv('LIBRARY_API_BASE_URL'),
  authKey: readStringEnv('LIBRARY_API_AUTH_KEY'),
}
