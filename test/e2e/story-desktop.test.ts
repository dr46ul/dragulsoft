import { createPage } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { setupApp } from './setup'
import { answer, build, chapterHeading, chapters, design, desktop, effectiveOpacity, horizontalOverflow, launch, scrollToReadingLine, scrollToTop, spec, stageLabel, titleBlockValue } from './story'

await setupApp()

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
