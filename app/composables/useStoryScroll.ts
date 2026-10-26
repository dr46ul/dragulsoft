import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/*
 * Ties the story's levels to the scroll position: each `[data-chapter]` under `root` scrubs the level for the
 * stage it completes. Reduced-motion visitors get no scrubbing; a level flips to 1 as its chapter reaches the reading line.
 */
export function useStoryScroll(root: Readonly<Ref<HTMLElement | null>>) {
  const story = useStory()
  let media: gsap.MatchMedia | undefined

  onMounted(() => {
    const scope = root.value
    if (!scope)
      return
    story.ready.value = true

    media = gsap.matchMedia(scope)
    // matchMedia only runs its setup while at least one condition matches, so phone is listed for when nothing else would.
    media.add({
      desktop: '(min-width: 1024px)',
      phone: '(max-width: 1023.98px)',
      reduce: '(prefers-reduced-motion: reduce)',
    }, (context) => {
      const desktop = Boolean(context.conditions?.desktop)
      const reduce = Boolean(context.conditions?.reduce)
      const line = () => {
        const { edge, offset } = readingLine()
        return `${edge} ${offset}px`
      }

      ScrollTrigger.create({
        trigger: scope,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          story.progress.value = self.progress
        },
      })

      scope.querySelectorAll<HTMLElement>('[data-chapter]').forEach((chapter, index) => {
        if (reduce) {
          ScrollTrigger.create({
            trigger: chapter,
            // The extra tenth of the viewport makes a chapter parked exactly on the line count as entered.
            start: () => {
              const { edge, offset } = readingLine()
              return `${edge} ${offset + window.innerHeight * 0.1}px`
            },
            end: 'max',
            onToggle: self => story.setLevel(index, self.isActive ? 1 : 0),
          })
          return
        }
        const level = { value: 0 }
        gsap.to(level, {
          value: 1,
          ease: 'none',
          onUpdate: () => story.setLevel(index, level.value),
          scrollTrigger: {
            trigger: chapter,
            start: desktop ? 'top 80%' : 'top bottom',
            end: line,
            scrub: 0.6,
          },
        })
      })
    })
  })

  onBeforeUnmount(() => {
    media?.revert()
    story.reset()
  })
}
