import type { Page } from 'playwright-core'
import { createPage } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { setupApp } from './setup'

await setupApp()

const desktop = { width: 1440, height: 900 }
const phone = { width: 390, height: 844 }
const stickyTop = 64
// A regular expression, because the blinking caret is a child of the quote.
const whole = /Every order lives in three spreadsheets\. We need one place to see them, and to just ask it questions\./

// Stands in for the chapters the scroll story adds below the hero, so there is something to scroll past.
async function addStoryStandIn(page: Page) {
  await page.evaluate(() => {
    const standIn = document.createElement('div')
    standIn.style.height = '3000px'
    standIn.style.gridColumn = '1'
    standIn.style.gridRow = '2'
    document.querySelector('#process')?.append(standIn)
  })
}

function sheetBand(page: Page) {
  return page.getByRole('figure').locator('..')
}

async function top(locator: ReturnType<Page['locator']>) {
  return locator.evaluate(element => element.getBoundingClientRect().top)
}

describe('hero at 1440 wide', () => {
  it('shows the headline and sheet within three seconds with motion allowed', async () => {
    const page = await createPage('/', { viewport: desktop, reducedMotion: 'no-preference' })

    await page.getByRole('heading', { level: 1 }).waitFor({ state: 'visible', timeout: 3000 })
    await page.getByRole('figure').waitFor({ state: 'visible', timeout: 3000 })
    await page.close()
  })

  it('types the whole brief onto the note once the intro has run', async () => {
    const page = await createPage('/', { viewport: desktop, reducedMotion: 'no-preference' })

    await page.getByText(whole).waitFor({ timeout: 8000 })
    await page.close()
  })

  it('shows the headline, sheet and whole brief at once under reduced motion', async () => {
    const page = await createPage('/', { viewport: desktop, reducedMotion: 'reduce' })

    expect(await page.getByRole('heading', { level: 1 }).isVisible()).toBe(true)
    expect(await page.getByRole('figure').isVisible()).toBe(true)
    expect(await page.getByText(whole).isVisible()).toBe(true)
    await page.close()
  })

  it('keeps the sheet pinned 64px from the top while the page scrolls', async () => {
    const page = await createPage('/', { viewport: desktop, reducedMotion: 'reduce' })
    await addStoryStandIn(page)

    await page.evaluate(() => window.scrollTo(0, 600))

    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(600)
    expect(await top(sheetBand(page))).toBe(stickyTop)
    await page.close()
  })

  it('does not overflow horizontally', async () => {
    const page = await createPage('/', { viewport: desktop, reducedMotion: 'no-preference' })
    await page.reload({ waitUntil: 'networkidle' })

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(overflow).toBeLessThanOrEqual(0)
    await page.close()
  })

  it('shows the title block', async () => {
    const page = await createPage('/', { viewport: desktop, reducedMotion: 'reduce' })

    expect(await page.getByText('Order desk').isVisible()).toBe(true)
    await page.close()
  })
})

describe('title block width', () => {
  it.each([
    { width: 1279, visible: false },
    { width: 1280, visible: true },
  ])('is visible at $width wide: $visible', async ({ width, visible }) => {
    const page = await createPage('/', {
      viewport: { width, height: 900 },
      reducedMotion: 'reduce',
    })

    expect(await page.getByText('Order desk').isVisible()).toBe(visible)
    await page.close()
  })
})

describe('hero at 390 wide', () => {
  it('puts the headline above the sheet in the first viewport', async () => {
    const page = await createPage('/', { viewport: phone, reducedMotion: 'reduce' })

    const heading = page.getByRole('heading', { level: 1 })
    const headingBox = await heading.boundingBox()
    const sheetBox = await page.getByRole('figure').boundingBox()
    expect(headingBox).not.toBeNull()
    expect(sheetBox).not.toBeNull()
    expect(headingBox?.y).toBeLessThan(phone.height)
    expect((headingBox?.y ?? 0) + (headingBox?.height ?? 0)).toBeLessThanOrEqual(sheetBox?.y ?? 0)
    await page.close()
  })

  it('pins the sheet band 64px from the top once the hero has scrolled past', async () => {
    const page = await createPage('/', { viewport: phone, reducedMotion: 'reduce' })
    await addStoryStandIn(page)

    await page.evaluate(() => window.scrollTo(0, 1200))

    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(1200)
    expect(await top(sheetBand(page))).toBe(stickyTop)
    await page.close()
  })

  it('hides the coordinate ticks to keep the sheet compact', async () => {
    const page = await createPage('/', { viewport: phone, reducedMotion: 'reduce' })

    expect(await page.getByText('A', { exact: true }).isVisible()).toBe(false)
    await page.close()
  })

  it('does not overflow horizontally', async () => {
    const page = await createPage('/', { viewport: phone, reducedMotion: 'no-preference' })
    await page.reload({ waitUntil: 'networkidle' })

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(overflow).toBeLessThanOrEqual(0)
    await page.close()
  })
})
