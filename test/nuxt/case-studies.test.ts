import type { CaseStudy } from '~/utils/case-study'
import { renderSuspended } from '@nuxt/test-utils/runtime'
import { screen, within } from '@testing-library/vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import CaseStudies from '~/components/CaseStudies.vue'
import { requestReducedMotion } from './reduced-motion'

const data = vi.hoisted((): { list: CaseStudy[] } => ({ list: [] }))

vi.mock('~/data/case-studies', () => ({
  get caseStudies() {
    return data.list
  },
}))

const northwind = {
  title: 'Dispatch board',
  summary: 'A live board that replaced the dispatchers’ spreadsheet.',
  client: 'Northwind Freight',
  market: 'Logistics',
  disciplines: ['web-app', 'ai-integration'],
} satisfies CaseStudy

beforeEach(() => {
  data.list = []
  // Entrances would leave the cards invisible to role queries, and motion isn't what these tests are about.
  requestReducedMotion(true)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('case studies section', () => {
  it('renders nothing at all while there are no case studies', async () => {
    const { container } = await renderSuspended(CaseStudies)

    expect(container.querySelector('#work')).toBeNull()
    expect(screen.queryByText('Drawings on file.')).toBeNull()
    expect(container.textContent?.trim()).toBe('')
  })

  it('renders the section with its heading and lede once there is a case study', async () => {
    data.list = [northwind]

    await renderSuspended(CaseStudies)

    const section = screen.getByRole('region', { name: 'Drawings on file.' })
    expect(section.id).toBe('work')
    expect(screen.getByText('Sheet 05 · Case studies')).toBeTruthy()
    expect(screen.getByText('Case studies are published here as projects launch, each one with the client’s permission.')).toBeTruthy()
  })

  it('draws a case study with its title heading, summary and title-block rows', async () => {
    data.list = [northwind]

    await renderSuspended(CaseStudies)

    expect(screen.getByRole('heading', { level: 3, name: 'Dispatch board' })).toBeTruthy()
    expect(screen.getByText(northwind.summary)).toBeTruthy()
    const table = screen.getByRole('table')
    expect(within(table).getByRole('rowheader', { name: 'Client' }).nextElementSibling?.textContent).toBe('Northwind Freight')
    expect(within(table).getByRole('rowheader', { name: 'Market' }).nextElementSibling?.textContent).toBe('Logistics')
    const disciplines = within(table).getByRole('rowheader', { name: 'Disciplines' }).nextElementSibling
    expect(disciplines?.textContent).toContain('Web apps & SaaS')
    expect(disciplines?.textContent).toContain('AI integrations')
    expect(disciplines?.textContent).not.toContain('Websites')
  })

  it('shows a confidential client as "Confidential client"', async () => {
    data.list = [
      { ...northwind, client: 'confidential' },
    ]

    await renderSuspended(CaseStudies)

    expect(screen.getByText('Confidential client')).toBeTruthy()
    expect(screen.queryByText('confidential')).toBeNull()
  })

  it('draws one card per case study, in list order', async () => {
    data.list = [
      { ...northwind, title: 'First' },
      { ...northwind, title: 'Second' },
      { ...northwind, title: 'Third' },
    ]

    await renderSuspended(CaseStudies)

    const items = screen.getAllByRole('listitem')
    expect(items.map(item => within(item).getByRole('heading', { level: 3 }).textContent)).toEqual(['First', 'Second', 'Third'])
  })
})
