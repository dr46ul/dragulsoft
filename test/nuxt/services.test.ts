import { renderSuspended } from '@nuxt/test-utils/runtime'
import { screen, within } from '@testing-library/vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import LandingServices from '~/components/landing/LandingServices.vue'
import { requestReducedMotion } from './reduced-motion'

const disciplines = [
  {
    detail: 'A',
    title: 'Web apps & SaaS',
    promise: 'The product your business runs on.',
    description: 'Customer portals, internal tools, dashboards and SaaS products, from the first usable version to the one that scales.',
    scope: [
      'Accounts, roles & billing',
      'Dashboards & reporting',
      'Integrations with your tools',
      'Admin & back office',
    ],
  },
  {
    detail: 'B',
    title: 'Websites & landing pages',
    promise: 'Sites that load fast and sell clearly.',
    description: 'Marketing sites and landing pages that are quick on any connection, easy for your team to edit, and easy to find.',
    scope: [
      'Content you edit yourself',
      'Several languages',
      'SEO & analytics',
      'Forms that reach you',
    ],
  },
  {
    detail: 'C',
    title: 'AI integrations',
    promise: 'AI wired into the work you already do.',
    description: 'Assistants, document search and automations connected to your own data and tools, with guardrails and costs kept in check.',
    scope: [
      'Assistants on your data',
      'Document extraction',
      'Workflow automation',
      'Evaluation & guardrails',
    ],
  },
]

function cardOf(title: string) {
  const card = screen.getByRole('heading', { level: 3, name: title }).closest('li')
  if (!card)
    throw new Error(`No card around "${title}"`)
  return card
}

describe('services section', () => {
  // Entrance animation hides the cards until they scroll into view; content queries need them present.
  beforeEach(() => {
    requestReducedMotion(true)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('is the services region, labelled by its heading', async () => {
    await renderSuspended(LandingServices)

    const region = screen.getByRole('region', { name: 'Three disciplines, one standard.' })
    expect(region.id).toBe('services')
    expect(screen.getByText('Sheet 02 · Services')).toBeTruthy()
    expect(screen.getByText(/One practice drawing all three keeps the seams out of sight\./)).toBeTruthy()
  })

  it('sets out exactly three cards, each with its title, promise and description', async () => {
    await renderSuspended(LandingServices)

    const titles = screen.getAllByRole('heading', { level: 3 }).map(heading => heading.textContent.trim())
    expect(titles).toEqual(disciplines.map(discipline => discipline.title))
    for (const discipline of disciplines) {
      const card = within(cardOf(discipline.title))
      expect(card.getByText(discipline.promise)).toBeTruthy()
      expect(card.getByText(discipline.description)).toBeTruthy()
    }
  })

  it('lists the typical scope of each discipline in order', async () => {
    await renderSuspended(LandingServices)

    for (const discipline of disciplines) {
      const scope = within(cardOf(discipline.title)).getByRole('list')
      const items = within(scope).getAllByRole('listitem').map(item => item.textContent.trim())
      expect(items).toEqual(discipline.scope)
    }
  })

  it('hides every demo from assistive technology, labels included', async () => {
    await renderSuspended(LandingServices)

    for (const discipline of disciplines) {
      const label = screen.getByText(`Detail ${discipline.detail}`)
      expect(label.closest('[aria-hidden="true"]')).not.toBeNull()
    }
    const scales = screen.getAllByText('Scale 1:1')
    expect(scales).toHaveLength(3)
    for (const scale of scales) {
      expect(scale.closest('[aria-hidden="true"]')).not.toBeNull()
    }
  })
})
