import { renderSuspended } from '@nuxt/test-utils/runtime'
import { screen } from '@testing-library/vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import RevealFixture from './fixtures/RevealFixture.vue'
import { requestReducedMotion } from './reduced-motion'

const headingText = 'Software drawn up properly'

// Role queries skip anything hidden from view, so a block still waiting to be revealed is not found by them.
function visibleBlocks() {
  return {
    heading: screen.queryByRole('heading', { name: headingText }),
    quote: screen.queryByRole('figure'),
    items: screen.queryAllByRole('listitem'),
  }
}

describe('reveal composable', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('splits the heading into words and still announces it as one sentence', async () => {
    requestReducedMotion(false)

    await renderSuspended(RevealFixture)

    const heading = screen.getByRole('heading', { name: headingText })
    expect(heading.children.length).toBeGreaterThan(0)
  })

  it('keeps a stagger list itself in view while its items arrive, and ends with everything on show', async () => {
    requestReducedMotion(false)

    await renderSuspended(RevealFixture)

    expect(screen.getByRole('list')).toBeTruthy()
    await vi.waitFor(() => {
      const { heading, quote, items } = visibleBlocks()
      expect(heading).not.toBeNull()
      expect(quote).not.toBeNull()
      expect(items.map(item => item.textContent.trim())).toEqual(['Specify', 'Design', 'Build'])
    }, { timeout: 5000 })
  })

  it('leaves everything unsplit and on show straight away when reduced motion is requested', async () => {
    requestReducedMotion(true)

    await renderSuspended(RevealFixture)

    const { heading, quote, items } = visibleBlocks()
    expect(heading?.children).toHaveLength(0)
    expect(heading?.textContent.trim()).toBe(headingText)
    expect(quote?.textContent.trim()).toBe('One accountable lead from first sketch to launch.')
    expect(items.map(item => item.textContent.trim())).toEqual(['Specify', 'Design', 'Build'])
  })

  it('restores the heading text when the section unmounts', async () => {
    requestReducedMotion(false)
    const { unmount } = await renderSuspended(RevealFixture)
    const heading = screen.getByRole('heading', { name: headingText })
    expect(heading.children.length).toBeGreaterThan(0)

    unmount()

    expect(heading.children).toHaveLength(0)
    expect(heading.textContent.trim()).toBe(headingText)
  })
})
