import type { Locator, Page } from 'playwright-core'
import { ENQUIRY_PATH } from '@dragulsoft/adam-protocol'
import { createPage } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { setupApp } from './setup'

await setupApp()

const desktop = { width: 1440, height: 900 }
const phone = { width: 390, height: 844 }
const intake = `https://adam.dragulsoft.dev${ENQUIRY_PATH}`
const cors = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': 'content-type',
  'access-control-allow-methods': 'POST',
}

// Stands in for Adam's intake, recording every brief that reaches it.
async function stubAdam(page: Page) {
  const received: unknown[] = []
  await page.route(intake, async (route) => {
    const request = route.request()
    if (request.method() === 'OPTIONS')
      return route.fulfill({ status: 204, headers: cors })
    received.push(request.postDataJSON())
    return route.fulfill({
      status: 201,
      headers: cors,
      json: { id: 'enquiry-1' },
    })
  })
  return received
}

async function openFromHero(page: Page) {
  await page.locator('#top').getByRole('button', { name: 'Start a project' }).click()
  return page.getByRole('dialog', { name: 'Start a project' })
}

function stepHeading(page: Page, name: string) {
  return page.getByRole('dialog').getByRole('heading', { level: 3, name })
}

async function chooseTiming(dialog: Locator) {
  await dialog.getByRole('radio', { name: 'Just an idea' }).click()
  await dialog.getByRole('radio', { name: 'No fixed date' }).click()
}

async function next(page: Page, heading: string) {
  await page.getByRole('button', { name: 'Next' }).click()
  await stepHeading(page, heading).waitFor()
}

// Counts opacity transitions while moving to the next step. Chips and buttons keep daisyUI's colour fades, so only
// opacity is the step change, and counting events rather than sampling catches a fade shorter than a round trip.
async function stepFadesOnNext(dialog: Locator) {
  await dialog.evaluate((element) => {
    if (!(element instanceof HTMLElement))
      return
    element.dataset.fades = '0'
    element.addEventListener('transitionrun', (event) => {
      if (event.propertyName === 'opacity')
        element.dataset.fades = String(Number(element.dataset.fades) + 1)
    })
  })
  await dialog.getByRole('button', { name: 'Next' }).click()
  await dialog.getByRole('heading', { level: 3, name: 'Connections' }).waitFor()
  await dialog.page().waitForTimeout(600)
  return Number(await dialog.getAttribute('data-fades'))
}

// Presses Tab until the named control has focus, as a keyboard user would.
async function tabTo(page: Page, name: string) {
  const seen: string[] = []
  for (let presses = 0; presses < 80; presses++) {
    const label = await page.evaluate(() => {
      const active = document.activeElement
      if (!(active instanceof HTMLElement))
        return ''
      const labelled = active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement
        ? active.labels?.[0]
        : active
      return active.getAttribute('aria-label') ?? (labelled?.textContent ?? '').trim()
    })
    seen.push(label.slice(0, 40))
    if (label === name)
      return
    await page.keyboard.press('Tab')
  }
  throw new Error(`Tab never reached "${name}" (saw ${seen.slice(0, 12).join(' | ')})`)
}

async function overflowsSideways(page: Page) {
  return page.getByRole('dialog').locator('.modal-box').evaluate(box => box.scrollWidth > box.clientWidth)
}

describe.each([
  ['1440×900', desktop],
  ['390×844', phone],
])('brief wizard at %s', (_, viewport) => {
  it('sends a brief started from the hero and confirms where the reply goes', async () => {
    const page = await createPage('/', { viewport, reducedMotion: 'reduce' })
    const received = await stubAdam(page)

    const dialog = await openFromHero(page)
    await dialog.getByRole('checkbox', { name: 'Web app / SaaS' }).click()
    await dialog.getByRole('checkbox', { name: 'Admin panel' }).click()
    await next(page, 'Connections')
    await next(page, 'Timing & budget')
    await chooseTiming(dialog)
    await dialog.getByRole('radio', { name: '€5–15k' }).click()
    await next(page, 'The problem')
    await dialog.getByRole('textbox', { name: 'What problem should this solve?' }).fill('Orders are re-typed into three spreadsheets.')
    await next(page, 'Done & readiness')
    await next(page, 'Your details')
    await dialog.getByRole('textbox', { name: 'Your name' }).fill('Ana')
    await dialog.getByRole('textbox', { name: 'Email' }).fill('ana@example.com')
    await dialog.getByRole('button', { name: 'Send brief' }).click()

    await dialog.getByText('Your brief is in. The reply comes to ana@example.com.').waitFor()
    expect(received).toEqual([
      expect.objectContaining({
        contact: { name: 'Ana', email: 'ana@example.com' },
        scope: {
          kinds: ['app'],
          features: [
            { feature: 'admin', priority: 'must' },
          ],
        },
        timing: { start: 'idea', launch: 'open' },
        budget: { currency: 'EUR', band: '5-15k' },
        source: 'hero',
      }),
    ])
    await page.close()
  })
})

describe('brief wizard when Adam cannot be reached', () => {
  it('says the brief could not be sent and keeps the answers', async () => {
    const page = await createPage('/', { viewport: desktop, reducedMotion: 'reduce' })
    await page.route(intake, route => route.abort('failed'))

    const dialog = await openFromHero(page)
    await dialog.getByRole('checkbox', { name: 'Website' }).click()
    await next(page, 'Connections')
    await next(page, 'Timing & budget')
    await chooseTiming(dialog)
    await next(page, 'The problem')
    await dialog.getByRole('textbox', { name: 'What problem should this solve?' }).fill('Nobody can find our opening hours.')
    await next(page, 'Done & readiness')
    await next(page, 'Your details')
    await dialog.getByRole('textbox', { name: 'Your name' }).fill('Ana')
    await dialog.getByRole('textbox', { name: 'Email' }).fill('ana@example.com')
    await dialog.getByRole('button', { name: 'Send brief' }).click()

    await dialog.getByText('Your brief couldn’t be sent. Your answers are still here.').waitFor()
    expect(await dialog.getByRole('textbox', { name: 'Email' }).inputValue()).toBe('ana@example.com')
    expect(await dialog.getByRole('button', { name: 'Try again' }).isVisible()).toBe(true)
    await page.close()
  })
})

