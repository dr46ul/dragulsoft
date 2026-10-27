import type { Locator, Page } from 'playwright-core'

export const desktop = { width: 1440, height: 900 }
export const phone = { width: 390, height: 844 }
export const shortPhone = { width: 375, height: 667 }
const stickyTop = 64

export const spec = { stage: 2, name: 'Scoped on paper before a line of code.', status: 'For approval' }
export const design = { stage: 3, name: 'Every state designed before it’s built.', status: 'Approved' }
export const build = { stage: 4, name: 'Built in the open. Demoed every week.', status: 'In build' }
export const launch = { stage: 5, name: 'Launched, then looked after.', status: 'Issued · live' }
export const chapters = [spec, design, build, launch]
export const answer = 'North, up 18% on last week. Mostly repeat customers. Want it broken down by product?'

export function sheetBand(page: Page) {
  return page.getByRole('figure').locator('..')
}

export function chapterHeading(page: Page, name: string) {
  return page.getByRole('heading', { level: 2, name })
}

// Scrolls the way a reader would, then waits out the sheet's scrub smoothing.
export async function scrollToReadingLine(page: Page, name: string) {
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

export async function scrollToTop(page: Page) {
  await page.evaluate(() => window.scrollTo(0, 0))
}

export function stageLabel(page: Page, stage: number) {
  return page.getByText(`Stage 0${stage} / 05`)
}

export function titleBlockValue(page: Page, label: string) {
  return page.locator(`tr:has(th:text-is("${label}")) td`)
}

// Playwright counts an element at opacity 0 as visible, so fading is read off the element and everything it sits in.
export function effectiveOpacity(locator: Locator) {
  return locator.evaluate((element) => {
    let opacity = 1
    for (let node: Element | null = element; node; node = node.parentElement)
      opacity *= Number(getComputedStyle(node).opacity)
    return opacity
  })
}

export async function horizontalOverflow(page: Page) {
  return page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
}
