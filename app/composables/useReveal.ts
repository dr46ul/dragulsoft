import { gsap } from 'gsap'
import { SplitText } from 'gsap/SplitText'

/*
 * Entrance choreography for everything under `root` marked `data-reveal`:
 * `words` lifts a heading word by word, `rise` fades one block up, `stagger` does that to each child in turn.
 * SplitText's `aria: 'auto'` keeps the unsplit heading as its accessible name.
 */
export function useReveal(root: Readonly<Ref<HTMLElement | null>>) {
  let context: gsap.Context | undefined

  onMounted(() => {
    const scope = root.value
    if (!scope || prefersReducedMotion())
      return
    context = gsap.context(() => {
      for (const el of scope.querySelectorAll<HTMLElement>('[data-reveal]')) {
        const scrollTrigger = { trigger: el, start: 'top 86%', once: true }
        const kind = el.dataset.reveal
        if (kind === 'words') {
          SplitText.create(el, {
            type: 'words',
            mask: 'words',
            aria: 'auto',
            autoSplit: true,
            onSplit: split => gsap.from(split.words, {
              yPercent: 110,
              duration: 1,
              ease: 'expo.out',
              stagger: 0.045,
              scrollTrigger,
            }),
          })
        }
        else if (kind === 'stagger') {
          gsap.from(el.children, {
            y: 28,
            autoAlpha: 0,
            duration: 0.8,
            ease: 'power3.out',
            stagger: 0.09,
            scrollTrigger,
          })
        }
        else {
          gsap.from(el, {
            y: 28,
            autoAlpha: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger,
          })
        }
      }
    }, scope)
  })

  onBeforeUnmount(() => context?.revert())
}
