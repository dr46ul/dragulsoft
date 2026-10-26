import type { Page } from 'playwright-core'
import { createPage } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { setupApp } from './setup'

await setupApp()

async function hasHorizontalOverflow(page: Page) {
  return page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
}

describe('clients section on a desktop', () => {
  it('keeps the heading in view while the schedule scrolls', async () => {
    const page = await createPage('/', {
      reducedMotion: 'reduce',
      viewport: { width: 1440, height: 900 },
    })
    const heading = page.getByRole('heading', { level: 2, name: 'Different markets. Same drawing board.' })
    const schedule = page.getByRole('list').filter({
      has: page.getByRole('heading', { level: 3, name: 'Founders' }),
    })

    // Pads the page so the schedule's middle can reach the top of the viewport whatever sits below the section.
    await page.evaluate(() => {
      const padding = document.createElement('div')
      padding.style.height = '2000px'
      document.body.append(padding)
    })
    const middle = await schedule.evaluate((element) => {
      const box = element.getBoundingClientRect()
      return box.top + window.scrollY + box.height / 2
    })
    await page.evaluate(top => window.scrollTo(0, top), middle)

    const headingTop = await heading.evaluate(element => element.getBoundingClientRect().top)
    expect(headingTop).toBeGreaterThanOrEqual(0)
    expect(headingTop).toBeLessThan(900)
    expect(await hasHorizontalOverflow(page)).toBe(false)
    await page.close()
  })
})

describe('clients section on a phone', () => {
  it('shows each reference above its title without sideways scrolling', async () => {
    const page = await createPage('/', {
      reducedMotion: 'reduce',
      viewport: { width: 390, height: 844 },
    })

    for (const { ref, who } of [
      { ref: 'C-01', who: 'Founders' },
      { ref: 'C-02', who: 'Growing businesses' },
      { ref: 'C-03', who: 'Agencies & studios' },
      { ref: 'C-04', who: 'Product teams' },
    ]) {
      const referenceBottom = await page.getByText(ref, { exact: true }).evaluate(element => element.getBoundingClientRect().bottom)
      const titleTop = await page.getByRole('heading', { level: 3, name: who }).evaluate(element => element.getBoundingClientRect().top)
      expect(referenceBottom).toBeLessThanOrEqual(titleTop)
    }
    expect(await hasHorizontalOverflow(page)).toBe(false)
    await page.close()
  })
})
