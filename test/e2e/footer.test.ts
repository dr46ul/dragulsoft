import type { Page } from 'playwright-core'
import { createPage } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { setupApp } from './setup'

await setupApp()

const widths = [360, 390, 1440, 1920]

async function cellLefts(page: Page) {
  const cells = page.getByRole('contentinfo').locator('.footer > div')
  return cells.evaluateAll(elements => elements.map(element => Math.round(element.getBoundingClientRect().left)))
}

describe.each(widths)('footer at %ipx', (width) => {
  it('draws the wordmark inside the content box with no horizontal overflow', async () => {
    const page = await createPage('/', {
      viewport: { width, height: 900 },
      reducedMotion: 'reduce',
    })
    await page.waitForLoadState('networkidle')

    const wordmark = await page.getByRole('contentinfo').locator('.wordmark').evaluate((element) => {
      const range = document.createRange()
      range.selectNodeContents(element)
      const box = element.parentElement?.getBoundingClientRect()
      return {
        textRight: range.getBoundingClientRect().right,
        boxRight: box?.right ?? 0,
      }
    })
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)

    expect(wordmark.textRight).toBeLessThanOrEqual(wordmark.boxRight + 0.5)
    expect(overflow).toBeLessThanOrEqual(0)
    await page.close()
  })
})

describe('footer title block', () => {
  it('stacks its cells on a phone', async () => {
    const page = await createPage('/', {
      viewport: { width: 390, height: 844 },
      reducedMotion: 'reduce',
    })
    await page.waitForLoadState('networkidle')

    await expect.poll(async () => (await cellLefts(page)).length).toBe(4)
    expect(new Set(await cellLefts(page)).size).toBe(1)
    await page.close()
  })

  it('lays four cells in a row at 1440px', async () => {
    const page = await createPage('/', {
      viewport: { width: 1440, height: 900 },
      reducedMotion: 'reduce',
    })
    await page.waitForLoadState('networkidle')

    await expect.poll(async () => (await cellLefts(page)).length).toBe(4)
    expect(new Set(await cellLefts(page)).size).toBe(4)
    await page.close()
  })
})
