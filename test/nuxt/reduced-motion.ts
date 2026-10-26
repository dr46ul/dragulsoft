import { vi } from 'vitest'

// The story's scroll wiring listens for media changes, so the stand-in needs those methods as well as `matches`.
export function requestReducedMotion(reduce: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: reduce && query === '(prefers-reduced-motion: reduce)',
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
  }))
}
