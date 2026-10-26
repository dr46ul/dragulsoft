<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

const { brand } = useAppConfig()
const route = useRoute()

// Nuxt still fills the deprecated statusCode on errors raised by older callers.
const status = computed(() => props.error.status ?? props.error.statusCode ?? 500)
const copy = computed(() => errorCopy(status.value, props.error.statusText))
const retryable = computed(() => status.value >= 500)
const path = computed(() => route.path)

useHead({
  title: () => `${status.value} · ${copy.value.label} · ${brand.name}`,
})

// Matches the 96px major grid of the bg-drafting utility.
const CELL = 96
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

const target = reactive({ col: 9, row: 2 })
const cross = reactive({ x: CELL * 10, y: CELL * 3, live: false })

const gridRef = computed(() => {
  const col = Math.floor(cross.x / CELL)
  const row = Math.floor(cross.y / CELL)
  return `${LETTERS[row] ?? '?'}${col + 1}`
})
const onTarget = computed(() => {
  const col = Math.floor(cross.x / CELL)
  const row = Math.floor(cross.y / CELL)
  return col >= target.col && col < target.col + 2 && row === target.row
})

function park() {
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

onMounted(() => {
  park()
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
  <div class="relative min-h-svh overflow-hidden bg-drafting text-base-content" @pointerleave="park">
    <div class="pointer-events-none absolute inset-0" aria-hidden="true">
      <div class="absolute inset-x-0 top-0 flex h-6 border-b border-secondary/30 bg-base-200/70 font-label text-[0.6rem] text-base-content/50">
        <span v-for="n in 24" :key="n" class="flex w-24 shrink-0 items-center justify-center">{{ n }}</span>
      </div>
      <div class="absolute inset-y-0 left-0 flex w-6 flex-col border-r border-secondary/30 bg-base-200/70 font-label text-[0.6rem] text-base-content/50">
        <span
          v-for="letter in LETTERS.slice(0, 14)"
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
        :class="{ live: cross.live }"
        :style="{ '--x': `${cross.x}px`, '--y': `${cross.y}px` }"
        class="crosshair hidden md:block"
      >
        <span class="line-x absolute inset-x-0 top-0 h-px bg-primary/70" />
        <span class="line-y absolute inset-y-0 left-0 w-px bg-primary/70" />
        <span class="reticle absolute top-0 left-0 size-5 rounded-full border border-primary" />
        <span
          :class="onTarget ? 'border-accent text-accent' : 'border-primary text-primary'"
          class="chip absolute top-0 left-0 border bg-base-200 px-2 py-1 font-label text-[0.6rem] tracking-[0.12em] whitespace-nowrap uppercase"
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
          Error {{ status }} · grid ref {{ LETTERS[target.row] }}{{ target.col + 1 }}–{{ target.col + 2 }}
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
          <button v-if="retryable" type="button" class="btn btn-lg btn-primary" @click="retry">
            Try again
          </button>
          <button
            :class="retryable ? 'btn-ghost' : 'btn-primary'"
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
  .crosshair > * {
    transition: translate 0.6s var(--ease-settle);
  }
  .crosshair.live > * {
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
