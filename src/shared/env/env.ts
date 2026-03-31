const publicEnvKeys = [
  'VITE_APP_ENV',
  'VITE_KAKAO_MAP_APP_KEY',
  'VITE_LIBRARY_API_BASE_URL',
  'VITE_LIBRARY_API_KEY',
] as const

type PublicEnvKey = (typeof publicEnvKeys)[number]

// Keep client env access centralized in this slice.
function readPublicEnv(key: PublicEnvKey) {
  const value = import.meta.env[key]

  if (typeof value !== 'string') {
    return undefined
  }

  const trimmedValue = value.trim()

  return trimmedValue.length > 0 ? trimmedValue : undefined
}

function hasPublicEnv(key: PublicEnvKey) {
  return readPublicEnv(key) !== undefined
}

const appConfig = Object.freeze({
  envName: readPublicEnv('VITE_APP_ENV') ?? import.meta.env.MODE,
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
})

const kakaoMapConfig = Object.freeze({
  appKey: readPublicEnv('VITE_KAKAO_MAP_APP_KEY'),
  isEnabled: hasPublicEnv('VITE_KAKAO_MAP_APP_KEY'),
})

const libraryApiConfig = Object.freeze({
  apiKey: readPublicEnv('VITE_LIBRARY_API_KEY'),
  baseUrl: readPublicEnv('VITE_LIBRARY_API_BASE_URL'),
  isEnabled:
    hasPublicEnv('VITE_LIBRARY_API_BASE_URL') &&
    hasPublicEnv('VITE_LIBRARY_API_KEY'),
})

export {
  appConfig,
  hasPublicEnv,
  kakaoMapConfig,
  libraryApiConfig,
  publicEnvKeys,
  readPublicEnv,
}
export type { PublicEnvKey }
