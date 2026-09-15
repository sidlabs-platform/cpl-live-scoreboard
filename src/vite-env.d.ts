/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CPL_FIXTURE_MODE?: string
  readonly VITE_CPL_POLL_INTERVAL_MS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
