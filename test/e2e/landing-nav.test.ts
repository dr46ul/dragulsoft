import type { Page } from 'playwright-core'
import { createPage } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { setupApp } from './setup'

await setupApp()

async function makeScrollable(page: Page) {
  await page.evaluate(() => {
    const spacer = document.createElement('div')
    spacer.style.height = '3000px'
    document.querySelector('main')?.after(spacer)
    // The scroll range is measured on resize, and the spacer arrives after that first measurement.
    window.dispatchEvent(new Event('resize'))
  })
}

async function scrollToBottom(page: Page) {
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
}

async function widthOf(page: Page, selector: string) {
  return page.locator(selector).evaluate(element => element.getBoundingClientRect().width)
}

describe('landing navigation at desktop width', () => {
  it('shows the inline section links and hides the menu button', async () => {
    const page = await createPage('/', {
      viewport: { width: 1440, height: 900 },
    })

    await expect(page.getByRole('navigation', { name: 'Main' }).isVisible()).resolves.toBe(true)
    await expect(page.getByLabel('Open menu').isVisible()).resolves.toBe(false)
    await page.close()
  })
})

describe('landing navigation at phone width', () => {
  it('hides the inline section links and shows the menu button', async () => {
    const page = await createPage('/', {
      viewport: { width: 390, height: 844 },
    })

    await expect(page.getByRole('navigation', { name: 'Main' }).isVisible()).resolves.toBe(false)
    await expect(page.getByLabel('Open menu').isVisible()).resolves.toBe(true)
    await page.close()
  })

  it('opens the menu with the same four links', async () => {
    const page = await createPage('/', {
      viewport: { width: 390, height: 844 },
    })

    await page.getByLabel('Open menu').click()

    const labels = await page.locator('details[open] a').allTextContents()
    expect(labels).toEqual([
      'Process',
      'Services',
      'Who it’s for',
      'Working together',
    ])
    await page.close()
  })

  it('does not overflow horizontally at 360px wide', async () => {
    const page = await createPage('/', {
      viewport: { width: 360, height: 740 },
    })
    await page.waitForLoadState('networkidle')

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)

    expect(overflow).toBeLessThanOrEqual(0)
    await page.close()
  })
})

describe.each([
  { preference: 'no-preference', label: 'with smooth scrolling' },
  { preference: 'reduce', label: 'under reduced motion' },
] as const)('landing navigation scrolled $label', ({ preference }) => {
  it('keeps the bar at the top of the viewport', async () => {
    const page = await createPage('/', {
      reducedMotion: preference,
      viewport: { width: 1440, height: 900 },
    })
    await page.waitForLoadState('networkidle')
    await makeScrollable(page)

    await scrollToBottom(page)

    await expect.poll(() => page.getByRole('banner').evaluate(element => element.getBoundingClientRect().top)).toBe(0)
    await page.close()
  })

  it('grows the ruler from nothing at the top to the full bar width at the bottom', async () => {
    const page = await createPage('/', {
      reducedMotion: preference,
      viewport: { width: 1440, height: 900 },
    })
    await page.waitForLoadState('networkidle')
    await makeScrollable(page)

    expect(await widthOf(page, '[data-testid="scroll-ruler"]')).toBe(0)

    await scrollToBottom(page)

    const barWidth = await widthOf(page, 'header')
    await expect.poll(() => widthOf(page, '[data-testid="scroll-ruler"]')).toBeCloseTo(barWidth, 0)
    await page.close()
  })
})
