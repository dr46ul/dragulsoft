import { renderSuspended } from '@nuxt/test-utils/runtime'
import userEvent from '@testing-library/user-event'
import { screen } from '@testing-library/vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { clearNuxtState, useAppConfig } from '#imports'
import LandingHero from '~/components/landing/LandingHero.vue'
import { useEnquiry } from '~/composables/useEnquiry'

function requestReducedMotion(reduce: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: reduce && query === '(prefers-reduced-motion: reduce)',
  }))
}

describe('hero', () => {
  beforeEach(() => {
    clearNuxtState()
    requestReducedMotion(true)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('announces the headline as one sentence', async () => {
    await renderSuspended(LandingHero)

    expect(screen.getByRole('heading', {
      level: 1,
      name: 'Software, drawn up properly and built to ship.',
    })).toBeTruthy()
  })

  it('names the practice, the three disciplines and the accountable lead in the lede, taking the name from brand config', async () => {
    const { brand } = useAppConfig()

    await renderSuspended(LandingHero)

    expect(screen.getByText(
      `${brand.name} is an independent software practice building web apps, websites and AI integrations for businesses in any market, with one accountable lead from first sketch to launch.`,
    )).toBeTruthy()
  })

  it('lists the three offers in the eyebrow', async () => {
    await renderSuspended(LandingHero)

    expect(screen.getByText('Sheet 01 · Web apps · Websites · AI integrations')).toBeTruthy()
  })

  it('names the section for assistive technology', async () => {
    await renderSuspended(LandingHero)

    expect(screen.getByRole('region', { name: 'How a project runs' })).toBeTruthy()
  })

  it('fills the title block for the project at the Brief stage', async () => {
    const { brand } = useAppConfig()

    await renderSuspended(LandingHero)

    const rows = Object.fromEntries(
      Array.from(document.querySelectorAll('tr'), row => [row.querySelector('th')?.textContent, row.querySelector('td')?.textContent]),
    )
    expect(rows).toEqual({
      'Project': 'Order desk',
      'Client': 'Example',
      'Drawn by': brand.name,
      'Stage': '01 · Brief',
      'Status': 'Received',
      'Rev': '—',
    })
  })

  it('labels the sheet as an example and describes it once for assistive technology', async () => {
    await renderSuspended(LandingHero)

    const figure = screen.getByRole('figure', { name: 'Example product · not a client project' })
    expect(figure.textContent).toContain('An order dashboard with an AI assistant, drawn at the Brief stage.')
  })

  it('keeps the drawing out of the accessibility tree', async () => {
    await renderSuspended(LandingHero)

    expect(screen.queryByRole('table')).toBeNull()
    expect(screen.queryByRole('list')).toBeNull()
  })

  it('still announces the headline as one sentence once the intro has split it into words', async () => {
    requestReducedMotion(false)

    await renderSuspended(LandingHero)

    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading.children.length).toBeGreaterThan(0)
    expect(screen.getByRole('heading', { name: 'Software, drawn up properly and built to ship.' })).toBe(heading)
  })

  it('starts the brief empty when the intro types it out', async () => {
    requestReducedMotion(false)

    await renderSuspended(LandingHero)

    expect(screen.queryByText(/Every order lives in three spreadsheets/)).toBeNull()
    expect(screen.getByText('Client brief · received')).toBeTruthy()
  })

  it('offers no way to start a project while the enquiry entry point is unavailable', async () => {
    await renderSuspended(LandingHero)

    expect(screen.queryByRole('button', { name: 'Start a project' })).toBeNull()
  })

  it('opens the enquiry entry point from the hero once it is available', async () => {
    const enquiry = useEnquiry()
    enquiry.markAvailable()
    await renderSuspended(LandingHero)

    await userEvent.click(screen.getByRole('button', { name: 'Start a project' }))

    expect(enquiry.open.value).toBe(true)
    expect(enquiry.source.value).toBe('hero')
  })

  it('shows the whole client brief at once under reduced motion', async () => {
    await renderSuspended(LandingHero)

    expect(screen.getByText('“Every order lives in three spreadsheets. We need one place to see them, and to just ask it questions.”')).toBeTruthy()
    expect(screen.getByText('Client brief · received')).toBeTruthy()
  })
})
