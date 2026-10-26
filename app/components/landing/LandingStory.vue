<script setup lang="ts">
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

const { brand } = useAppConfig()
const { start } = useContact()

const stages = [
  { label: 'Brief', status: 'Received', rev: '—' },
  { label: 'Spec', status: 'For approval', rev: 'A' },
  { label: 'Design', status: 'Approved', rev: 'B' },
  { label: 'Build', status: 'In build', rev: 'C' },
  { label: 'Launch', status: 'Issued · live', rev: '1.0' },
] as const

const chapters = [
  {
    stage: 'Spec',
    title: 'Scoped on paper before a line of code.',
    copy: 'Screens, flows, data and integrations get mapped first, while a change costs an eraser instead of a sprint. You sign off a written scope with a fixed estimate and the trade-offs spelled out.',
    gets: ['Written scope', 'Fixed estimate', 'Clickable wireframe'],
  },
  {
    stage: 'Design',
    title: 'Every state designed before it’s built.',
    copy: 'Your brand, real typography, and the screens nobody remembers until launch week: empty, loading, error. You approve a working prototype, not a picture of one.',
    gets: ['Design system', 'Interactive prototype'],
  },
  {
    stage: 'Build',
    title: 'Built in the open. Demoed every week.',
    copy: 'Working software from the first milestone, on a staging link you can click. Every change is tested and reviewed, so changing course stays cheap.',
    gets: ['Weekly demo', 'Staging link', 'Tested, reviewed code'],
  },
  {
    stage: 'Launch',
    title: 'Launched, then looked after.',
    copy: 'Production deploys, monitoring and handover docs. Code, accounts and data are yours from day one. Keep Dragulsoft on for the next iteration, or take it in-house.',
    gets: ['Production deploy', 'Monitoring', 'Handover docs'],
  },
] as const

const legend = [
  'Search & status',
  'Key figures',
  'Weekly trend',
  'AI assistant',
  'Orders table',
] as const
const rows = [
  {
    id: 4821,
    region: 'North',
    channel: 'Web',
    total: '€42.10',
    paid: true,
  },
  {
    id: 4820,
    region: 'Coast',
    channel: 'Store',
    total: '€18.00',
    paid: false,
  },
  {
    id: 4819,
    region: 'Central',
    channel: 'Web',
    total: '€96.40',
    paid: true,
  },
  {
    id: 4818,
    region: 'North',
    channel: 'App',
    total: '€27.90',
    paid: true,
  },
]
const note = 'Every order lives in three spreadsheets. We need one place to see them, and to just ask it questions.'
const question = 'Which region grew fastest this week?'
const answer = 'North, up 18% on last week. Mostly repeat customers. Want it broken down by product?'

const desktopQuery = '(min-width: 1024px)'

const root = useTemplateRef<HTMLElement>('root')
const sheet = useTemplateRef<HTMLElement>('sheet')
const title = useTemplateRef<HTMLElement>('title')
const marker = useTemplateRef<HTMLElement>('marker')
const bar = useTemplateRef<HTMLProgressElement>('bar')

const ready = ref(false)
const stage = ref(0)
const build = ref(0)
const launched = ref(false)
const arrivals = ref(0)
const typed = ref(note)

const current = computed(() => stages[stage.value] ?? stages[0])
const pad = (value: number) => String(value).padStart(2, '0')
const clamp01 = (value: number) => Math.min(1, Math.max(0, value))

const kpis = computed(() => {
  const empty = build.value < 0.02
  const t = 1 - (1 - clamp01(build.value / 0.8)) ** 3
  return [
    {
      label: 'Orders today',
      value: empty
        ? '—'
        : Math.round(1284 * t + arrivals.value).toLocaleString('en'),
    },
    {
      label: 'Revenue',
      value: empty
        ? '—'
        : `€${(38.2 * t + arrivals.value * 0.03).toFixed(1)}k`,
    },
    {
      label: 'Avg. basket',
      value: empty
        ? '—'
        : `€${(29.8 * t).toFixed(2)}`,
    },
  ]
})
const streamed = computed(() => answer.slice(0, Math.round(answer.length * clamp01((build.value - 0.3) / 0.6))))
const streaming = computed(() => build.value > 0.12 && streamed.value.length < answer.length)

