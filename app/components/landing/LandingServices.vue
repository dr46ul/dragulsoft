<script setup lang="ts">
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const services = [
  {
    detail: 'A',
    title: 'Web apps & SaaS',
    lead: 'The product your business runs on.',
    copy: 'Customer portals, internal tools, dashboards and SaaS products, from the first usable version to the one that scales.',
    scope: [
      'Accounts, roles & billing',
      'Dashboards & reporting',
      'Integrations with your tools',
      'Admin & back office',
    ],
    demo: 'board',
  },
  {
    detail: 'B',
    title: 'Websites & landing pages',
    lead: 'Sites that load fast and sell clearly.',
    copy: 'Marketing sites and landing pages that are quick on any connection, easy for your team to edit, and easy to find.',
    scope: [
      'Content you edit yourself',
      'Several languages',
      'SEO & analytics',
      'Forms that reach you',
    ],
    demo: 'page',
  },
  {
    detail: 'C',
    title: 'AI integrations',
    lead: 'AI wired into the work you already do.',
    copy: 'Assistants, document search and automations connected to your own data and tools, with guardrails and costs kept in check.',
    scope: [
      'Assistants on your data',
      'Document extraction',
      'Workflow automation',
      'Evaluation & guardrails',
    ],
    demo: 'flow',
  },
] as const

const root = useTemplateRef<HTMLElement>('root')
const playing = ref(false)
let trigger: ScrollTrigger | undefined

useReveal(root)

// The card demos loop forever, so they only run while the section is on screen.
onMounted(() => {
  if (!root.value)
    return
  trigger = ScrollTrigger.create({
    trigger: root.value,
    start: 'top bottom',
    end: 'bottom top',
    onToggle: (self) => {
      playing.value = self.isActive
    },
  })
})
onBeforeUnmount(() => trigger?.kill())
</script>

<template>
  <section id="services" ref="root" class="border-t border-secondary/25" aria-labelledby="services-title">
    <div class="mx-auto max-w-[90rem] px-4 py-24 md:px-8 md:py-32">
      <div class="mb-14 grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end">
        <div>
          <p class="mb-5 flex items-center gap-3 eyebrow text-secondary">
            <span class="h-px w-8 bg-secondary" aria-hidden="true" />Sheet 02 · Services
          </p>
          <h2 id="services-title" data-reveal="words" class="font-display text-[clamp(2.25rem,5vw,4.5rem)] leading-[0.95] font-bold tracking-[-0.03em] text-balance">
            Three disciplines, one standard.
          </h2>
        </div>
        <p data-reveal="rise" class="max-w-md text-lg text-pretty text-base-content/75">
          Most projects mix them: a product with a marketing site in front and AI inside. One practice drawing all three keeps the seams out of sight.
        </p>
      </div>

      <ul data-reveal="stagger" class="grid gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-6" :class="{ playing }">
        <li v-for="service in services" :key="service.detail" class="card card-drawn">
          <div class="demo relative m-3 mb-0 h-40 overflow-hidden rounded-field border border-secondary/30 bg-base-100" aria-hidden="true">
            <span class="absolute top-2 left-2.5 font-label text-[0.55rem] tracking-[0.18em] text-secondary uppercase">Detail {{ service.detail }}</span>
            <span class="absolute top-2 right-2.5 font-label text-[0.55rem] tracking-[0.18em] text-base-content/40 uppercase">Scale 1:1</span>

            <div v-if="service.demo === 'board'" class="absolute inset-x-3 top-8 bottom-3 grid grid-cols-3 gap-2">
              <div v-for="column in ['To do', 'Doing', 'Done']" :key="column" class="flex flex-col gap-1.5 border border-dashed border-secondary/40 p-1.5">
                <span class="font-label text-[0.5rem] text-base-content/55 uppercase">{{ column }}</span>
                <span class="h-4 border border-base-content/25" />
                <span class="h-4 border border-base-content/25" />
              </div>
              <span class="mover absolute top-[1.45rem] left-1.5 h-4 w-[calc((100%-1rem)/3-0.75rem)] bg-primary shadow-lg" />
            </div>

            <div v-else-if="service.demo === 'page'" class="absolute inset-x-6 top-8 bottom-3 flex flex-col gap-1.5">
              <span class="loadbar absolute -top-2 left-0 h-px bg-primary" />
              <span class="piece h-2.5 w-full border border-base-content/30" style="--d: 0" />
              <span class="piece h-12 w-full bg-primary/85" style="--d: 1" />
              <span class="piece grid grid-cols-3 gap-1.5" style="--d: 2">
                <span class="h-8 border border-base-content/30" /><span class="h-8 border border-base-content/30" /><span class="h-8 border border-base-content/30" />
              </span>
              <span class="piece mx-auto h-3 w-1/3 rounded-full border border-primary" style="--d: 3" />
            </div>

            <div v-else class="flow absolute inset-x-0 top-8 bottom-2 grid grid-cols-3 items-center px-4">
              <span class="absolute top-[42%] right-[16%] left-[16%] h-px border-t border-dashed border-secondary/50" />
              <span class="pulse absolute top-[42%] left-[16%] size-2 -translate-y-1/2 rounded-full bg-primary" />
              <span v-for="(node, n) in ['Email in', 'AI drafts reply', 'Ticket filed']" :key="node" class="node relative z-10 mx-auto grid place-items-center gap-1.5 text-center" :style="{ '--n': n }">
                <span class="grid size-9 place-items-center border border-secondary/60 bg-base-100 font-label text-[0.6rem]" :class="n === 1 ? 'rotate-45' : 'rounded-full'">
                  <span :class="{ '-rotate-45': n === 1 }">{{ n + 1 }}</span>
                </span>
                <span class="font-label text-[0.5rem] leading-tight text-base-content/65 uppercase">{{ node }}</span>
              </span>
            </div>
          </div>

          <div class="card-body gap-3 p-6">
            <h3 class="card-title font-display text-2xl font-bold tracking-tight">
              {{ service.title }}
            </h3>
            <p class="font-medium text-secondary">
              {{ service.lead }}
            </p>
            <p class="text-pretty text-base-content/75">
              {{ service.copy }}
            </p>
            <ul class="mt-3 grid gap-2 border-t border-secondary/25 pt-4 text-sm">
              <li v-for="item in service.scope" :key="item" class="flex items-center gap-2.5">
                <Icon name="solar:check-read-linear" class="size-4 shrink-0 text-primary" />{{ item }}
              </li>
            </ul>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.demo :is(.mover, .piece, .loadbar, .pulse, .node > span:first-child) {
  animation-play-state: paused;
}
.playing .demo :is(.mover, .piece, .loadbar, .pulse, .node > span:first-child) {
  animation-play-state: running;
}

