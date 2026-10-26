<script setup lang="ts">
import { ANSWER, ORDERS, QUESTION } from '~/data/story'

const { figures, streamed, streaming, live } = defineProps<{
  figures: { orders: string, revenue: string, basket: string }
  streamed: string
  streaming: boolean
  live: boolean
}>()

const kpis = computed(() => [
  { label: 'Orders today', value: figures.orders },
  { label: 'Revenue', value: figures.revenue },
  { label: 'Avg. basket', value: figures.basket },
])
</script>

<template>
  <!-- Container queries, not viewport ones, decide the layout: the sheet's width varies with the grid around it. -->
  <div class="mock relative @container p-1.5 text-[0.625rem] leading-snug @md:p-2 @md:text-[0.6875rem]">
    <div class="blk frame absolute! inset-0" style="--i: 0">
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
                <span class="status status-success" :class="{ 'animate-ping [animation-play-state:var(--play-state,running)]': live }" />
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
                <path class="trend stroke-primary" fill="none" stroke-width="2" stroke-linejoin="round" vector-effect="non-scaling-stroke" d="M0 54 L33 46 L66 50 L100 34 L133 38 L166 18 L200 10" />
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
                  {{ QUESTION }}
                </div>
              </div>
              <div class="chat-start chat p-0">
                <div class="chat-bubble min-h-0 bg-base-200 px-2 py-1 text-[length:inherit] text-base-content">
                  <!-- The invisible full answer holds the bubble at its final size, so streaming never shifts the layout. -->
                  <span class="grid *:[grid-area:1/1]">
                    <span class="invisible">{{ ANSWER }}</span>
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
                  <th>Order</th>
                  <th>Region</th>
                  <th class="hidden @sm:table-cell">
                    Channel
                  </th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(order, index) in ORDERS" :key="order.id" class="row" :class="{ 'hidden @xs:table-row': index === 3 }" :style="{ '--j': index }">
                  <td class="font-label">
                    #{{ order.id }}
                  </td>
                  <td>{{ order.region }}</td>
                  <td class="hidden @sm:table-cell">
                    {{ order.channel }}
                  </td>
                  <td class="tabular-nums">
                    {{ order.total }}
                  </td>
                  <td>
                    <span class="badge badge-xs" :class="order.paid ? 'badge-success' : 'badge-warning'">{{ order.paid ? 'Paid' : 'Pending' }}</span>
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

    <p class="revnote absolute right-3 bottom-[4.5rem] hidden font-label text-[0.6rem] tracking-wide text-accent uppercase @sm:block">
      Δ B · empty, loading &amp; error states drawn
    </p>
  </div>
</template>

<style scoped>
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
.frame .surface {
  background-color: var(--color-base-200);
}
.frame .wire {
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
