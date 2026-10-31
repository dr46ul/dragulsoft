import type { EnquirySource } from '~/composables/useEnquiry'
import { ENQUIRY_PATH } from '@dragulsoft/adam-protocol'
import { registerEndpoint, renderSuspended } from '@nuxt/test-utils/runtime'
import userEvent from '@testing-library/user-event'
import { screen, waitFor, within } from '@testing-library/vue'
import { readBody, setResponseStatus } from 'h3'
import { beforeEach, describe, expect, it } from 'vitest'
import { clearNuxtState } from '#imports'
import BriefWizard from '~/components/brief/BriefWizard.vue'
import { useEnquiry } from '~/composables/useEnquiry'

const user = userEvent.setup()

async function openWizard(source: EnquirySource = 'hero') {
  await renderSuspended(BriefWizard)
  useEnquiry().start(source)
  return screen.findByRole('dialog', { name: 'Start a project' })
}

function stepHeading(name: string) {
  return screen.findByRole('heading', { level: 3, name })
}

async function next() {
  await user.click(screen.getByRole('button', { name: 'Next' }))
}

async function fillToDetails() {
  await user.click(screen.getByRole('checkbox', { name: 'Website' }))
  await next()
  await next()
  await next()
  await user.type(screen.getByRole('textbox', { name: 'What problem should this solve?' }), 'Nobody can find our opening hours.')
  await next()
  await next()
  await stepHeading('Your details')
}

