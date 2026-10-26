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
  <main>
    <h1>{{ gridRef }} {{ copy.title }} {{ rulers.cols }} {{ target.col }} {{ eased }} {{ onTarget }} {{ targetRef }} {{ path }}</h1>
  </main>
</template>

<style scoped>
.line-x {
  translate: 0 var(--y);
}
.line-y {
  translate: var(--x) 0;
}
.reticle {
  translate: calc(var(--x) - 50%) calc(var(--y) - 50%);
}
.chip {
  translate: calc(var(--x) + 14px) calc(var(--y) + 14px);
}
.numeral {
  background-image: linear-gradient(var(--color-primary), var(--color-primary));
  background-size: 100% 18%;
}

@media (prefers-reduced-motion: no-preference) {
  .numeral {
    animation: fill 1.4s var(--ease-draft) 0.9s both;
  }
  .dim-line {
    animation: measure 0.9s var(--ease-draft) 0.3s both;
  }
  .crosshair.eased > * {
    transition: translate 0.6s var(--ease-settle);
  }
  .crosshair.eased.live > * {
    transition-duration: 0.12s;
  }
  .target {
    animation: blink 1.6s steps(1) 3;
  }
}
@keyframes fill {
  from {
    background-size: 100% 0%;
  }
}
@keyframes measure {
  from {
    scale: 0 1;
  }
}
@keyframes blink {
  50% {
    border-color: transparent;
  }
}
</style>