describe('brief wizard layout at 1440×900', () => {
  it('keeps Next in view while a long step scrolls beside the preview', async () => {
    const page = await createPage('/', { viewport: desktop, reducedMotion: 'reduce' })
    const dialog = await openFromHero(page)
    for (const kind of ['Web app / SaaS', 'Website', 'AI integration'])
      await dialog.getByRole('checkbox', { name: kind }).click()

    const box = await dialog.locator('.modal-box').boundingBox()
    const nextButton = await dialog.getByRole('button', { name: 'Next' }).boundingBox()
    expect(box).not.toBeNull()
    expect(nextButton).not.toBeNull()
    expect((nextButton?.y ?? 0) + (nextButton?.height ?? 0)).toBeLessThanOrEqual((box?.y ?? 0) + (box?.height ?? 0))
    expect(await dialog.locator('.modal-box').evaluate(element => element.scrollHeight <= element.clientHeight)).toBe(true)
    await page.close()
  })
})

describe('brief wizard by keyboard', () => {
  it('can be completed and sent without a mouse', async () => {
    const page = await createPage('/', { viewport: desktop, reducedMotion: 'reduce' })
    const received = await stubAdam(page)
    await page.locator('#top').getByRole('button', { name: 'Start a project' }).focus()
    await page.keyboard.press('Enter')
    await expect.poll(() => stepHeading(page, 'Scope').evaluate(heading => heading === document.activeElement)).toBe(true)

    await tabTo(page, 'Website')
    await page.keyboard.press('Space')
    await tabTo(page, 'Next')
    await page.keyboard.press('Enter')
    await stepHeading(page, 'Connections').waitFor()
    await tabTo(page, 'Next')
    await page.keyboard.press('Enter')
    await stepHeading(page, 'Timing & budget').waitFor()
    await tabTo(page, 'Just an idea')
    await page.keyboard.press('Space')
    await tabTo(page, 'As soon as possible')
    await page.keyboard.press('Space')
    await tabTo(page, 'Next')
    await page.keyboard.press('Enter')
    await stepHeading(page, 'The problem').waitFor()
    await tabTo(page, 'What problem should this solve?')
    await page.keyboard.type('Nobody can find our opening hours.')
    await tabTo(page, 'Next')
    await page.keyboard.press('Enter')
    await stepHeading(page, 'Done & readiness').waitFor()
    await tabTo(page, 'Next')
    await page.keyboard.press('Enter')
    await stepHeading(page, 'Your details').waitFor()
    await tabTo(page, 'Your name')
    await page.keyboard.type('Ana')
    await tabTo(page, 'Email')
    await page.keyboard.type('ana@example.com')
    // Enter in a text field submits the step, as the button does.
    await page.keyboard.press('Enter')

    await page.getByText('Your brief is in. The reply comes to ana@example.com.').waitFor()
    expect(received).toEqual([
      expect.objectContaining({
        scope: {
          kinds: ['site'],
          features: [],
        },
        timing: { start: 'idea', launch: 'asap' },
      }),
    ])
    await page.close()
  })
})

describe('brief wizard under reduced motion', () => {
  it('switches steps without a transition', async () => {
    const page = await createPage('/', { viewport: desktop, reducedMotion: 'reduce' })
    const dialog = await openFromHero(page)
    await dialog.getByRole('checkbox', { name: 'Website' }).click()

    expect(await stepFadesOnNext(dialog)).toBe(0)
    await page.close()
  })

  it('cross-fades steps when motion is allowed', async () => {
    const page = await createPage('/', { viewport: desktop, reducedMotion: 'no-preference' })
    const dialog = await openFromHero(page)
    await dialog.getByRole('checkbox', { name: 'Website' }).click()

    expect(await stepFadesOnNext(dialog)).toBeGreaterThan(0)
    await page.close()
  })
})

describe.each([360, 390])('brief wizard on a %ipx phone', (width) => {
  it('fits every step without sideways scrolling', async () => {
    const page = await createPage('/', {
      viewport: { width, height: 800 },
      reducedMotion: 'reduce',
    })
    const dialog = await openFromHero(page)
    await dialog.getByRole('checkbox', { name: 'Web app / SaaS' }).click()
    await dialog.getByRole('checkbox', { name: 'Website' }).click()
    await dialog.getByRole('checkbox', { name: 'AI integration' }).click()
    await dialog.getByRole('checkbox', { name: 'Dashboards & reports' }).click()
    expect(await overflowsSideways(page)).toBe(false)

    for (const heading of ['Connections', 'Timing & budget']) {
      await next(page, heading)
      expect(await overflowsSideways(page)).toBe(false)
    }
    await chooseTiming(dialog)
    await next(page, 'The problem')
    expect(await overflowsSideways(page)).toBe(false)
    await dialog.getByRole('textbox', { name: 'What problem should this solve?' }).fill('Nobody can find our opening hours.')
    for (const heading of ['Done & readiness', 'Your details']) {
      await next(page, heading)
      expect(await overflowsSideways(page)).toBe(false)
    }
    await page.close()
  })
})
