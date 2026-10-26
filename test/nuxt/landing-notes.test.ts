import { renderSuspended } from '@nuxt/test-utils/runtime'
import { screen, within } from '@testing-library/vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import LandingNotes from '~/components/landing/LandingNotes.vue'
import { requestReducedMotion } from './reduced-motion'

const notes = [
  {
    title: 'One accountable lead.',
    copy: 'You deal with the person doing the work, from the first call to launch day. Nothing gets lost in a hand-off.',
  },
  {
    title: 'Scope in writing before code.',
    copy: 'Every engagement starts with a written scope and estimate. Changes are priced before they are built, never after.',
  },
  {
    title: 'A demo every week.',
    copy: 'Working software on a staging link, so you judge progress by using it rather than by reading status reports.',
  },
  {
    title: 'You own everything.',
    copy: 'Code, accounts, domains and data sit in your name from day one. Nothing is held back as leverage.',
  },
  {
    title: 'Handover included.',
    copy: 'Documentation and a walkthrough at the end, so your team or the next developer can pick it up cold.',
  },
]

describe('working together section', () => {
  // The reveal hides the panel until it scrolls into view; reduced motion shows the final state.
  beforeEach(() => {
    requestReducedMotion(true)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('is a region labelled by its heading', async () => {
    await renderSuspended(LandingNotes)

    const region = screen.getByRole('region', { name: 'The terms are on the drawing, not in the small print.' })
    expect(region.id).toBe('notes')
    expect(within(region).getByRole('heading', { level: 2 }).textContent?.trim()).toBe(
      'The terms are on the drawing, not in the small print.',
    )
  })

  it('lists the five notes in order, each with its title and copy', async () => {
    await renderSuspended(LandingNotes)

    const items = within(screen.getByRole('list')).getAllByRole('listitem')
    expect(items).toHaveLength(notes.length)
    notes.forEach((note, index) => {
      const item = items[index]
      if (!item) {
        throw new Error(`missing note ${index + 1}`)
      }
      expect(within(item).getByRole('heading', { level: 3 }).textContent?.trim()).toBe(note.title)
      expect(within(item).getByText(note.copy)).toBeTruthy()
      expect(within(item).getByText(`${index + 1}.`)).toBeTruthy()
    })
  })

  it('names the panel and the scope of the notes in its header', async () => {
    await renderSuspended(LandingNotes)

    expect(screen.getByText('Sheet 04 · Working together')).toBeTruthy()
    expect(screen.getByText('General notes')).toBeTruthy()
    expect(screen.getByText('Apply to every engagement')).toBeTruthy()
  })
})
