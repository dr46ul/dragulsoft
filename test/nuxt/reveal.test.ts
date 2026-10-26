import { renderSuspended } from '@nuxt/test-utils/runtime'
import { screen } from '@testing-library/vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import RevealFixture from './fixtures/RevealFixture.vue'
import { requestReducedMotion } from './reduced-motion'

const headingText = 'Software drawn up properly'

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

  it('holds a rise block and each child of a stagger list ready to animate, but not the list itself', async () => {
    requestReducedMotion(false)

    await renderSuspended(RevealFixture)

    const paragraph = screen.getByText(/accountable lead/)
    const list = screen.getByRole('list')
    expect(paragraph.style.opacity).not.toBe('')
    expect(list.style.opacity).toBe('')
    const items = list.querySelectorAll('li')
    expect(items).toHaveLength(3)
    for (const item of items) {
      expect(item.style.opacity).not.toBe('')
    }
  })

  it('leaves everything unsplit and fully visible when reduced motion is requested', async () => {
    requestReducedMotion(true)

    await renderSuspended(RevealFixture)

    const heading = screen.getByRole('heading', { name: headingText })
    expect(heading.children).toHaveLength(0)
    expect(heading.textContent.trim()).toBe(headingText)
    const revealed = [
      heading,
      ...screen.getAllByText(/accountable lead|Specify|Design|Build/),
    ]
    for (const element of revealed) {
      expect(element.style.opacity).toBe('')
      expect(element.style.visibility).toBe('')
      expect(element.style.transform).toBe('')
    }
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