function dim(index: number) {
  return ready.value && index !== stage.value
    ? 'lg:opacity-30'
    : ''
}

/*
 * Where a chapter sits once it is being read: centred beside the sheet on desktop; on phones, its top just under the
 * pinned sheet, whose height varies with the screen, so the line is measured rather than fixed.
 */
function readingLine() {
  if (window.matchMedia(desktopQuery).matches)
    return { edge: 'center', offset: window.innerHeight * 0.55 }
  const band = sheet.value?.parentElement
  if (!band)
    return { edge: 'top', offset: window.innerHeight * 0.6 }
  return { edge: 'top', offset: Number.parseFloat(getComputedStyle(band).top) + band.offsetHeight + 16 }
}

function goTo(index: number) {
  if (index === 0)
    return scrollToY(0)
  const chapter = root.value?.querySelector<HTMLElement>(`[data-stage="${index}"]`)
  if (!chapter)
    return
  const rect = chapter.getBoundingClientRect()
  const { edge, offset } = readingLine()
  scrollToY(window.scrollY + rect.top + (edge === 'center'
    ? rect.height / 2
    : 0) - offset)
}

// Orders keep trickling in once the example product is live, so the last frame reads as running software.
let arrivalTimer: ReturnType<typeof setInterval> | undefined
watch(launched, (isLive) => {
  clearInterval(arrivalTimer)
  arrivals.value = 0
  if (isLive) {
    arrivalTimer = setInterval(() => {
      if (!document.hidden)
        arrivals.value += 1 + Math.floor(Math.random() * 3)
    }, 2200)
  }
})

useReveal(root)

let media: gsap.MatchMedia | undefined
let intro: gsap.Context | undefined

onMounted(() => {
  const scope = root.value
  const drawing = sheet.value
  if (!scope || !drawing)
    return
  ready.value = true

  // Each chapter scrubs one custom property on the sheet; the sheet's CSS derives every staggered reveal from those four numbers.
  const levels = [0, 0, 0, 0]
  function setLevel(index: number, value: number) {
    levels[index] = value
    drawing?.style.setProperty(`--p${index + 1}`, String(value))
    stage.value = levels.filter(level => level >= 0.5).length
    if (index === 2)
      build.value = value
    if (index === 3)
      launched.value = value > 0.95
  }

  media = gsap.matchMedia(scope)
  // matchMedia only runs the setup while at least one condition matches, so phone is listed for the case where nothing else would.
  media.add({ desktop: desktopQuery, phone: '(max-width: 1023.98px)', reduce: '(prefers-reduced-motion: reduce)' }, (context) => {
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
        if (bar.value)
          bar.value.value = self.progress * 100
      },
    })

    scope.querySelectorAll<HTMLElement>('[data-chapter]').forEach((chapter, index) => {
      if (reduce) {
        ScrollTrigger.create({
          trigger: chapter,
          start: () => {
            const { edge, offset } = readingLine()
            return `${edge} ${offset + window.innerHeight * 0.1}px`
          },
          onEnter: () => setLevel(index, 1),
          onLeaveBack: () => setLevel(index, 0),
        })
        return
      }
      const level = { value: 0 }
      gsap.to(level, {
        value: 1,
        ease: 'none',
        onUpdate: () => setLevel(index, level.value),
        scrollTrigger: {
          trigger: chapter,
          start: desktop ? 'top 80%' : 'top bottom',
          end: line,
          scrub: 0.6,
        },
      })
    })
  })

  if (prefersReducedMotion() || !title.value)
    return
  const heading = title.value
  intro = gsap.context(() => {
    typed.value = ''
    const split = SplitText.create(heading, { type: 'words', mask: 'words', aria: 'auto' })
    const letters = { count: 0 }
    gsap.timeline({
      defaults: { ease: 'expo.out' },
    })
      .set('[data-intro]', { visibility: 'visible' })
      .from(split.words, { yPercent: 110, duration: 1.1, stagger: 0.055 }, 0.1)
      .from('[data-intro="lede"]', { y: 18, autoAlpha: 0, duration: 0.9 }, 0.5)
      .from(drawing, { y: 28, autoAlpha: 0, duration: 1.2 }, 0.15)
      .from('.edge-x', {
        scaleX: 0,
        duration: 1,
        ease: 'expo.inOut',
        stagger: 0.15,
      }, 0.35)
      .from('.edge-y', {
        scaleY: 0,
        duration: 1,
        ease: 'expo.inOut',
        stagger: 0.15,
      }, 0.45)
      .from('.tick', { autoAlpha: 0, duration: 0.4, stagger: 0.03 }, 0.7)
      .fromTo(marker.value, { backgroundSize: '0% 100%' }, { backgroundSize: '100% 100%', duration: 0.9, ease: 'power2.inOut' }, 0.95)
      .to(letters, {
        count: note.length,
        duration: 2.2,
        ease: 'none',
        onUpdate: () => {
          typed.value = note.slice(0, Math.round(letters.count))
        },
      }, 1.05)
  }, scope)
})

