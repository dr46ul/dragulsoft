import { createPage } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { setupApp } from './setup'
import { build, chapters, desktop, phone, scrollToReadingLine, scrollToTop, stageLabel } from './story'

await setupApp()

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
