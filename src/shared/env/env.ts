const publicEnvKeys = [
  'VITE_APP_ENV',
  'VITE_KAKAO_MAP_APP_KEY',
  'VITE_LIBRARY_API_BASE_URL',
  'VITE_LIBRARY_API_KEY',
] as const

type PublicEnvKey = (typeof publicEnvKeys)[number]

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

export { hasPublicEnv, publicEnvKeys, readPublicEnv }
export type { PublicEnvKey }