onBeforeUnmount(() => {
  clearInterval(arrivalTimer)
  media?.revert()
  intro?.revert()
})
</script>

<template>
  <section
    id="process"
    ref="root"
    class="relative mx-auto max-w-[90rem] px-4 md:px-8 lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-x-14 xl:gap-x-16"
    aria-label="How a project runs"
  >
    <div id="top" class="flex flex-col justify-center pt-12 pb-10 transition-opacity duration-500 lg:col-start-1 lg:row-start-1 lg:min-h-[calc(100svh-4rem)] lg:py-16" :class="dim(0)">
      <p class="mb-6 flex items-center gap-3 eyebrow text-secondary">
        <span class="h-px w-8 bg-secondary" aria-hidden="true" />Sheet 01 · Web apps · Websites · AI integrations
      </p>
      <h1 ref="title" data-intro class="font-display text-[clamp(2.75rem,5.2vw,5.25rem)] leading-[0.95] font-bold tracking-[-0.03em] text-balance">
        Software, drawn up properly and <span ref="marker" class="marker">built to ship.</span>
      </h1>
      <p data-intro="lede" class="mt-7 max-w-xl text-lg text-pretty text-base-content/80 md:text-xl">
        {{ brand.name }} is an independent software practice building web apps, websites and AI integrations for businesses in any market, with one accountable lead from first sketch to launch.
      </p>
      <div class="mt-9 flex flex-wrap items-center gap-3">
        <button class="btn btn-lg btn-primary" @click="start()">
          Start a project
          <Icon name="solar:arrow-right-linear" class="size-5" />
        </button>
        <button class="btn btn-ghost btn-lg" @click="goTo(1)">
          See how a project runs
        </button>
      </div>
      <p class="mt-14 hidden items-center gap-4 eyebrow text-base-content/55 lg:flex" aria-hidden="true">
        <span class="scroll-cue" :class="{ paused: stage > 0 }" />Scroll · the drawing builds itself
      </p>
    </div>

    <div class="sticky top-16 z-20 -mx-4 border-b border-secondary/25 bg-drafting px-4 py-3 md:-mx-8 md:px-8 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mx-0 lg:flex lg:h-[calc(100svh-4rem)] lg:items-center lg:self-start lg:border-0 lg:bg-transparent lg:bg-none lg:px-0 lg:py-6">
      <figure ref="sheet" data-intro class="sheet w-full card-drawn rounded-box p-3 md:p-5" aria-labelledby="sheet-caption">
        <span class="pointer-events-none absolute inset-1.5" aria-hidden="true">
          <i class="edge-x absolute inset-x-0 top-0 h-px origin-left" />
          <i class="edge-x absolute inset-x-0 bottom-0 h-px origin-right" />
          <i class="edge-y absolute inset-y-0 left-0 w-px origin-top" />
          <i class="edge-y absolute inset-y-0 right-0 w-px origin-bottom" />
        </span>

        <header class="mb-2 flex items-center gap-4 md:mb-3">
          <p class="shrink-0 eyebrow text-[0.625rem] text-secondary">
            Stage {{ pad(stage + 1) }}<span class="text-base-content/45"> / 05</span>
            <span class="text-base-content md:hidden"> · {{ current.label }}</span>
          </p>
          <nav class="hidden flex-1 md:block" aria-label="Project stages">
            <ul class="steps w-full">
              <li
                v-for="(item, index) in stages"
                :key="item.label"
                class="step min-w-0 text-[0.6rem] before:h-px! after:size-6! after:font-label after:text-[0.55rem]"
                :class="{ 'step-primary': index <= stage }"
                :data-content="pad(index + 1)"
              >
                <button
                  type="button"
                  class="cursor-pointer rounded-field px-1 eyebrow text-[0.575rem] tracking-[0.14em] hover:text-primary"
                  :aria-current="index === stage ? 'step' : undefined"
                  @click="goTo(index)"
                >
                  {{ item.label }}
                </button>
              </li>
            </ul>
          </nav>
        </header>
        <progress ref="bar" class="progress mb-3 h-px w-full progress-primary md:mb-4" value="0" max="100" aria-hidden="true" />

        <div class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_10rem]">
          <div class="drawing relative overflow-clip pt-2 pb-6 pl-2 md:pt-5 md:pl-5">
            <div class="pointer-events-none absolute top-0 right-0 left-5 hidden justify-between font-label text-[0.55rem] text-base-content/45 md:flex" aria-hidden="true">
              <span v-for="n in 8" :key="n" class="tick">{{ n }}</span>
            </div>
            <div class="pointer-events-none absolute top-5 bottom-6 left-0 hidden flex-col justify-between font-label text-[0.55rem] text-base-content/45 md:flex" aria-hidden="true">
              <span v-for="letter in 'ABCDE'" :key="letter" class="tick">{{ letter }}</span>
            </div>

            <div class="mock relative @container p-1.5 text-[0.625rem] leading-snug @md:p-2 @md:text-[0.6875rem]" aria-hidden="true">
              <div class="blk frame-layer absolute! inset-0" style="--i: 0">
                <span class="wire" /><span class="surface" />
              </div>

              <div class="blk" style="--i: 0">
                <span class="wire">Browser · 1280</span><span class="surface" />
                <div class="skin flex items-center gap-2 px-2 py-1">
                  <span class="flex gap-1"><i class="dot" /><i class="dot" /><i class="dot" /></span>
                  <span class="flex-1 truncate rounded-field bg-base-200 px-2 py-0.5 font-label text-[0.55rem] text-base-content/60">orders.example.com</span>
                </div>
              </div>

              <div class="mt-1.5 grid gap-1.5 @md:mt-2 @md:gap-2 @lg:grid-cols-[6.5rem_minmax(0,1fr)]">
                <div class="blk hidden @lg:block" style="--i: 1">
                  <span class="wire">Navigation</span><span class="surface" />
                  <div class="skin flex h-full flex-col gap-0.5 p-2">
                    <span class="mb-1.5 flex items-center gap-1.5 font-semibold"><span class="size-2.5 rounded-[2px] bg-primary" />Order desk</span>
                    <span class="rounded-field bg-base-200 px-1.5 py-1">Overview</span>
                    <span class="px-1.5 py-1 text-base-content/60">Orders</span>
                    <span class="px-1.5 py-1 text-base-content/60">Customers</span>
                    <span class="px-1.5 py-1 text-base-content/60">Assistant</span>
                    <span class="live mt-auto px-1.5 font-label text-[0.55rem] text-base-content/50">v1.0.0</span>
                  </div>
                </div>

                <div class="grid min-w-0 gap-1.5 @md:gap-2">
                  <div class="blk" style="--i: 2">
                    <span class="wire">Search · status</span><span class="surface" /><span class="callout">1</span>
                    <div class="skin flex items-center gap-2 p-1.5">
                      <span class="flex flex-1 items-center gap-1.5 rounded-field bg-base-200 px-2 py-1 text-base-content/55">
                        <Icon name="solar:magnifer-linear" class="size-3" />Search orders…
                      </span>
                      <span class="live inline-flex items-center gap-1.5 font-medium">
                        <span class="inline-grid *:[grid-area:1/1]">
                          <span class="status status-success" :class="{ 'animate-ping': launched }" />
                          <span class="status status-success" />
                        </span>
                        Live
                      </span>
                    </div>
                  </div>

                  <div class="grid grid-cols-3 gap-1.5 @md:gap-2">
                    <div v-for="(kpi, index) in kpis" :key="kpi.label" class="blk" :style="{ '--i': 3 + index }">
                      <span class="wire">Figure</span><span class="surface" />
                      <span v-if="index === 0" class="callout">2</span>
                      <div class="skin p-1.5 @md:p-2">
                        <p class="truncate text-base-content/60">
                          {{ kpi.label }}
                        </p>
                        <p class="font-display text-sm font-semibold tabular-nums @md:text-lg">
                          {{ kpi.value }}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div class="grid gap-1.5 @sm:grid-cols-5 @md:gap-2">
                    <div class="blk hidden @sm:col-span-3 @sm:block" style="--i: 6">
                      <span class="wire">Trend chart</span><span class="surface" /><span class="callout">3</span>
                      <div class="skin p-2">
                        <p class="mb-1 flex justify-between">
                          <span class="font-medium">Orders this week</span><span class="text-base-content/50">Mon–Sun</span>
                        </p>
                        <svg viewBox="0 0 200 64" preserveAspectRatio="none" class="h-16 w-full @lg:h-20">
                          <g class="stroke-base-content/15" stroke-width="1" vector-effect="non-scaling-stroke">
                            <line x1="0" y1="16" x2="200" y2="16" /><line x1="0" y1="32" x2="200" y2="32" /><line x1="0" y1="48" x2="200" y2="48" />
                          </g>
                          <path class="area fill-primary/15" d="M0 54 L33 46 L66 50 L100 34 L133 38 L166 18 L200 10 L200 64 L0 64 Z" />
                          <path class="trend stroke-primary" pathLength="1" fill="none" stroke-width="2" stroke-linejoin="round" vector-effect="non-scaling-stroke" d="M0 54 L33 46 L66 50 L100 34 L133 38 L166 18 L200 10" />
                        </svg>
                      </div>
                    </div>
                    <div class="blk @sm:col-span-2" style="--i: 7">
                      <span class="wire">AI assistant</span><span class="surface" /><span class="callout">4</span>
                      <div class="skin flex flex-col gap-1 p-1.5 @md:p-2">
                        <p class="flex items-center justify-between font-medium">
                          Assistant
                          <span class="badge badge-outline badge-xs border-secondary/50 font-label text-[0.5rem] text-secondary">AI</span>
                        </p>
                        <div class="chat-end chat p-0">
                          <div class="chat-bubble min-h-0 chat-bubble-primary px-2 py-1 text-[length:inherit]">
                            {{ question }}
                          </div>
                        </div>
                        <div class="chat-start chat p-0">
                          <div class="chat-bubble min-h-0 bg-base-200 px-2 py-1 text-[length:inherit] text-base-content">
                            <span class="grid *:[grid-area:1/1]">
                              <span class="invisible">{{ answer }}</span>
                              <span>{{ streamed }}<span v-if="streaming" class="caret">▍</span></span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="blk hidden @sm:block" style="--i: 8">
                    <span class="wire">Orders table</span><span class="surface" /><span class="callout">5</span>
                    <div class="skin relative overflow-hidden">
                      <table class="table table-xs text-[length:inherit]">
                        <thead class="text-base-content/55">
                          <tr>
                            <th>Order</th><th>Region</th><th class="hidden @sm:table-cell">
                              Channel
                            </th><th>Total</th><th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="(row, index) in rows" :key="row.id" class="row" :class="{ 'hidden @xs:table-row': index === 3 }" :style="{ '--j': index }">
                            <td class="font-label">
                              #{{ row.id }}
                            </td>
                            <td>{{ row.region }}</td>
                            <td class="hidden @sm:table-cell">
                              {{ row.channel }}
                            </td>
                            <td class="tabular-nums">
                              {{ row.total }}
                            </td>
                            <td>
                              <span class="badge badge-xs" :class="row.paid ? 'badge-success' : 'badge-warning'">{{ row.paid ? 'Paid' : 'Pending' }}</span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      <p class="empty absolute inset-x-0 top-6 bottom-0 grid place-items-center font-label text-[0.6rem] tracking-wider text-base-content/55 uppercase">
                        No orders yet · empty state
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <p class="revnote absolute right-3 bottom-[4.5rem] hidden @sm:block font-label text-[0.6rem] tracking-wide text-accent uppercase">
                Δ B · empty, loading &amp; error states drawn
              </p>
            </div>

            <figure class="note pointer-events-none absolute inset-x-4 top-1/2 mx-auto max-w-sm -translate-y-1/2 rounded-box bg-primary p-4 text-primary-content shadow-2xl md:p-5" aria-hidden="true">
              <blockquote class="min-h-[4.2em] font-display text-base leading-snug font-medium md:text-xl">
                “{{ typed }}<span class="caret">▍</span>”
              </blockquote>
              <figcaption class="mt-3 eyebrow text-[0.6rem] opacity-70">
                Client brief · received
              </figcaption>
            </figure>

            <div class="dim pointer-events-none absolute right-0 bottom-0 left-0 flex h-3 items-center gap-2 border-x border-secondary font-label text-[0.55rem] text-secondary md:left-5" aria-hidden="true">
              <span class="dim-line h-px flex-1 origin-right bg-secondary" />
              <span>W 1280 · fluid to 360</span>
              <span class="dim-line h-px flex-1 origin-left bg-secondary" />
            </div>
          </div>

          <aside class="hidden flex-col gap-4 xl:flex" aria-label="Title block">
            <div class="legend">
              <p class="mb-2 eyebrow text-[0.6rem] text-secondary">
                Legend
              </p>
              <ol class="space-y-1.5 font-label text-[0.6rem] uppercase">
                <li v-for="(item, index) in legend" :key="item" class="flex gap-2">
                  <span class="text-primary">{{ pad(index + 1) }}</span>{{ item }}
                </li>
              </ol>
            </div>
            <table class="titleblock mt-auto w-full font-label text-[0.575rem] uppercase">
              <tbody>
                <tr><th>Project</th><td>Order desk</td></tr>
                <tr><th>Client</th><td>Example</td></tr>
                <tr><th>Drawn by</th><td>{{ brand.name }}</td></tr>
                <tr><th>Stage</th><td>{{ pad(stage + 1) }} · {{ current.label }}</td></tr>
                <tr><th>Status</th><td>{{ current.status }}</td></tr>
                <tr>
                  <th>Rev</th><td><span :key="current.rev" class="rev">{{ current.rev }}</span></td>
                </tr>
              </tbody>
            </table>
          </aside>
        </div>

        <figcaption id="sheet-caption" class="mt-2 flex justify-between gap-4 eyebrow text-[0.575rem] text-base-content/50 md:mt-3">
          <span>Example product · not a client project</span>
          <span class="sr-only">An order dashboard with an AI assistant, drawn at the {{ current.label }} stage.</span>
        </figcaption>
        <p class="stamp pointer-events-none absolute right-4 bottom-10 z-10 border-2 border-accent bg-base-200 px-2 py-0.5 font-label text-[0.6rem] font-medium tracking-[0.18em] text-accent uppercase md:right-6 md:bottom-3" aria-hidden="true">
          Issued for production · v1.0
        </p>
      </figure>
    </div>

    <div class="lg:col-start-1 lg:row-start-2">
      <article
        v-for="(chapter, index) in chapters"
        :key="chapter.stage"
        data-chapter
        :data-stage="index + 1"
        class="flex min-h-[72svh] flex-col justify-start pt-2 pb-16 transition-opacity duration-500 lg:min-h-[calc(100svh-4rem)] lg:justify-center lg:py-12"
        :class="dim(index + 1)"
      >
        <p class="mb-5 flex items-center gap-3 eyebrow text-primary">
          <span class="h-px w-8 bg-primary" aria-hidden="true" />{{ pad(index + 2) }} — {{ chapter.stage }}
        </p>
        <h2 data-reveal="words" class="font-display text-[clamp(2rem,3.6vw,3.5rem)] leading-none font-bold tracking-[-0.025em] text-balance">
          {{ chapter.title }}
        </h2>
        <p class="mt-6 max-w-lg text-lg text-pretty text-base-content/75">
          {{ chapter.copy }}
        </p>
        <div class="mt-7">
          <p class="mb-2.5 eyebrow text-[0.6rem] text-base-content/50">
            You receive
          </p>
          <ul class="flex flex-wrap gap-2">
            <li v-for="item in chapter.gets" :key="item" class="badge gap-1.5 badge-outline border-secondary/50 py-3 font-label text-[0.65rem]">
              <Icon name="solar:check-read-linear" class="size-3.5 text-primary" />{{ item }}
            </li>
          </ul>
        </div>
        <button v-if="index === chapters.length - 1" class="btn mt-10 self-start btn-primary" @click="start()">
          Start yours
          <Icon name="solar:arrow-right-linear" class="size-4" />
        </button>
      </article>
    </div>
  </section>
