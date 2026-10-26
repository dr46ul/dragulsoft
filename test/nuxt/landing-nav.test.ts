import { renderSuspended } from '@nuxt/test-utils/runtime'
import { fireEvent, screen, within } from '@testing-library/vue'
import { beforeEach, describe, expect, it } from 'vitest'
import { clearNuxtState } from '#imports'
import LandingNav from '~/components/landing/LandingNav.vue'
import { useEnquiry } from '~/composables/useEnquiry'

const sectionLinks = [
  ['Process', '#process'],
  ['Services', '#services'],
  ['Who it’s for', '#clients'],
  ['Working together', '#notes'],
]

describe('landing navigation', () => {
  beforeEach(() => {
    clearNuxtState()
  })

  it('names its link landmark "Main" and lists the four sections in order', async () => {
    await renderSuspended(LandingNav)

    const links = within(screen.getByRole('navigation', { name: 'Main' })).getAllByRole('link')

    expect(links.map(link => [
      link.textContent?.trim(),
      link.getAttribute('href'),
    ])).toEqual(sectionLinks)
  })

  it('links the brand, with its descriptor, back to the top of the page', async () => {
    await renderSuspended(LandingNav)

    const brand = screen.getByRole('link', { name: 'Dragulsoft, back to top' })

    expect(brand.getAttribute('href')).toBe('#top')
    expect(brand.textContent).toContain('Independent software practice')
  })

  it('opens the menu from its button and closes it once a link is chosen', async () => {
    await renderSuspended(LandingNav)
    const button = screen.getByLabelText('Open menu')
    const menu = button.closest('details')
    if (!menu)
      throw new Error('The menu button is not inside a dropdown')

    await fireEvent.click(button)
    expect(menu.open).toBe(true)

    await fireEvent.click(within(menu).getByRole('link', { name: 'Services' }))
    expect(menu.open).toBe(false)
  })

  describe('start a project button', () => {
    it('is not rendered while the enquiry entry point is unavailable', async () => {
      await renderSuspended(LandingNav)

      expect(screen.queryByRole('button', { name: 'Start a project' })).toBeNull()
    })

    it('opens the enquiry from the nav once the entry point is available', async () => {
      useEnquiry().markAvailable()
      await renderSuspended(LandingNav)

      await fireEvent.click(screen.getByRole('button', { name: 'Start a project' }))

      const enquiry = useEnquiry()
      expect(enquiry.open.value).toBe(true)
      expect(enquiry.source.value).toBe('nav')
    })
  })
})
