import { describe, expect, it } from 'vitest'
import { prefersReducedMotion } from '../../app/utils/motion'

function matcher(matches: boolean) {
  return (query: string) => ({ matches: matches && query === '(prefers-reduced-motion: reduce)' })
}

describe('prefersReducedMotion', () => {
  it('is true when the reduce query matches', () => {
    expect(prefersReducedMotion(matcher(true))).toBe(true)
  })

  it('is false when the reduce query does not match', () => {
    expect(prefersReducedMotion(matcher(false))).toBe(false)
  })

  it('is false when there is no window to ask', () => {
    expect(typeof window).toBe('undefined')
    expect(prefersReducedMotion()).toBe(false)
  })
})
