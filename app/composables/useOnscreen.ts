// For pausing looping decorations while they are scrolled out of view.
export function useOnscreen(target: Readonly<Ref<HTMLElement | null>>) {
  const onscreen = ref(true)
  let observer: IntersectionObserver | undefined

  onMounted(() => {
    const element = target.value
    if (!element || typeof IntersectionObserver === 'undefined')
      return
    observer = new IntersectionObserver((entries) => {
      const latest = entries.at(-1)
      if (latest)
        onscreen.value = latest.isIntersecting
    })
    observer.observe(element)
  })

  onBeforeUnmount(() => observer?.disconnect())

  return onscreen
}
