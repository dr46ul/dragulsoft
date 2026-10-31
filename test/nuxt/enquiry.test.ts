import type { EnquiryPrefill } from '~/composables/useEnquiry'
import { beforeEach, describe, expect, it } from 'vitest'
import { clearNuxtState } from '#imports'
import { useEnquiry } from '~/composables/useEnquiry'

describe('enquiry entry point', () => {
  beforeEach(() => {
    clearNuxtState()
  })

  it('starts unavailable, closed and without a source or prefill', () => {
    const enquiry = useEnquiry()

    expect(enquiry.available.value).toBe(false)
    expect(enquiry.open.value).toBe(false)
    expect(enquiry.source.value).toBeNull()
    expect(enquiry.prefill.value).toBeNull()
  })

  it('opens on start, recording the source and prefill', () => {
    const enquiry = useEnquiry()
    const prefill: EnquiryPrefill = {
      kinds: ['app', 'ai'],
      launch: 'quarter',
    }

    enquiry.start('teaser', prefill)

    expect(enquiry.open.value).toBe(true)
    expect(enquiry.source.value).toBe('teaser')
    expect(enquiry.prefill.value).toEqual(prefill)
  })

  it('opens without a prefill when the source has none to give', () => {
    const enquiry = useEnquiry()

    enquiry.start('hero')

    expect(enquiry.open.value).toBe(true)
    expect(enquiry.prefill.value).toBeNull()
  })

  it('clears the source and prefill on close', () => {
    const enquiry = useEnquiry()
    enquiry.start('teaser', {
      kinds: ['site'],
      launch: 'open',
    })

    enquiry.close()

    expect(enquiry.open.value).toBe(false)
    expect(enquiry.source.value).toBeNull()
    expect(enquiry.prefill.value).toBeNull()
  })

  it('shows callers that the wizard is available once it marks itself so', () => {
    const caller = useEnquiry()
    const wizard = useEnquiry()

    wizard.markAvailable()

    expect(caller.available.value).toBe(true)
  })
})