.mover {
  animation: move 6s var(--ease-settle) infinite;
}
@keyframes move {
  0%,
  20% {
    translate: 0 0;
    rotate: 0deg;
  }
  30% {
    rotate: -4deg;
  }
  40%,
  55% {
    translate: calc(100% + 1.25rem) 1.4rem;
    rotate: 0deg;
  }
  65% {
    rotate: 4deg;
  }
  75%,
  100% {
    translate: calc(200% + 2.5rem) 0;
    rotate: 0deg;
  }
}

.piece {
  animation: drop 4s var(--ease-settle) infinite;
  animation-delay: calc(var(--d) * 0.18s);
}
@keyframes drop {
  0% {
    opacity: 0;
    transform: translateY(-12px);
  }
  12%,
  85% {
    opacity: 1;
    transform: none;
  }
  100% {
    opacity: 0;
  }
}
.loadbar {
  animation: load 4s var(--ease-settle) infinite;
}
@keyframes load {
  0% {
    width: 0;
    opacity: 1;
  }
  25% {
    width: 100%;
    opacity: 1;
  }
  35%,
  100% {
    width: 100%;
    opacity: 0;
  }
}

.pulse {
  animation: travel 3s ease-in-out infinite;
}
@keyframes travel {
  0% {
    left: 16%;
    opacity: 0;
  }
  10%,
  90% {
    opacity: 1;
  }
  100% {
    left: 84%;
    opacity: 0;
  }
}
.node > span:first-child {
  animation: ping-node 3s ease-in-out infinite;
  animation-delay: calc(var(--n) * 1.25s);
}
@keyframes ping-node {
  0%,
  20%,
  100% {
    border-color: color-mix(in oklab, var(--color-secondary) 60%, transparent);
    color: inherit;
  }
  8% {
    border-color: var(--color-primary);
    color: var(--color-primary);
  }
}

@media (prefers-reduced-motion: reduce) {
  .demo :is(.mover, .piece, .loadbar, .pulse, .node > span:first-child) {
    animation: none;
  }
}
</style>