describe('brief wizard', () => {
  beforeEach(() => {
    clearNuxtState()
  })

  it('makes the enquiry entry point available once mounted', async () => {
    await renderSuspended(BriefWizard)

    expect(useEnquiry().available.value).toBe(true)
  })

  it('opens as a dialog named "Start a project" at the scope step, with focus on its heading', async () => {
    const dialog = await openWizard()

    const heading = within(dialog).getByRole('heading', { name: 'Scope' })
    await waitFor(() => expect(document.activeElement).toBe(heading))
  })

  describe('next', () => {
    it('stays on scope and says why while nothing is chosen to build', async () => {
      await openWizard()

      await next()

      expect(screen.getByRole('alert').textContent).toContain('Choose at least one thing you’re building.')
      expect(screen.getByRole('heading', { level: 3 }).textContent).toContain('Scope')
    })

    it('moves to connections, with focus on its heading, once a kind is chosen', async () => {
      await openWizard()

      await user.click(screen.getByRole('checkbox', { name: 'Web app / SaaS' }))
      await next()

      const heading = await stepHeading('Connections')
      await waitFor(() => expect(document.activeElement).toBe(heading))
    })

    it('stays on the problem step and says why while the problem is empty', async () => {
      await openWizard()
      await user.click(screen.getByRole('checkbox', { name: 'Website' }))
      await next()
      await next()
      await next()
      await stepHeading('The problem')

      await next()

      expect(screen.getByRole('alert').textContent).toContain('Describe the problem')
      expect(screen.getByRole('textbox', { name: 'What problem should this solve?' }).getAttribute('aria-invalid')).toBe('true')
    })

    it('blocks sending on an invalid email and says why', async () => {
      await openWizard()
      await fillToDetails()
      await user.type(screen.getByRole('textbox', { name: 'Your name' }), 'Ana')
      await user.type(screen.getByRole('textbox', { name: 'Email' }), 'ana@')

      await user.click(screen.getByRole('button', { name: 'Send brief' }))

      expect(screen.getByRole('alert').textContent).toContain('Add an email address the reply can reach.')
      expect(screen.getByRole('heading', { level: 3 }).textContent).toContain('Your details')
    })
  })
  it('returns to a visited step from the step indicator', async () => {
    await openWizard()
    await user.click(screen.getByRole('checkbox', { name: 'Website' }))
    await next()
    await next()
    await stepHeading('Timing & budget')
    const indicator = screen.getByRole('navigation', { name: 'Brief steps' })
    expect(within(indicator).queryByRole('button', { name: 'The problem' })).toBeNull()

    await user.click(within(indicator).getByRole('button', { name: 'Scope' }))

    expect(await stepHeading('Scope')).toBeTruthy()
  })

  it('reflects choices in the brief preview as they change', async () => {
    const dialog = await openWizard()
    const preview = () => within(dialog).getByText(/^Your product:/)

    await user.click(screen.getByRole('checkbox', { name: 'Web app / SaaS' }))
    await user.click(screen.getByRole('checkbox', { name: 'Dashboards & reports' }))
    expect(preview().textContent).toBe('Your product: a web app with dashboards & reports. We’re starting from just an idea, and have no fixed launch date.')

    await user.click(within(screen.getByRole('radiogroup', { name: 'Dashboards & reports priority' })).getByRole('radio', { name: 'Nice-to-have' }))
    expect(within(dialog).getByText('Nice-to-haves').nextElementSibling?.textContent?.trim()).toBe('Dashboards & reports')

    await next()
    await next()
    await user.click(screen.getByRole('radio', { name: 'GBP' }))
    await user.click(screen.getByRole('radio', { name: '£5–15k' }))
    expect(within(dialog).getByText('Budget').nextElementSibling?.textContent?.trim()).toBe('£5–15k')
  })

  it('keeps answers and the step when closed and reopened', async () => {
    await openWizard('nav')
    await user.click(screen.getByRole('checkbox', { name: 'AI integration' }))
    await next()
    await stepHeading('Connections')

    await user.click(screen.getByRole('button', { name: 'Close' }))
    await waitFor(() => expect(useEnquiry().open.value).toBe(false))
    useEnquiry().start('footer')

    expect(await stepHeading('Connections')).toBeTruthy()
    await user.click(within(screen.getByRole('navigation', { name: 'Brief steps' })).getByRole('button', { name: 'Scope' }))
    expect((await screen.findByRole('checkbox', { name: 'AI integration' })).matches(':checked')).toBe(true)
  })

  it('lands a prefill on the scope step with its choices checked', async () => {
    await openWizard()
    await user.click(screen.getByRole('checkbox', { name: 'AI integration' }))
    await next()
    await stepHeading('Connections')
    await user.click(screen.getByRole('button', { name: 'Close' }))

    useEnquiry().start('teaser', {
      kinds: ['site'],
      features: ['blog'],
      start: 'live',
      launch: 'asap',
      projectName: 'Bakery',
    })

    await stepHeading('Scope')
    expect(screen.getByRole('checkbox', { name: 'AI integration' }).matches(':checked')).toBe(false)
    expect(screen.getByRole('checkbox', { name: 'Website' }).matches(':checked')).toBe(true)
    expect(screen.getByRole('checkbox', { name: 'Blog or news' }).matches(':checked')).toBe(true)
    expect(screen.getByText(/^Bakery:/).textContent).toBe('Bakery: a website with blog or news. We’re starting from a product that already exists, and would like to launch as soon as possible.')
  })
  describe('send', () => {
    async function fillAndSend(source: EnquirySource = 'hero') {
      await openWizard(source)
      await fillToDetails()
      await user.type(screen.getByRole('textbox', { name: 'Your name' }), 'Ana')
      await user.type(screen.getByRole('textbox', { name: 'Email' }), 'ana@example.com')
      await user.click(screen.getByRole('button', { name: 'Send brief' }))
    }

    it.each([
      'nav',
      'hero',
      'story',
      'teaser',
      'footer',
    ] as const)('posts the brief to Adam, from %s, and confirms where the reply goes', async (source) => {
      const received: unknown[] = []
      registerEndpoint(ENQUIRY_PATH, {
        method: 'POST',
        once: true,
        handler: async (event) => {
          received.push(await readBody(event))
          return { id: 'enquiry-1' }
        },
      })

      await fillAndSend(source)

      expect((await screen.findByRole('status')).textContent).toContain('Your brief is in. The reply comes to ana@example.com.')
      expect(received).toEqual([
        {
          contact: { name: 'Ana', email: 'ana@example.com' },
          scope: {
            kinds: ['site'],
            features: [],
          },
          timing: { start: 'idea', launch: 'open' },
          problem: 'Nobody can find our opening hours.',
          summary: 'Your product: a website. We’re starting from just an idea, and have no fixed launch date.',
          source,
        },
      ])
    })

    it('starts afresh after a brief is sent', async () => {
      registerEndpoint(ENQUIRY_PATH, {
        method: 'POST',
        once: true,
        handler: () => ({ id: 'enquiry-1' }),
      })
      await fillAndSend()
      await user.click(await screen.findByRole('button', { name: 'Done' }))

      useEnquiry().start('nav')

      await stepHeading('Scope')
      expect(screen.getByRole('checkbox', { name: 'Website' }).matches(':checked')).toBe(false)
    })

    it('says the brief could not be sent and keeps the answers when Adam refuses it', async () => {
      registerEndpoint(ENQUIRY_PATH, {
        method: 'POST',
        once: true,
        handler: (event) => {
          setResponseStatus(event, 503)
          return { error: 'unavailable' }
        },
      })

      await fillAndSend()

      expect((await screen.findByRole('alert')).textContent).toContain('Your brief couldn’t be sent. Your answers are still here.')
      expect(screen.getByRole('button', { name: 'Try again' })).toBeTruthy()
      expect(screen.getByRole<HTMLInputElement>('textbox', { name: 'Email' }).value).toBe('ana@example.com')
    })
  })
})
