import type { Page } from 'playwright-core'
import { createPage } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { setupApp } from './setup'

await setupApp()

const stickyOffset = 80
const desktop = { width: 1440, height: 900 }

function stageLabel(page: Page, stage: number) {
  return page.getByText(`Stage 0${stage} / 05`)
}

function runningAnimations(page: Page, selector: string) {
  return page.locator(selector).evaluateAll(elements => elements.flatMap(element => element.getAnimations()).length)
}

async function makeScrollable(page: Page) {
  await page.evaluate(() => {
    const spacer = document.createElement('div')
    spacer.style.height = '3000px'
    const main = document.querySelector('main')
    main?.before(spacer)
    main?.style.setProperty('min-height', '3000px')
  })
}

async function mainTop(page: Page) {
  return page.getByRole('main').evaluate(element => element.getBoundingClientRect().top)
}

describe('motion on a visitor with no preference', () => {
  it('marks the root element for motion and runs the smooth-scroll engine', async () => {
    const page = await createPage('/', { reducedMotion: 'no-preference' })

    await expect.poll(() => page.locator('html').getAttribute('class')).toMatch(/\bmotion\b/)
    await expect.poll(() => page.locator('html').getAttribute('class')).toMatch(/\blenis\b/)
    await page.close()
  })

  it('hides an intro element before anything reveals it, then shows it anyway after a short delay', async () => {
    const page = await createPage('/', { reducedMotion: 'no-preference' })
    await expect.poll(() => page.locator('html').getAttribute('class')).toMatch(/\bmotion\b/)
    await page.evaluate(() => {
      const intro = document.createElement('p')
      intro.dataset.intro = ''
      intro.textContent = 'Intro'
      document.body.append(intro)
    })
    const intro = page.locator('[data-intro]', { hasText: /^Intro$/ })

    await expect(intro.evaluate(element => getComputedStyle(element).visibility)).resolves.toBe('hidden')
    await expect.poll(() => intro.evaluate(element => getComputedStyle(element).visibility), { timeout: 5000 }).toBe('visible')
    await page.close()
  })

  it('lands the main landmark just below the sticky navigation after the skip link', async () => {
    const page = await createPage('/', {
      reducedMotion: 'no-preference',
      viewport: { width: 1440, height: 900 },
    })
    await expect.poll(() => page.locator('html').getAttribute('class')).toMatch(/\blenis\b/)
    await makeScrollable(page)

    await page.keyboard.press('Tab')
    await page.keyboard.press('Enter')

    await expect.poll(() => mainTop(page), { timeout: 10_000 }).toBeCloseTo(stickyOffset, 0)
    await page.close()
  })
})

describe('the launched product on a visitor with no preference', () => {
  it('pings its live indicator', async () => {
    const page = await createPage('/', { viewport: desktop, reducedMotion: 'no-preference' })
    await stageLabel(page, 1).waitFor()

    await page.getByRole('button', { name: 'Launch' }).click()
    await stageLabel(page, 5).waitFor({ timeout: 10_000 })

    await expect.poll(() => runningAnimations(page, '.status-success'), { timeout: 5000 }).toBeGreaterThan(0)
    await page.close()
  })
})

describe('motion on a visitor who prefers reduced motion', () => {
  it('leaves the live indicator still once the product has launched', async () => {
    const page = await createPage('/', { viewport: desktop, reducedMotion: 'reduce' })
    await page.waitForLoadState('networkidle')

    await page.getByRole('button', { name: 'Launch' }).click()
    await stageLabel(page, 5).waitFor({ timeout: 5000 })

    await expect(page.getByText('Live', { exact: true }).evaluate(element => getComputedStyle(element).opacity)).resolves.toBe('1')
    expect(await runningAnimations(page, '.status-success')).toBe(0)
    await page.close()
  })

  it('dims the hero and the other chapters the moment the story moves on, with no fade', async () => {
    const page = await createPage('/', { viewport: desktop, reducedMotion: 'reduce' })
    await page.waitForLoadState('networkidle')

    await page.getByRole('button', { name: 'Spec' }).click()
    await stageLabel(page, 2).waitFor({ timeout: 5000 })

    const dimmed = '#top, [data-chapter]:not([data-stage="1"])'
    expect(await runningAnimations(page, '#top, [data-chapter]')).toBe(0)
    const opacities = await page.locator(dimmed).evaluateAll(elements => elements.map(element => getComputedStyle(element).opacity))
    expect(opacities).toEqual(['0.3', '0.3', '0.3', '0.3'])
    await page.close()
  })

  it('leaves the root element without the motion and smooth-scroll classes', async () => {
    const page = await createPage('/', { reducedMotion: 'reduce' })
    await page.waitForLoadState('networkidle')

    const classes = await page.locator('html').getAttribute('class')
    expect(classes ?? '').not.toMatch(/\bmotion\b/)
    expect(classes ?? '').not.toMatch(/\blenis\b/)
    await page.close()
  })

  it('jumps the main landmark to just below the top of the viewport after the skip link', async () => {
    const page = await createPage('/', {
      reducedMotion: 'reduce',
      viewport: { width: 1440, height: 900 },
    })
    await page.waitForLoadState('networkidle')
    await makeScrollable(page)

    await page.keyboard.press('Tab')
    await page.keyboard.press('Enter')

    const top = await mainTop(page)
    expect(top).toBeGreaterThanOrEqual(0)
    expect(top).toBeLessThanOrEqual(stickyOffset)
    await page.close()
  })
})
