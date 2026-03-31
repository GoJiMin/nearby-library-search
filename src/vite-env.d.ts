/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_ENV?: 'development' | 'production' | 'test'
  readonly VITE_KAKAO_MAP_APP_KEY?: string
  readonly VITE_LIBRARY_API_BASE_URL?: string
  readonly VITE_LIBRARY_API_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.css'
