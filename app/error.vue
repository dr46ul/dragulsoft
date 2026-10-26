<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

const { brand } = useAppConfig()
const route = useRoute()

// Nuxt still fills the deprecated statusCode on errors raised by older callers.
const status = computed(() => props.error.status ?? props.error.statusCode ?? 500)
const copy = computed(() => errorCopy(status.value, props.error.statusText))
const path = computed(() => route.path)

useHead({
  title: () => `${status.value} · ${copy.value.label} · ${brand.name}`,
})

// Matches the 96px major grid of the bg-drafting utility.
const CELL = 96
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

// The server can't know the viewport, so it renders enough ruler marks for a 2304x1344 screen and the client
// replaces the count on mount; the root clips whatever overshoots.
const rulers = reactive({ cols: 24, rows: 14 })
const target = reactive({ col: 9, row: 2 })
const cross = reactive({ x: CELL * 10, y: CELL * 3, live: false })
// The first placement happens before the visitor has seen the page, so it must not ease in from the server position.
const eased = ref(false)

const cell = computed(() => ({
  col: Math.floor(cross.x / CELL),
  row: Math.floor(cross.y / CELL),
}))
const gridRef = computed(() => `${LETTERS[cell.value.row] ?? '?'}${cell.value.col + 1}`)
// The empty cell is two columns wide to match its w-48 box.
const onTarget = computed(() => {
  const { col, row } = cell.value
  return col >= target.col && col < target.col + 2 && row === target.row
})
const targetRef = computed(() => `${LETTERS[target.row] ?? '?'}${target.col + 1}`)

function park() {
  rulers.cols = Math.ceil(window.innerWidth / CELL)
  rulers.rows = Math.min(LETTERS.length, Math.ceil(window.innerHeight / CELL))
  // The empty cell sits about two thirds across and a third down, where the eye lands first on a landscape
  // screen, and clear of the copy block anchored bottom-left.
  target.col = Math.max(1, Math.floor((window.innerWidth * 0.66) / CELL) - 1)
  target.row = Math.max(1, Math.floor((window.innerHeight * 0.32) / CELL))
  cross.x = (target.col + 1) * CELL
  cross.y = target.row * CELL + CELL / 2
  cross.live = false
}

function follow(event: PointerEvent) {
  if (event.pointerType !== 'mouse')
    return
  cross.x = event.clientX
  cross.y = event.clientY
  cross.live = true
}

// A touch or pen pointer also fires pointerleave when it lifts, which would yank the crosshair away mid-tap.
function leave(event: PointerEvent) {
  if (event.pointerType === 'mouse')
    park()
}

onMounted(() => {
  park()
  requestAnimationFrame(() => {
    eased.value = true
  })
  window.addEventListener('resize', park)
  if (!prefersReducedMotion())
    window.addEventListener('pointermove', follow)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', park)
  window.removeEventListener('pointermove', follow)
})

const home = () => clearError({ redirect: '/' })
const retry = () => reloadNuxtApp({ force: true })
</script>

<template>
  <div class="relative min-h-svh overflow-hidden bg-drafting text-base-content" @pointerleave="leave">
    <div class="pointer-events-none absolute inset-0" aria-hidden="true">
      <div class="absolute inset-x-0 top-0 flex h-6 border-b border-secondary/30 bg-base-200/70 font-label text-[0.6rem] text-base-content/50">
        <span v-for="n in rulers.cols" :key="n" class="flex w-24 shrink-0 items-center justify-center">{{ n }}</span>
      </div>
      <div class="absolute inset-y-0 left-0 flex w-6 flex-col border-r border-secondary/30 bg-base-200/70 font-label text-[0.6rem] text-base-content/50">
        <span
          v-for="letter in LETTERS.slice(0, rulers.rows)"
          :key="letter"
          class="flex h-24 shrink-0 items-center justify-center"
        >
          {{ letter }}
        </span>
      </div>

      <div
        :style="{ left: `${target.col * CELL}px`, top: `${target.row * CELL}px` }"
        class="target absolute hidden h-24 w-48 border-2 border-dashed border-accent/80 bg-accent/5 md:block"
      >
        <span class="absolute -top-5 left-0 max-w-full truncate font-label text-[0.6rem] text-accent">{{ path }}</span>
      </div>

      <div
        :class="{ live: cross.live, eased }"
        :style="{ '--x': `${cross.x}px`, '--y': `${cross.y}px` }"
        class="crosshair hidden md:block"
      >
        <span class="line-x absolute inset-x-0 top-0 h-px bg-primary/70" />
        <span class="line-y absolute inset-y-0 left-0 w-px bg-primary/70" />
        <span class="reticle absolute top-0 left-0 size-5 rounded-full border border-primary" />
        <span
          :class="onTarget ? 'badge-accent' : 'badge-primary'"
          class="chip badge absolute top-0 left-0 rounded-none badge-outline bg-base-200 font-label text-[0.6rem] tracking-[0.12em] whitespace-nowrap uppercase"
        >
          {{ gridRef }} · {{ onTarget ? copy.label : 'Blank' }}
        </span>
      </div>
    </div>

    <main class="relative flex min-h-svh flex-col justify-between gap-12 pt-12 pr-4 pb-28 pl-10 md:pt-14 md:pl-14">
      <NuxtLink to="/" class="flex w-fit items-center gap-3 rounded-field" @click.prevent="home">
        <BrandMark class="size-9" />
        <span class="font-display text-[1.05rem] font-extrabold tracking-[0.08em] uppercase">{{ brand.name }}</span>
      </NuxtLink>

      <div class="max-w-2xl">
        <p class="eyebrow text-secondary">
          Error {{ status }} · grid ref {{ targetRef }}
        </p>
        <div class="relative mt-8 inline-block pb-9" aria-hidden="true">
          <p class="numeral outlined-text font-display text-[clamp(7rem,22vw,17rem)] leading-[0.78] font-extrabold tracking-[-0.05em]">
            {{ status }}
          </p>
          <span class="absolute inset-x-0 bottom-0 flex h-3 items-center gap-2 border-x border-secondary font-label text-[0.6rem] text-secondary">
            <span class="dim-line h-px flex-1 origin-right bg-secondary" />
            <span class="max-w-[60%] truncate">GET {{ path }}</span>
            <span class="dim-line h-px flex-1 origin-left bg-secondary" />
          </span>
        </div>
        <h1 class="mt-10 font-display text-[clamp(2rem,4vw,3.5rem)] leading-none font-bold tracking-[-0.03em] text-balance">
          {{ copy.title }}
        </h1>
        <p class="mt-6 max-w-xl text-lg text-pretty text-base-content/80">
          {{ copy.lede }}
        </p>
        <div class="mt-8 flex flex-wrap gap-3">
          <button v-if="copy.retryable" type="button" class="btn btn-lg btn-primary" @click="retry">
            Try again
          </button>
          <button
            :class="copy.retryable ? 'btn-ghost' : 'btn-primary'"
            type="button"
            class="btn btn-lg"
            @click="home"
          >
            Back to the homepage
          </button>
        </div>
      </div>
    </main>
  </div>
</template>
