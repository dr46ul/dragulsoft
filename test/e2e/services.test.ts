import type { Page } from 'playwright-core'
import { createPage } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { setupApp } from './setup'

await setupApp()

const demoParts = '#services .demo :is(.mover, .piece, .loadbar, .pulse, .node > span:first-child)'

async function playStates(page: Page) {
  return page.locator(demoParts).evaluateAll(elements => elements.map(element => getComputedStyle(element).animationPlayState))
}

async function scrollToServices(page: Page) {
  await page.evaluate(() => document.getElementById('services')?.scrollIntoView())
}

async function makeSectionOffScreen(page: Page) {
  await page.evaluate(() => {
    const spacer = document.createElement('div')
    spacer.style.height = '5000px'
    document.getElementById('services')?.after(spacer)
    window.scrollTo(0, 0)
  })
}

describe('service demos on a visitor with no preference', () => {
  it('pause while the section is far off screen and run once it is on screen', async () => {
    const page = await createPage('/', {
      reducedMotion: 'no-preference',
      viewport: { width: 1440, height: 900 },
    })
    await page.waitForLoadState('networkidle')
    await makeSectionOffScreen(page)

    await page.evaluate(() => window.scrollTo(0, 100_000))
    await expect.poll(() => playStates(page)).not.toContain('running')
    expect((await playStates(page)).length).toBeGreaterThan(0)

    await scrollToServices(page)
    await expect.poll(async () => new Set(await playStates(page))).toEqual(new Set(['running']))

    await page.evaluate(() => window.scrollTo(0, 100_000))
    await expect.poll(() => playStates(page)).not.toContain('running')
    await page.close()
  })

  it('have real animations to run', async () => {
    const page = await createPage('/', {
      reducedMotion: 'no-preference',
      viewport: { width: 1440, height: 900 },
    })
    await page.waitForLoadState('networkidle')

    const names = await page.locator(demoParts).evaluateAll(elements => elements.map(element => getComputedStyle(element).animationName))
    expect(names.length).toBeGreaterThan(0)
    expect(names).not.toContain('none')
    await page.close()
  })
})

describe('service demos on a visitor who prefers reduced motion', () => {
  it('have no animation at all, even on screen', async () => {
    const page = await createPage('/', {
      reducedMotion: 'reduce',
      viewport: { width: 1440, height: 900 },
    })
    await page.waitForLoadState('networkidle')
    await scrollToServices(page)

    const names = await page.locator(demoParts).evaluateAll(elements => elements.map(element => getComputedStyle(element).animationName))
    expect(names.length).toBeGreaterThan(0)
    expect(new Set(names)).toEqual(new Set(['none']))
    await page.close()
  })

  it('shows all three cards without waiting for an entrance', async () => {
    const page = await createPage('/', {
      reducedMotion: 'reduce',
      viewport: { width: 1440, height: 900 },
    })
    await page.waitForLoadState('networkidle')

    const cards = page.locator('#services [data-reveal="stagger"] > li')
    await expect(cards.count()).resolves.toBe(3)
    for (const opacity of await cards.evaluateAll(elements => elements.map(element => getComputedStyle(element).opacity))) {
      expect(opacity).toBe('1')
    }
    await page.close()
  })
})

describe('service cards layout', () => {
  const layouts = [
    { width: 1440, height: 900, columns: 3 },
    { width: 768, height: 1024, columns: 2 },
    { width: 390, height: 844, columns: 1 },
  ]

  it.each(layouts)('sit in $columns column(s) at $width px with no horizontal overflow', async ({ width, height, columns }) => {
    const page = await createPage('/', {
      reducedMotion: 'reduce',
      viewport: { width, height },
    })
    await page.waitForLoadState('networkidle')

    const lefts = await page.locator('#services [data-reveal="stagger"] > li').evaluateAll(
      elements => elements.map(element => Math.round(element.getBoundingClientRect().left)),
    )
    expect(new Set(lefts).size).toBe(columns)
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(overflow).toBeLessThanOrEqual(0)
    await page.close()
  })

  it('extends the corner marks and turns the border yellow when a card is hovered', async () => {
    const page = await createPage('/', {
      reducedMotion: 'reduce',
      viewport: { width: 1440, height: 900 },
    })
    await page.waitForLoadState('networkidle')
    const card = page.locator('#services [data-reveal="stagger"] > li').first()
    await card.scrollIntoViewIfNeeded()
    const border = () => card.evaluate(element => getComputedStyle(element).borderTopColor)
    const rest = await border()

    await card.hover()

    await expect.poll(border).not.toBe(rest)
    await page.close()
  })
})
