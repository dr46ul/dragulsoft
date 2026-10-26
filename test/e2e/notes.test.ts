import { createPage } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { setupApp } from './setup'

await setupApp()

async function openNotes(width: number, height: number) {
  const page = await createPage('/', {
    viewport: { width, height },
    reducedMotion: 'reduce',
  })
  await page.reload({ waitUntil: 'networkidle' })
  return page
}

async function noteBoxes(page: Awaited<ReturnType<typeof openNotes>>) {
  return page.locator('#notes ol > li').evaluateAll(items =>
    items.map((item) => {
      const { top, left, width } = item.getBoundingClientRect()
      return { top, left, width }
    }),
  )
}

describe('working together section', () => {
  it('lays the five notes out in one row on desktop', async () => {
    const page = await openNotes(1440, 900)

    const boxes = await noteBoxes(page)
    expect(boxes).toHaveLength(5)
    expect(new Set(boxes.map(box => box.top)).size).toBe(1)
    await page.close()
  })

  it('lays the notes out two per row on a tablet, the fifth spanning both columns', async () => {
    const page = await openNotes(768, 1024)

    const boxes = await noteBoxes(page)
    const [first, second, third, fourth, fifth] = boxes
    if (!first || !second || !third || !fourth || !fifth) {
      throw new Error('expected five notes')
    }
    expect(first.top).toBe(second.top)
    expect(third.top).toBe(fourth.top)
    expect(third.top).toBeGreaterThan(first.top)
    expect(fifth.top).toBeGreaterThan(third.top)
    expect(fifth.left).toBe(first.left)
    expect(fifth.width).toBeCloseTo(second.left + second.width - first.left, 0)
    await page.close()
  })

  it('lays the notes out one per row on a phone', async () => {
    const page = await openNotes(390, 844)

    const boxes = await noteBoxes(page)
    expect(new Set(boxes.map(box => box.top)).size).toBe(5)
    expect(new Set(boxes.map(box => box.left)).size).toBe(1)
    await page.close()
  })

  it.each([390, 768, 1440])('does not overflow horizontally at %ipx wide', async (width) => {
    const page = await openNotes(width, 900)

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(overflow).toBeLessThanOrEqual(0)
    await page.close()
  })
})
