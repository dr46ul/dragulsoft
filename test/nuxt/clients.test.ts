import { renderSuspended } from '@nuxt/test-utils/runtime'
import { screen, within } from '@testing-library/vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import LandingClients from '~/components/landing/LandingClients.vue'
import { requestReducedMotion } from './reduced-motion'

const schedule = [
  {
    ref: 'C-01',
    who: 'Founders',
    copy: 'A first version real users can pay for, built so it doesn’t need a rewrite six months later.',
    tags: ['Web app', 'MVP'],
  },
  {
    ref: 'C-02',
    who: 'Growing businesses',
    copy: 'Software shaped around how you actually work, replacing the spreadsheets, copy-paste and inbox juggling.',
    tags: ['Internal tools', 'Automation'],
  },
  {
    ref: 'C-03',
    who: 'Agencies & studios',
    copy: 'Senior build capacity for client projects, delivered to your standards and your deadlines.',
    tags: ['Websites', 'Web apps'],
  },
  {
    ref: 'C-04',
    who: 'Product teams',
    copy: 'An extra pair of hands for a feature, an AI integration or a migration, working inside your codebase and process.',
    tags: ['AI integration', 'Features'],
  },
]

describe('clients section', () => {
  beforeEach(() => {
    requestReducedMotion(true)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('is a region labelled by its heading, anchored at #clients', async () => {
    await renderSuspended(LandingClients)

    const region = screen.getByRole('region', { name: 'Different markets. Same drawing board.' })
    expect(region.id).toBe('clients')
    expect(within(region).getByRole('heading', { level: 2 }).textContent?.trim()).toBe('Different markets. Same drawing board.')
  })

  it('states that the method stays the same whatever the industry', async () => {
    await renderSuspended(LandingClients)

    expect(screen.getByText('Whatever the industry, the method doesn’t change. Only the brief does.')).toBeTruthy()
    expect(screen.getByText('Sheet 03 · Who it’s for')).toBeTruthy()
  })

  it('lists the four kinds of client in order, each with title, copy, reference and typical work', async () => {
    await renderSuspended(LandingClients)

    const headings = screen.getAllByRole('heading', { level: 3 })
    expect(headings.map(heading => heading.textContent?.trim())).toEqual(schedule.map(entry => entry.who))

    for (const entry of schedule) {
      const item = screen.getByRole('heading', { level: 3, name: entry.who }).closest('li')
      expect(item).not.toBeNull()
      if (!item)
        continue
      const scoped = within(item)
      expect(scoped.getByText(entry.copy)).toBeTruthy()
      expect(scoped.getByText(entry.ref)).toBeTruthy()
      const tags = within(scoped.getByRole('list', { name: 'Typical work' })).getAllByRole('listitem')
      expect(tags.map(tag => tag.textContent?.trim())).toEqual(entry.tags)
    }
  })
})