</template>

<style scoped>
.marker {
  background-image: linear-gradient(
    transparent 84%,
    var(--color-primary) 84% 94%,
    transparent 94%
  );
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

/* The sheet is the story's single stage; it shouldn't light up like a card while the pointer rests on it. */
.sheet,
.sheet:hover {
  --mark: 0.875rem;
  border-color: color-mix(in oklab, var(--color-secondary) 55%, transparent);
  background-color: color-mix(in oklab, var(--color-base-200) 85%, transparent);
}
.sheet {
  --p1: 0;
  --p2: 0;
  --p3: 0;
  --p4: 0;
  --a0: clamp(0, calc(var(--p1) * 2 - 0.2), 1);
  --c: clamp(0, calc(var(--p3) * 1.6 - 0.25), 1);
}
.edge-x,
.edge-y {
  background-color: color-mix(in oklab, var(--color-secondary) 28%, transparent);
}

.blk {
  --a: clamp(0, calc(var(--p1) * 1.75 - var(--i) * 0.09), 1);
  --b: clamp(0, calc(var(--p2) * 1.75 - var(--i) * 0.09), 1);
  position: relative;
}
.wire {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  border: 1px dashed var(--color-secondary);
  border-radius: var(--radius-box);
  font-family: var(--font-label);
  font-size: 0.55rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-secondary);
  clip-path: inset(0 calc((1 - var(--a)) * 100%) calc((1 - var(--a)) * 100%) 0);
  opacity: calc(1 - var(--b));
}
.surface {
  position: absolute;
  inset: 0;
  border: 1px solid color-mix(in oklab, var(--color-base-content) 16%, transparent);
  border-radius: var(--radius-box);
  background-color: var(--color-base-100);
  opacity: var(--b);
}
.frame-layer .surface {
  background-color: var(--color-base-200);
}
.frame-layer .wire {
  border-style: solid;
  border-color: color-mix(in oklab, var(--color-secondary) 70%, transparent);
}
.skin {
  position: relative;
  opacity: clamp(0, calc(var(--b) * 2 - 1), 1);
}
.callout {
  position: absolute;
  top: -0.45rem;
  left: -0.45rem;
  z-index: 1;
  display: grid;
  place-items: center;
  width: 1.05rem;
  height: 1.05rem;
  border-radius: 999px;
  background-color: var(--color-primary);
  color: var(--color-primary-content);
  font: 700 0.55rem/1 var(--font-label);
  opacity: calc(var(--a) * (1 - var(--p3)));
  scale: var(--a);
}
.dot {
  display: block;
  width: 0.4rem;
  height: 0.4rem;
  border-radius: 999px;
  border: 1px solid color-mix(in oklab, var(--color-base-content) 50%, transparent);
}

