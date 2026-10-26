import { readFileSync } from 'node:fs'
import { createPage } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { setupApp } from './setup'

await setupApp()

const template = readFileSync(new URL('../../app/spa-loading-template.html', import.meta.url), 'utf8')
const desktop = { width: 1440, height: 900 }

async function loaderPage(options: Parameters<typeof createPage>[1] = {}) {
  const page = await createPage(undefined, { viewport: desktop, ...options })
  await page.setContent(template)
  return page
}

describe('the SPA loading template', () => {
  it('covers the viewport and is announced as loading Dragulsoft', async () => {
    const page = await loaderPage()

    const status = page.getByRole('status', { name: 'Loading Dragulsoft' })
    const box = await status.boundingBox()
    expect(box).toEqual({ x: 0, y: 0, ...desktop })
    await page.close()
  })

  it('makes no network requests of its own', async () => {
    const page = await createPage(undefined, { viewport: desktop })
    const requests: string[] = []
    page.on('request', request => requests.push(request.url()))

    await page.setContent(template, { waitUntil: 'networkidle' })

    expect(requests).toEqual([])
    await page.close()
  })

  it('is the same colour as the site behind it', async () => {
    const site = await createPage('/', { viewport: desktop })
    // Not falling back to the body: a missing .bg-drafting would make the comparison meaningless.
    const siteColour = await site.locator('.bg-drafting').first().evaluate(element => getComputedStyle(element).backgroundColor)
    await site.close()
    const page = await loaderPage()

    const loaderColour = await page.getByRole('status').evaluate(element => getComputedStyle(element).backgroundColor)

    expect(loaderColour).toBe(siteColour)
    await page.close()
  })

  it('keeps drawing the brand mark when motion is allowed', async () => {
    const page = await loaderPage({ reducedMotion: 'no-preference' })

    const durations = await page.evaluate(() => document.getAnimations().map(animation => animation.effect?.getTiming().duration))

    expect(durations.length).toBeGreaterThan(0)
    expect(new Set(durations)).toEqual(new Set([2600]))
    await page.close()
  })

  it('shows the finished mark with nothing animating under reduced motion', async () => {
    const page = await loaderPage({ reducedMotion: 'reduce' })

    const running = await page.evaluate(() => document.getAnimations().length)

    expect(running).toBe(0)
    await page.close()
  })
})
