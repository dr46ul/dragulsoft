<script setup lang="ts">
import { gsap } from 'gsap'
import { SplitText } from 'gsap/SplitText'

const { brand } = useAppConfig()
const enquiry = useEnquiry()

const brief = 'Every order lives in three spreadsheets. We need one place to see them, and to just ask it questions.'

const root = useTemplateRef<HTMLElement>('root')
const headline = useTemplateRef<HTMLElement>('headline')
const underline = useTemplateRef<HTMLElement>('underline')
const cue = useTemplateRef<HTMLElement>('cue')

const { ready, stage } = useStory()
const cueOnscreen = useOnscreen(cue)

useReveal(root)
useStoryScroll(root)

// Server-rendered and reduced-motion visitors get the whole brief; the intro empties it just before it types it out.
const typed = ref(brief)

let intro: gsap.Context | undefined

onMounted(() => {
  const scope = root.value
  const heading = headline.value
  if (!scope || !heading || prefersReducedMotion())
    return
  intro = gsap.context(() => {
    typed.value = ''
    const split = SplitText.create(heading, { type: 'words', mask: 'words', aria: 'auto' })
    const letters = { count: 0 }
    gsap.timeline({
      defaults: { ease: 'expo.out' },
    })
      .set('[data-intro]', { visibility: 'visible' })
      .from(split.words, { yPercent: 110, duration: 1.1, stagger: 0.055 }, 0.1)
      .from('[data-intro="sheet"]', { y: 28, autoAlpha: 0, duration: 1.2 }, 0.15)
      .from('[data-edge="x"]', {
        scaleX: 0,
        duration: 1,
        ease: 'expo.inOut',
        stagger: 0.15,
      }, 0.35)
      .from('[data-edge="y"]', {
        scaleY: 0,
        duration: 1,
        ease: 'expo.inOut',
        stagger: 0.15,
      }, 0.45)
      .from('[data-intro="lede"]', { y: 18, autoAlpha: 0, duration: 0.9 }, 0.5)
      .from('[data-tick]', { autoAlpha: 0, duration: 0.4, stagger: 0.03 }, 0.7)
      .fromTo(underline.value, { backgroundSize: '0% 100%' }, { backgroundSize: '100% 100%', duration: 0.9, ease: 'power2.inOut' }, 0.95)
      .to(letters, {
        count: brief.length,
        duration: 2.2,
        ease: 'none',
        onUpdate: () => {
          typed.value = brief.slice(0, Math.round(letters.count))
        },
      }, 1.05)
  }, scope)
})

onBeforeUnmount(() => intro?.revert())
</script>

<template>
  <section
    id="process"
    ref="root"
    class="relative mx-auto max-w-[90rem] px-4 md:px-8 lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-x-14 xl:gap-x-16"
    aria-label="How a project runs"
  >
    <div id="top" class="flex flex-col justify-center pt-12 pb-10 transition-opacity duration-500 motion-reduce:transition-none lg:col-start-1 lg:row-start-1 lg:min-h-[calc(100svh-4rem)] lg:py-16" :class="{ 'lg:opacity-30': ready && stage !== 0 }">
      <p class="mb-6 flex items-center gap-3 eyebrow text-secondary">
        <span class="h-px w-8 bg-secondary" aria-hidden="true" />Sheet 01 · Web apps · Websites · AI integrations
      </p>
      <h1 ref="headline" data-intro class="font-display text-[clamp(2.75rem,5.2vw,5.25rem)] leading-[0.95] font-bold tracking-[-0.03em] text-balance">
        Software, drawn up properly and <span ref="underline" class="underline-band">built to ship.</span>
      </h1>
      <p data-intro="lede" class="mt-7 max-w-xl text-lg text-pretty text-base-content/80 md:text-xl">
        {{ brand.name }} is an independent software practice building web apps, websites and AI integrations for businesses in any market, with one accountable lead from first sketch to launch.
      </p>
      <div class="mt-9 flex flex-wrap items-center gap-3">
        <button v-if="enquiry.available.value" class="btn btn-lg btn-primary" @click="enquiry.start('hero')">
          Start a project
          <Icon name="solar:arrow-right-linear" class="size-5" />
        </button>
        <button class="btn btn-ghost btn-lg" @click="goToStage(1)">
          See how a project runs
        </button>
      </div>
      <p class="mt-14 hidden items-center gap-4 eyebrow text-base-content/55 lg:flex" aria-hidden="true">
        <span ref="cue" class="scroll-cue" :class="{ paused: stage > 0 || !cueOnscreen }" />Scroll · the drawing builds itself
      </p>
    </div>

    <div data-story-band class="sticky top-16 z-20 -mx-4 border-b border-secondary/25 bg-drafting px-4 py-3 md:-mx-8 md:px-8 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mx-0 lg:flex lg:h-[calc(100svh-4rem)] lg:items-center lg:self-start lg:border-0 lg:bg-transparent lg:bg-none lg:px-0 lg:py-6">
      <LandingSheet data-intro="sheet" :brief="typed" />
    </div>

    <LandingStoryChapters />
  </section>
</template>

<style scoped>
/* A background rather than text-decoration, so the intro can sweep it in by animating its size. */
.underline-band {
  background-image: linear-gradient(transparent 84%, var(--color-primary) 84% 94%, transparent 94%);
  background-repeat: no-repeat;
  background-size: 100% 100%;
}

.scroll-cue {
  position: relative;
  width: 1px;
  height: 2.25rem;
  overflow: hidden;
  background-color: color-mix(in oklab, var(--color-base-content) 25%, transparent);
}
.scroll-cue::after {
  content: '';
  position: absolute;
  inset: 0 0 auto;
  height: 40%;
  background-color: var(--color-primary);
  animation: cue 1.8s var(--ease-draft) infinite;
}
.scroll-cue.paused::after {
  animation-play-state: paused;
}
@keyframes cue {
  from {
    translate: 0 -100%;
  }
  to {
    translate: 0 250%;
  }
}
@media (prefers-reduced-motion: reduce) {
  .scroll-cue::after {
    animation: none;
  }
}
</style>
