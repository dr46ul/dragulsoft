import { afterEach, describe, expect, it, vi } from 'vitest'
import { scrollToY } from '~/composables/useSmoothScroll'
import { requestReducedMotion } from './reduced-motion'

describe('scrollToY without the smooth-scroll engine running', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('scrolls the window smoothly', () => {
    requestReducedMotion(false)
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})

    scrollToY(640)

    expect(scrollTo).toHaveBeenCalledWith({ top: 640, behavior: 'smooth' })
  })

  it('jumps instantly when reduced motion is requested', () => {
    requestReducedMotion(true)
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})

    scrollToY(640)

    expect(scrollTo).toHaveBeenCalledWith({ top: 640, behavior: 'instant' })
  })
})
