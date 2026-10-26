import type { ConsoleMessage } from 'playwright-core'
import { createPage } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { setupApp } from './setup'

await setupApp()

const viewports = [
  { name: 'phone', width: 390, height: 844 },
  { name: 'desktop', width: 1440, height: 900 },
]

describe.each(viewports)('index page on $name', ({ width, height }) => {
  it('loads with no console errors and no horizontal overflow', async () => {
    const page = await createPage('/', {
      viewport: { width, height },
    })
    const errors: string[] = []
    page.on('console', (message: ConsoleMessage) => {
      if (message.type() === 'error') {
        errors.push(message.text())
      }
    })
    page.on('pageerror', error => errors.push(error.message))

    await page.reload({ waitUntil: 'networkidle' })

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(errors).toEqual([])
    expect(overflow).toBeLessThanOrEqual(0)
    await page.close()
  })

  it('focuses the skip link on the first Tab, with a visible outline', async () => {
    const page = await createPage('/', {
      viewport: { width, height },
    })

    await page.keyboard.press('Tab')

    const skipLink = page.getByRole('link', { name: 'Skip to content' })
    await expect(skipLink.evaluate(element => element === document.activeElement)).resolves.toBe(true)
    const outline = await skipLink.evaluate((element) => {
      const { outlineStyle, outlineWidth } = getComputedStyle(element)
      return { outlineStyle, outlineWidth }
    })
    expect(outline).toEqual({ outlineStyle: 'solid', outlineWidth: '2px' })
    await page.close()
  })
})

describe('index page head', () => {
  it('has the Dragulsoft title and description', async () => {
    const page = await createPage('/')

    expect(await page.title()).toBe('Dragulsoft · Web apps, websites and AI integrations')
    await expect(page.locator('meta[name="description"]').getAttribute('content')).resolves.toBe(
      'Dragulsoft is an independent software practice building web apps, websites and AI integrations, with one accountable lead from first sketch to launch.',
    )
    await expect(page.locator('meta[property="og:title"]').getAttribute('content')).resolves.toBe(
      'Dragulsoft · Software, drawn up properly and built to ship',
    )
    await expect(page.locator('meta[property="og:type"]').getAttribute('content')).resolves.toBe('website')
    await expect(page.locator('html').getAttribute('lang')).resolves.toBe('en')
    await page.close()
  })

  it('points the favicon at the SVG tile and the app icon at the PNG', async () => {
    const page = await createPage('/')

    await expect(page.locator('link[rel="icon"]').getAttribute('href')).resolves.toBe('/favicon.svg')
    await expect(page.locator('link[rel="apple-touch-icon"]').getAttribute('href')).resolves.toBe('/apple-touch-icon.png')
    await page.close()
  })

  it('sets the body in Schibsted Grotesk once fonts load', async () => {
    const page = await createPage('/')

    const family = await page.evaluate(async () => {
      await document.fonts.ready
      return getComputedStyle(document.body).fontFamily
    })

    expect(family).toMatch(/^"?Schibsted Grotesk/)
    await page.close()
  })
})
