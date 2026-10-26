import { renderSuspended } from '@nuxt/test-utils/runtime'
import { fireEvent, screen } from '@testing-library/vue'
import { beforeEach, describe, expect, it } from 'vitest'
import { clearNuxtState } from '#imports'
import LandingFooter from '~/components/landing/LandingFooter.vue'
import { useEnquiry } from '~/composables/useEnquiry'

describe('landing footer', () => {
  beforeEach(() => {
    clearNuxtState()
  })

  it('is the content-info landmark', async () => {
    await renderSuspended(LandingFooter)

    expect(screen.getByRole('contentinfo')).toBeTruthy()
  })

  it('names the practice and its owner once, in the drawn-by cell', async () => {
    await renderSuspended(LandingFooter)

    expect(screen.getByText('Independent software practice. Run by Pavel Padrón.')).toBeTruthy()
    expect(screen.getAllByText(/Pavel Padrón/)).toHaveLength(1)
  })

  it('leaves out the contact cell while the enquiry entry point is unavailable', async () => {
    await renderSuspended(LandingFooter)

    expect(screen.queryByText('Contact')).toBeNull()
    expect(screen.queryByRole('button', { name: 'Start a project' })).toBeNull()
  })

  it('opens the enquiry entry point from the footer once it is available', async () => {
    const enquiry = useEnquiry()
    enquiry.markAvailable()
    await renderSuspended(LandingFooter)

    await fireEvent.click(screen.getByRole('button', { name: 'Start a project' }))

    expect(enquiry.open.value).toBe(true)
    expect(enquiry.source.value).toBe('footer')
  })

  it('links the three disciplines to the services section', async () => {
    await renderSuspended(LandingFooter)

    for (const name of ['Web apps & SaaS', 'Websites & landing pages', 'AI integrations']) {
      expect(screen.getByRole('link', { name }).getAttribute('href')).toBe('#services')
    }
  })

  it('closes the sheet set with its count, the current year and a link back to the top', async () => {
    await renderSuspended(LandingFooter)

    expect(screen.getByText('06 of 06')).toBeTruthy()
    expect(screen.getByText(`© ${new Date().getFullYear()} Dragulsoft`)).toBeTruthy()
    expect(screen.getByRole('link', { name: /Back to top/ }).getAttribute('href')).toBe('#top')
  })

  it('offers no email address', async () => {
    useEnquiry().markAvailable()
    const { container } = await renderSuspended(LandingFooter)

    expect(container.querySelector('a[href^="mailto:"]')).toBeNull()
  })
})
