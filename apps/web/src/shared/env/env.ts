const publicEnvKeys = [
  'VITE_APP_ENV',
  'VITE_KAKAO_MAP_APP_KEY',
  'VITE_API_BASE_URL',
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

const apiConfig = Object.freeze({
  // The web app must call the Fastify BFF only through this base URL.
  baseUrl: readPublicEnv('VITE_API_BASE_URL'),
  isEnabled: hasPublicEnv('VITE_API_BASE_URL'),
})

export {
  apiConfig,
  appConfig,
  hasPublicEnv,
  kakaoMapConfig,
  publicEnvKeys,
  readPublicEnv,
}
export type { PublicEnvKey }
