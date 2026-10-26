<script setup lang="ts">
import { ANSWER, LEGEND, STAGES } from '~/data/story'

defineProps<{
  brief: string
}>()

const { brand } = useAppConfig()
const { levels, progress, stage, build, launched } = useStory()

const sheet = useTemplateRef<HTMLElement>('sheet')
const onscreen = useOnscreen(sheet)

const arrivals = ref(0)
const figures = computed(() => figuresAt(build.value, arrivals.value))
const streamed = computed(() => streamedAnswer(build.value))
const streaming = computed(() => build.value > 0.12 && streamed.value.length < ANSWER.length)
const titleBlock = computed(() => titleBlockFor(stage.value, brand.name))
const current = computed(() => STAGES[stage.value]?.label ?? 'Brief')

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
onBeforeUnmount(() => clearInterval(arrivalTimer))

const pad = (value: number) => String(value).padStart(2, '0')
</script>

<template>
  <figure
    ref="sheet"
    class="sheet relative w-full card-drawn rounded-box p-3 md:p-5"
    :style="{
      '--p1': levels[0],
      '--p2': levels[1],
      '--p3': levels[2],
      '--p4': levels[3],
      '--play-state': onscreen ? 'running' : 'paused',
    }"
    aria-labelledby="sheet-caption"
    aria-describedby="sheet-description"
  >
    <span class="pointer-events-none absolute inset-1.5" aria-hidden="true">
      <i data-edge="x" class="absolute inset-x-0 top-0 h-px origin-left bg-secondary/28" />
      <i data-edge="x" class="absolute inset-x-0 bottom-0 h-px origin-right bg-secondary/28" />
      <i data-edge="y" class="absolute inset-y-0 left-0 w-px origin-top bg-secondary/28" />
      <i data-edge="y" class="absolute inset-y-0 right-0 w-px origin-bottom bg-secondary/28" />
    </span>

    <!-- A div rather than a header: the page's nav tests find the page header with `locator('header')`. -->
    <div class="mb-2 flex items-center gap-4 md:mb-3">
      <p class="shrink-0 eyebrow text-[0.625rem] text-secondary" aria-hidden="true">
        Stage {{ pad(stage + 1) }}<span class="text-base-content/45"> / 05</span>
        <span class="text-base-content md:hidden"> · {{ current }}</span>
      </p>
      <nav class="hidden flex-1 md:block" aria-label="Project stages">
        <ul class="steps w-full">
          <li
            v-for="(item, index) in STAGES"
            :key="item.label"
            class="step min-w-0 text-[0.6rem] before:h-px! after:size-6! after:font-label after:text-[0.55rem]"
            :class="{ 'step-primary': index <= stage }"
            :data-content="pad(index + 1)"
          >
            <button
              type="button"
              class="cursor-pointer rounded-field px-1 eyebrow text-[0.575rem] tracking-[0.14em] hover:text-primary"
              :aria-current="index === stage ? 'step' : undefined"
              @click="goToStage(index)"
            >
              {{ item.label }}
            </button>
          </li>
        </ul>
      </nav>
    </div>

    <div aria-hidden="true">
      <progress class="progress mb-3 h-px w-full progress-primary md:mb-4" :value="progress * 100" max="100" />

      <div class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_10rem]">
        <div class="relative min-h-44 overflow-clip pt-2 pb-6 pl-2 md:min-h-0 md:aspect-4/3 md:pt-5 md:pl-5 xl:aspect-11/10">
          <div class="pointer-events-none absolute top-0 right-0 left-5 hidden justify-between font-label text-[0.55rem] text-base-content/45 md:flex">
            <span v-for="n in 8" :key="n" data-tick>{{ n }}</span>
          </div>
          <div class="pointer-events-none absolute top-5 bottom-6 left-0 hidden flex-col justify-between font-label text-[0.55rem] text-base-content/45 md:flex">
            <span v-for="letter in 'ABCDE'" :key="letter" data-tick>{{ letter }}</span>
          </div>

          <LandingOrderDesk :figures :streamed :streaming :live="launched" />

          <div class="note pointer-events-none absolute inset-x-4 top-1/2 mx-auto max-w-sm -translate-y-1/2 rounded-box bg-primary p-4 text-primary-content shadow-2xl md:p-5">
            <blockquote class="min-h-[4.2em] font-display text-base leading-snug font-medium md:text-xl">
              “{{ brief }}<span class="caret">▍</span>”
            </blockquote>
            <p class="mt-3 eyebrow text-[0.6rem] opacity-70">
              Client brief · received
            </p>
          </div>

          <div class="dim pointer-events-none absolute right-0 bottom-0 left-0 flex h-3 items-center gap-2 border-x border-secondary font-label text-[0.55rem] text-secondary md:left-5">
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
              <li v-for="(name, index) in LEGEND" :key="name" class="flex gap-2">
                <span class="text-primary">{{ pad(index + 1) }}</span>{{ name }}
              </li>
            </ol>
          </div>
          <table class="mt-auto w-full font-label text-[0.575rem] uppercase [&_td]:border [&_td]:border-secondary/45 [&_td]:px-2 [&_td]:py-1 [&_th]:w-[42%] [&_th]:border [&_th]:border-secondary/45 [&_th]:px-2 [&_th]:py-1 [&_th]:text-left [&_th]:font-normal [&_th]:text-secondary">
            <tbody>
              <tr v-for="{ label, value } in titleBlock" :key="label">
                <th>{{ label }}</th>
                <td :class="{ 'text-primary': label === 'Rev' }">
                  <span :key="value" :class="{ rev: label === 'Rev' && stage > 0 }">{{ value }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </aside>
      </div>
    </div>

    <figcaption class="mt-2 flex justify-between gap-4 eyebrow text-[0.575rem] text-base-content/50 md:mt-3">
      <span id="sheet-caption">Example product · not a client project</span>
      <span id="sheet-description" class="sr-only">An order dashboard with an AI assistant, drawn at the {{ current }} stage.</span>
    </figcaption>

    <!-- Sits in the caption strip, and scales from its bottom-right corner so the hidden, enlarged stamp never overflows the page sideways. -->
    <p class="stamp pointer-events-none absolute right-4 bottom-10 z-10 border-2 border-accent bg-base-200 px-2 py-0.5 font-label text-[0.6rem] font-medium tracking-[0.18em] text-accent uppercase md:right-6 md:bottom-3" aria-hidden="true">
      Issued for production · v1.0
    </p>
  </figure>
</template>

<style scoped>
.sheet,
.sheet:hover {
  --mark: 0.875rem;
  border-color: color-mix(in oklab, var(--color-secondary) 55%, transparent);
  background-color: color-mix(in oklab, var(--color-base-200) 85%, transparent);
}
.sheet {
  --a0: clamp(0, calc(var(--p1) * 2 - 0.2), 1);
  --c: clamp(0, calc(var(--p3) * 1.6 - 0.25), 1);
}

.note {
  opacity: clamp(0, calc(1 - var(--p1) * 1.6), 1);
  transform: translate(calc(var(--p1) * 18%), calc(var(--p1) * -30%)) rotate(calc(-2.5deg + var(--p1) * 8deg))
    scale(calc(1 - var(--p1) * 0.25));
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
.stamp {
  opacity: clamp(0, calc(var(--p4) * 1.5 - 0.3), 1);
  transform: rotate(-4deg) scale(calc(1.6 - var(--p4) * 0.6));
  transform-origin: right bottom;
}

.rev {
  display: inline-block;
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

.caret {
  margin-left: 1px;
  animation: blink 1s steps(1) infinite;
  animation-play-state: var(--play-state, running);
}
@keyframes blink {
  50% {
    opacity: 0;
  }
}
@media (prefers-reduced-motion: reduce) {
  .caret {
    animation: none;
  }
}
</style>
