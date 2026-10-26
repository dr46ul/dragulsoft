import type { Locator, Page } from 'playwright-core'
import { createPage } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { setupApp } from './setup'

await setupApp()

const desktop = { width: 1440, height: 900 }
const phone = { width: 390, height: 844 }
const shortPhone = { width: 375, height: 667 }
const stickyTop = 64

const spec = { stage: 2, name: 'Scoped on paper before a line of code.', status: 'For approval' }
const design = { stage: 3, name: 'Every state designed before it’s built.', status: 'Approved' }
const build = { stage: 4, name: 'Built in the open. Demoed every week.', status: 'In build' }
const launch = { stage: 5, name: 'Launched, then looked after.', status: 'Issued · live' }
const chapters = [spec, design, build, launch]
const answer = 'North, up 18% on last week. Mostly repeat customers. Want it broken down by product?'

function sheetBand(page: Page) {
  return page.getByRole('figure').locator('..')
}

function chapterHeading(page: Page, name: string) {
  return page.getByRole('heading', { level: 2, name })
}

// Scrolls the way a reader would, then waits out the sheet's scrub smoothing.
async function scrollToReadingLine(page: Page, name: string) {
  const heading = chapterHeading(page, name)
  const isDesktop = (page.viewportSize()?.width ?? 0) >= 1024
  for (let pass = 0; pass < 2; pass++) {
    const bandHeight = await sheetBand(page).evaluate(band => band.getBoundingClientRect().height)
    await heading.evaluate((element, { isDesktop, bandHeight, stickyTop }) => {
      const chapter = element.closest('article')
      if (!chapter)
        throw new Error('The heading is not inside a chapter.')
      const rect = chapter.getBoundingClientRect()
      const target = isDesktop
        ? window.innerHeight * 0.55 - rect.height / 2
        : stickyTop + bandHeight + 16
      window.scrollBy(0, rect.top - target)
    }, { isDesktop, bandHeight, stickyTop })
    await page.waitForTimeout(100)
  }
}

async function scrollToTop(page: Page) {
  await page.evaluate(() => window.scrollTo(0, 0))
}

function stageLabel(page: Page, stage: number) {
  return page.getByText(`Stage 0${stage} / 05`)
}

function titleBlockValue(page: Page, label: string) {
  return page.locator(`tr:has(th:text-is("${label}")) td`)
}

// Playwright counts an element at opacity 0 as visible, so fading is read off the element and everything it sits in.
function effectiveOpacity(locator: Locator) {
  return locator.evaluate((element) => {
    let opacity = 1
    for (let node: Element | null = element; node; node = node.parentElement)
      opacity *= Number(getComputedStyle(node).opacity)
    return opacity
  })
}

async function horizontalOverflow(page: Page) {
  return page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
}

