export function useContact() {
  const open = useState('contact-open', () => false)
  const brief = useState('contact-brief', () => '')

  function start(text = '') {
    brief.value = text
    open.value = true
  }

  return { open, brief, start }
}
