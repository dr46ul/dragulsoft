import type { Page } from 'playwright-core'
import { createPage } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { setupApp } from './setup'

await setupApp()

const desktop = { width: 1440, height: 900 }

function serviceCards(page: Page) {
  return page.locator('#services [data-reveal="stagger"] > li')
}

describe('section entrances on a visitor with no preference', () => {
  it('keep a section\'s cards out of sight until it scrolls into view, then show every one', async () => {
    const page = await createPage('/', { viewport: desktop, reducedMotion: 'no-preference' })
    await page.waitForLoadState('networkidle')
    const cards = serviceCards(page)
    await expect(cards.count()).resolves.toBe(3)

    for (const card of await cards.all())
      await expect(card.isVisible()).resolves.toBe(false)

    await page.locator('#services').scrollIntoViewIfNeeded()

    await expect.poll(async () => {
      const visible = await Promise.all((await cards.all()).map(card => card.isVisible()))
      return visible.every(Boolean)
    }, { timeout: 5000 }).toBe(true)
    await page.close()
  })
})
