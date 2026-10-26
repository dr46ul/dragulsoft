export type EnquirySource = 'nav' | 'hero' | 'story' | 'teaser' | 'footer'

export interface EnquiryPrefill {
  scope: string[]
  timing: string
}

// Every section button that starts an enquiry renders only while `available` is true, so a page without the wizard never shows a dead button.
export function useEnquiry() {
  const available = useState('enquiry-available', () => false)
  const open = useState('enquiry-open', () => false)
  const source = useState<EnquirySource | null>('enquiry-source', () => null)
  const prefill = useState<EnquiryPrefill | null>('enquiry-prefill', () => null)

  function start(from: EnquirySource, choices?: EnquiryPrefill) {
    source.value = from
    prefill.value = choices ?? null
    open.value = true
  }

  function close() {
    open.value = false
    source.value = null
    prefill.value = null
  }

  function markAvailable() {
    available.value = true
  }

  return {
    available,
    open,
    source,
    prefill,
    start,
    close,
    markAvailable,
  }
}