describe('the story on desktop with motion allowed', () => {
  it('moves the stage count and title block along as each chapter reaches the reading line', async () => {
    const page = await createPage('/', { viewport: desktop, reducedMotion: 'no-preference' })
    await stageLabel(page, 1).waitFor()

    for (const { stage, name, status } of chapters) {
      await scrollToReadingLine(page, name)

      await stageLabel(page, stage).waitFor({ timeout: 5000 })
      await expect.poll(() => titleBlockValue(page, 'Status').textContent(), { timeout: 5000 }).toBe(status)
    }
    await page.close()
  })

  it('counts the figures up and streams the answer in by Build', async () => {
    const page = await createPage('/', { viewport: desktop, reducedMotion: 'no-preference' })
    expect(await page.getByText('1,284').count()).toBe(0)

    await scrollToReadingLine(page, build.name)

    await expect.poll(() => page.getByText('1,284').count(), { timeout: 5000 }).toBe(1)
    await expect.poll(() => page.getByText(answer).filter({ visible: true }).count(), { timeout: 5000 }).toBe(1)
    await page.close()
  })

  it('shows the product live with its stamp at Launch', async () => {
    const page = await createPage('/', { viewport: desktop, reducedMotion: 'no-preference' })

    await scrollToReadingLine(page, launch.name)

    await expect.poll(() => effectiveOpacity(page.getByText('Live', { exact: true })), { timeout: 5000 }).toBeGreaterThan(0.95)
    await expect.poll(() => effectiveOpacity(page.getByText('Issued for production · v1.0')), { timeout: 5000 }).toBeGreaterThan(0.95)
    await page.close()
  })

  it('rewinds to Stage 01 with the brief note back on the sheet when scrolled to the top', async () => {
    const page = await createPage('/', { viewport: desktop, reducedMotion: 'no-preference' })
    await scrollToReadingLine(page, launch.name)
    await stageLabel(page, 5).waitFor({ timeout: 5000 })

    await scrollToTop(page)

    await stageLabel(page, 1).waitFor({ timeout: 5000 })
    await expect.poll(() => effectiveOpacity(page.locator('figure blockquote')), { timeout: 5000 }).toBeGreaterThan(0.95)
    await page.close()
  })

  it('jumps to a stage from its step', async () => {
    const page = await createPage('/', { viewport: desktop, reducedMotion: 'no-preference' })
    await stageLabel(page, 1).waitFor()

    await page.getByRole('button', { name: 'Build' }).click()

    await stageLabel(page, 4).waitFor({ timeout: 10_000 })
    expect(await page.getByRole('button', { name: 'Build' }).getAttribute('aria-current')).toBe('step')
    await page.close()
  })

  it('jumps to the Spec chapter from the hero button', async () => {
    const page = await createPage('/', { viewport: desktop, reducedMotion: 'no-preference' })
    await stageLabel(page, 1).waitFor()

    await page.getByRole('button', { name: 'See how a project runs' }).click()

    await stageLabel(page, 2).waitFor({ timeout: 10_000 })
    await page.close()
  })

  it('dims every chapter but the current one', async () => {
    const page = await createPage('/', { viewport: desktop, reducedMotion: 'no-preference' })
    await scrollToReadingLine(page, design.name)
    await stageLabel(page, 3).waitFor({ timeout: 5000 })

    await expect.poll(() => effectiveOpacity(chapterHeading(page, design.name)), { timeout: 5000 }).toBeGreaterThan(0.95)
    await expect.poll(() => effectiveOpacity(chapterHeading(page, spec.name)), { timeout: 5000 }).toBeLessThan(0.35)
    await expect.poll(() => effectiveOpacity(page.getByRole('heading', { level: 1 })), { timeout: 5000 }).toBeLessThan(0.35)
    await page.close()
  })

  it('pauses the scroll cue once the story has left Brief', async () => {
    const page = await createPage('/', { viewport: desktop, reducedMotion: 'no-preference' })
    const playState = () => page.evaluate(() => {
      const cue = document.querySelector('#top span[class*="scroll-cue"]')
      return cue
        ? getComputedStyle(cue, '::after').animationPlayState
        : 'missing'
    })
    await stageLabel(page, 1).waitFor()
    expect(await playState()).toBe('running')

    await scrollToReadingLine(page, spec.name)
    await stageLabel(page, 2).waitFor({ timeout: 5000 })

    await expect.poll(playState).toBe('paused')
    await page.close()
  })

  it('stops the blinking caret once the sheet has scrolled out of view', async () => {
    const page = await createPage('/', { viewport: desktop, reducedMotion: 'no-preference' })
    await page.getByText(/Every order lives in three spreadsheets/).waitFor({ timeout: 8000 })
    const playState = () => page.locator('figure blockquote span').first().evaluate(caret => getComputedStyle(caret).animationPlayState)
    expect(await playState()).toBe('running')

    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))

    await expect.poll(playState).toBe('paused')
    await page.close()
  })

  it('never overflows sideways, at any stage', async () => {
    const page = await createPage('/', { viewport: desktop, reducedMotion: 'no-preference' })
    await page.reload({ waitUntil: 'networkidle' })
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0)

    for (const { stage, name } of chapters) {
      await scrollToReadingLine(page, name)
      await stageLabel(page, stage).waitFor({ timeout: 5000 })
      expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0)
    }
    await page.close()
  })
})

