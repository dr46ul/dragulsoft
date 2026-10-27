import { createPage } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { setupApp } from './setup'
import { chapterHeading, chapters, horizontalOverflow, phone, scrollToReadingLine, sheetBand, shortPhone, stageLabel } from './story'

await setupApp()

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
