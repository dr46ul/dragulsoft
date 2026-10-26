import { createPage } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { setupApp } from './setup'

await setupApp()

const widths = [360, 390, 768, 1024, 1440, 1920]
const motions = ['no-preference', 'reduce'] as const

describe.each(widths)('the whole page at %ipx wide', (width) => {
  it.each(motions)('does not scroll sideways with motion preference %s', async (reducedMotion) => {
    const page = await createPage('/', {
      viewport: { width, height: 900 },
      reducedMotion,
    })
    await page.reload({ waitUntil: 'networkidle' })

    const height = await page.evaluate(() => document.documentElement.scrollHeight)
    const overflows: number[] = []
    // Scrolling through brings every lazily revealed or pinned section into its final layout.
    for (let top = 0; top <= height; top += 600) {
      await page.evaluate(y => window.scrollTo(0, y), top)
      overflows.push(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth))
    }

    expect(Math.max(...overflows)).toBeLessThanOrEqual(0)
    await page.close()
  })
})
