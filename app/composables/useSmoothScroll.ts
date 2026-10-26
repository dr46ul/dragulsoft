import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

let lenis: Lenis | null = null

// Offsets the target so in-page jumps clear the sticky navigation.
const stickyOffset = 80

export function scrollToY(top: number) {
  if (lenis) {
    lenis.scrollTo(top)
  }
  else {
    window.scrollTo({
      top,
      behavior: prefersReducedMotion()
        ? 'instant'
        : 'smooth',
    })
  }
}

// The page's only smooth-scroll engine, driven by GSAP's ticker so ScrollTrigger reads the same scroll position Lenis renders.
export function useSmoothScroll() {
  const tick = (time: number) => lenis?.raf(time * 1000)

  onMounted(() => {
    // Triggers measured before the web fonts swap in sit at the wrong offsets.
    document.fonts?.ready.then(() => ScrollTrigger.refresh())
    if (prefersReducedMotion())
      return
    lenis = new Lenis({
      autoRaf: false,
      anchors: { offset: -stickyOffset },
    })
    lenis.on('scroll', ScrollTrigger.update)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
  })

  onBeforeUnmount(() => {
    gsap.ticker.remove(tick)
    gsap.ticker.lagSmoothing(500, 33)
    lenis?.destroy()
    lenis = null
  })
}
