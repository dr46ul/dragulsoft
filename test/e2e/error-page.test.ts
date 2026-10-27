import type { ConsoleMessage, Page } from 'playwright-core'
import { createPage, fetch } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { setupApp } from './setup'

await setupApp()

const missing = '/no-such-sheet'
function copyBlock(page: Page) {
  return page.getByRole('heading', { level: 1 }).locator('..')
}

const viewports = [
  { name: 'phone', width: 390, height: 844 },
  { name: 'desktop', width: 1440, height: 900 },
]

describe('a request for a path that does not exist', () => {
  it('responds 404 so crawlers do not index it', async () => {
    const response = await fetch(missing)

    expect(response.status).toBe(404)
  })
})

describe.each(viewports)('error page on $name', ({ width, height }) => {
  it('names the problem in the tab title, headline and eyebrow without errors or sideways scroll', async () => {
    const page = await createPage(missing, {
      viewport: { width, height },
    })
    const errors: string[] = []
    page.on('console', (message: ConsoleMessage) => {
      // The browser logs the failed document request itself; any other 404 (a font, an asset) is a real fault.
      const isMissingPageRequest = message.text().includes('status of 404') && message.location().url.endsWith(missing)
      if (message.type() === 'error' && !isMissingPageRequest)
        errors.push(message.text())
    })
    page.on('pageerror', error => errors.push(error.message))

    await page.reload({ waitUntil: 'networkidle' })

    expect(await page.title()).toBe('404 · Not in set · Dragulsoft')
    await expect(page.getByRole('heading', { level: 1 }).textContent()).resolves.toBe('This sheet isn’t in the set.')
    await expect(page.getByText(/Error 404/).isVisible()).resolves.toBe(true)
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(overflow).toBeLessThanOrEqual(0)
    // The page root clips overflow, so scrollWidth can't fail; the copy block's own box can.
    const box = await copyBlock(page).boundingBox()
    expect(box?.x).toBeGreaterThanOrEqual(0)
    expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(width)
    expect((box?.y ?? 0) + (box?.height ?? 0)).toBeLessThanOrEqual(height)
    expect(errors).toEqual([])
    await page.close()
  })

  it('leads back to the landing page from the button and from the brand link', async () => {
    for (const control of ['button', 'link'] as const) {
      const page = await createPage(missing, {
        viewport: { width, height },
      })
      await page.waitForLoadState('networkidle')

      await (control === 'button'
        ? page.getByRole('button', { name: 'Back to the homepage' })
        : page.getByRole('link', { name: /Dragulsoft/ })
      ).click()

      await page.waitForURL(url => url.pathname === '/')
      await page.getByRole('heading', { level: 1 }).waitFor()
      await expect(page.getByRole('heading', { level: 1 }).textContent()).resolves.not.toBe('This sheet isn’t in the set.')
      await page.close()
    }
  })
})

describe('error page on small screens', () => {
  it('keeps the copy clear of the left ruler at 360px wide', async () => {
    const page = await createPage(missing, {
      viewport: { width: 360, height: 800 },
    })
    await page.waitForLoadState('networkidle')

    const box = await copyBlock(page).boundingBox()

    expect(box?.x).toBeGreaterThanOrEqual(24)
    expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(360)
    await page.close()
  })

  it('keeps the copy block clear of the brand mark at 720px tall', async () => {
    const page = await createPage(missing, {
      viewport: { width: 1280, height: 720 },
    })
    await page.waitForLoadState('networkidle')

    const brand = await page.getByRole('link', { name: /Dragulsoft/ }).boundingBox()
    const copy = await copyBlock(page).boundingBox()

    expect(copy?.y).toBeGreaterThanOrEqual((brand?.y ?? 0) + (brand?.height ?? 0))
    await page.close()
  })
})

describe('error page on a large screen', () => {
  it('numbers the rulers all the way to the far edges', async () => {
    const page = await createPage(missing, {
      viewport: { width: 2560, height: 1440 },
    })
    await page.waitForLoadState('networkidle')

    await expect(page.getByText('27', { exact: true }).isVisible()).resolves.toBe(true)
    await expect(page.getByText('O', { exact: true }).isVisible()).resolves.toBe(true)
    await page.close()
  })
})

describe('error page on desktop', () => {
  const desktop = { width: 1440, height: 900 }

  it('moves the crosshair readout with the mouse', async () => {
    const page = await createPage(missing, { viewport: desktop, reducedMotion: 'no-preference' })
    await page.waitForLoadState('networkidle')
    const readout = page.getByText(/· (Not in set|Blank)$/)
    await expect(readout.textContent()).resolves.toMatch(/Not in set$/)

    await page.mouse.move(200, 150)

    await expect.poll(() => readout.textContent()).toBe('B3 · Blank')
    await page.close()
  })

  it('hides the decorative layers from the accessibility tree', async () => {
    const page = await createPage(missing, { viewport: desktop })
    await page.waitForLoadState('networkidle')

    const tree = await page.locator('body').ariaSnapshot()

    expect(tree).not.toMatch(/Blank|Not in set|GET \//)
    expect(tree).not.toMatch(/\b[A-N]\b/)
    expect(tree).toContain('heading "This sheet isn’t in the set." [level=1]')
    await page.close()
  })
})