describe.each([
  { device: 'a phone', viewport: phone },
  { device: 'a short phone', viewport: shortPhone },
])('the story on $device with motion allowed', ({ viewport }) => {
  it('keeps each chapter heading below the pinned sheet when its stage completes', async () => {
    const page = await createPage('/', { viewport, reducedMotion: 'no-preference' })

    for (const { stage, name } of chapters) {
      await scrollToReadingLine(page, name)
      await stageLabel(page, stage).waitFor({ timeout: 5000 })

      const bandBottom = await sheetBand(page).evaluate(band => band.getBoundingClientRect().bottom)
      const headingTop = await chapterHeading(page, name).evaluate(heading => heading.getBoundingClientRect().top)
      expect(headingTop).toBeGreaterThanOrEqual(bandBottom)
    }
    await page.close()
  })

  it('shows the current chapter heading in full', async () => {
    const page = await createPage('/', { viewport, reducedMotion: 'no-preference' })

    for (const { stage, name } of chapters) {
      await scrollToReadingLine(page, name)
      await stageLabel(page, stage).waitFor({ timeout: 5000 })

      const box = await chapterHeading(page, name).boundingBox()
      expect(box?.y).toBeGreaterThanOrEqual(0)
      expect((box?.y ?? 0) + (box?.height ?? 0)).toBeLessThanOrEqual(viewport.height)
    }
    await page.close()
  })

  it('never overflows sideways, at any stage', async () => {
    const page = await createPage('/', { viewport, reducedMotion: 'no-preference' })
    await page.reload({ waitUntil: 'networkidle' })
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0)

    for (const { stage, name } of chapters) {
      await scrollToReadingLine(page, name)
      await stageLabel(page, stage).waitFor({ timeout: 5000 })
      expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0)
    }
    await page.close()
  })

  it('leaves the orders table out of the drawing to leave room to read', async () => {
    const page = await createPage('/', { viewport, reducedMotion: 'reduce' })

    expect(await page.getByText('#4821').isVisible()).toBe(false)
    await page.close()
  })
})

describe.each([
  { device: 'desktop', viewport: desktop },
  { device: 'a phone', viewport: phone },
])('the story on $device under reduced motion', ({ viewport }) => {
  it('never starts the smooth-scroll engine', async () => {
    const page = await createPage('/', { viewport, reducedMotion: 'reduce' })
    await page.waitForLoadState('networkidle')

    expect((await page.locator('html').getAttribute('class')) ?? '').not.toMatch(/\blenis\b/)
    await page.close()
  })

  it('switches to each stage as its chapter reaches the reading line', async () => {
    const page = await createPage('/', { viewport, reducedMotion: 'reduce' })
    await page.waitForLoadState('networkidle')
    await stageLabel(page, 1).waitFor()

    for (const { stage, name } of chapters) {
      await scrollToReadingLine(page, name)

      await stageLabel(page, stage).waitFor({ timeout: 5000 })
    }
    await scrollToTop(page)
    await stageLabel(page, 1).waitFor({ timeout: 5000 })
    await page.close()
  })

  it('shows the whole trend line at Build', async () => {
    const page = await createPage('/', { viewport, reducedMotion: 'reduce' })
    await page.waitForLoadState('networkidle')

    await scrollToReadingLine(page, build.name)
    await stageLabel(page, 4).waitFor({ timeout: 5000 })

    const trend = page.locator('svg path[stroke-width="2"]')
    const clip = await trend.evaluate(path => getComputedStyle(path).clipPath)
    expect(clip).toMatch(/^inset\(0(px|%)?( 0(px|%)?)*\)$/)
    await page.close()
  })

  it('still shows the stage the page was scrolled to after a reload', async () => {
    const page = await createPage('/', { viewport, reducedMotion: 'reduce' })
    await page.waitForLoadState('networkidle')
    await scrollToReadingLine(page, build.name)
    await stageLabel(page, 4).waitFor({ timeout: 5000 })

    await page.reload({ waitUntil: 'networkidle' })

    await stageLabel(page, 4).waitFor({ timeout: 5000 })
    await page.close()
  })
})