.note {
  opacity: clamp(0, calc(1 - var(--p1) * 1.6), 1);
  transform: translate(calc(var(--p1) * 18%), calc(var(--p1) * -30%)) rotate(calc(-2.5deg + var(--p1) * 8deg))
    scale(calc(1 - var(--p1) * 0.25));
}
.caret {
  margin-left: 1px;
  animation: blink 1s steps(1) infinite;
}
@keyframes blink {
  50% {
    opacity: 0;
  }
}

.dim {
  opacity: calc(var(--a0) * (1 - var(--p3) * 0.6));
}
.dim-line {
  scale: var(--a0) 1;
}
.legend {
  opacity: var(--a0);
}

/* Revealed with a clip rather than a dash offset: dashes misbehave on a non-scaling stroke in a stretched viewBox. */
.trend,
.area {
  clip-path: inset(0 calc((1 - var(--c)) * 100%) 0 0);
}
.area {
  opacity: var(--c);
}
.row {
  --r: clamp(0, calc(var(--p3) * 2.2 - var(--j) * 0.3), 1);
  opacity: var(--r);
  translate: 0 calc((1 - var(--r)) * -4px);
}
.empty {
  opacity: clamp(0, calc(var(--p2) * 2 - 1 - var(--p3) * 3), 1);
}
.revnote {
  opacity: clamp(0, calc(var(--p2) * 2.5 - 1.5 - var(--p3) * 3), 1);
}
.live {
  opacity: var(--p4);
}
.stamp {
  opacity: clamp(0, calc(var(--p4) * 1.5 - 0.3), 1);
  transform: rotate(-4deg) scale(calc(1.6 - var(--p4) * 0.6));
  transform-origin: right bottom;
}

.titleblock :is(th, td) {
  border: 1px solid color-mix(in oklab, var(--color-secondary) 45%, transparent);
  padding: 0.3rem 0.45rem;
  text-align: left;
  font-weight: 400;
}
.titleblock th {
  width: 42%;
  color: var(--color-secondary);
}
.rev {
  display: inline-block;
  color: var(--color-primary);
}

@media (prefers-reduced-motion: no-preference) {
  .rev {
    animation: stamp 0.5s var(--ease-settle);
  }
}
@keyframes stamp {
  from {
    transform: scale(2.2) rotate(-12deg);
    opacity: 0;
  }
}
@media (prefers-reduced-motion: reduce) {
  .scroll-cue::after,
  .caret {
    animation: none;
  }
}
</style>
