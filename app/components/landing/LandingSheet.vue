<script setup lang="ts">
defineProps<{
  brief: string
}>()

const { brand } = useAppConfig()

const stages = [
  'Brief',
  'Spec',
  'Design',
  'Build',
  'Launch',
]
const current = stages[0]

const titleBlock = [
  { label: 'Project', value: 'Order desk' },
  { label: 'Client', value: 'Example' },
  { label: 'Drawn by', value: brand.name },
  { label: 'Stage', value: `01 · ${current}` },
  { label: 'Status', value: 'Received' },
  { label: 'Rev', value: '—' },
]

const pad = (value: number) => String(value).padStart(2, '0')
</script>

<template>
  <figure class="sheet relative w-full card-drawn rounded-box p-3 md:p-5" aria-labelledby="sheet-caption" aria-describedby="sheet-description">
    <div aria-hidden="true">
      <span class="pointer-events-none absolute inset-1.5">
        <i data-edge="x" class="absolute inset-x-0 top-0 h-px origin-left bg-secondary/28" />
        <i data-edge="x" class="absolute inset-x-0 bottom-0 h-px origin-right bg-secondary/28" />
        <i data-edge="y" class="absolute inset-y-0 left-0 w-px origin-top bg-secondary/28" />
        <i data-edge="y" class="absolute inset-y-0 right-0 w-px origin-bottom bg-secondary/28" />
      </span>

      <div class="mb-2 flex items-center gap-4 md:mb-3">
        <p class="shrink-0 eyebrow text-[0.625rem] text-secondary">
          Stage 01<span class="text-base-content/45"> / 05</span>
          <span class="text-base-content md:hidden"> · {{ current }}</span>
        </p>
        <div class="hidden flex-1 md:block">
          <ul class="steps w-full">
            <li
              v-for="(stage, index) in stages"
              :key="stage"
              class="step min-w-0 text-[0.6rem] before:h-px! after:size-6! after:font-label after:text-[0.55rem]"
              :class="{ 'step-primary': index === 0 }"
              :data-content="pad(index + 1)"
            >
              <span class="eyebrow text-[0.575rem] tracking-[0.14em]">{{ stage }}</span>
            </li>
          </ul>
        </div>
      </div>
      <progress class="progress mb-3 h-px w-full progress-primary md:mb-4" value="0" max="100" />

      <div class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_10rem]">
        <div class="relative h-44 overflow-clip pt-2 pb-6 pl-2 md:h-auto md:aspect-4/3 md:pt-5 md:pl-5 xl:aspect-11/10">
          <div class="pointer-events-none absolute top-0 right-0 left-5 hidden justify-between font-label text-[0.55rem] text-base-content/45 md:flex">
            <span v-for="n in 8" :key="n" data-tick>{{ n }}</span>
          </div>
          <div class="pointer-events-none absolute top-5 bottom-6 left-0 hidden flex-col justify-between font-label text-[0.55rem] text-base-content/45 md:flex">
            <span v-for="letter in 'ABCDE'" :key="letter" data-tick>{{ letter }}</span>
          </div>

          <div class="pointer-events-none absolute inset-x-4 top-1/2 mx-auto max-w-sm -translate-y-1/2 -rotate-[2.5deg] rounded-box bg-primary p-4 text-primary-content shadow-2xl md:p-5">
            <blockquote class="min-h-[4.2em] font-display text-base leading-snug font-medium md:text-xl">
              “{{ brief }}<span class="caret">▍</span>”
            </blockquote>
            <p class="mt-3 eyebrow text-[0.6rem] opacity-70">
              Client brief · received
            </p>
          </div>

          <div class="pointer-events-none absolute right-0 bottom-0 left-0 flex h-3 items-center gap-2 border-x border-secondary font-label text-[0.55rem] text-secondary opacity-0 md:left-5">
            <span class="h-px flex-1 origin-right bg-secondary" />
            <span>W 1280 · fluid to 360</span>
            <span class="h-px flex-1 origin-left bg-secondary" />
          </div>
        </div>

        <table class="mt-auto hidden w-full font-label text-[0.575rem] uppercase xl:table [&_td]:border [&_td]:border-secondary/45 [&_td]:px-2 [&_td]:py-1 [&_th]:w-[42%] [&_th]:border [&_th]:border-secondary/45 [&_th]:px-2 [&_th]:py-1 [&_th]:text-left [&_th]:font-normal [&_th]:text-secondary">
          <tbody>
            <tr v-for="{ label, value } in titleBlock" :key="label">
              <th>{{ label }}</th>
              <td :class="{ 'text-primary': label === 'Rev' }">
                {{ value }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <figcaption class="mt-2 flex justify-between gap-4 eyebrow text-[0.575rem] text-base-content/50 md:mt-3">
      <span id="sheet-caption">Example product · not a client project</span>
      <span id="sheet-description" class="sr-only">An order dashboard with an AI assistant, drawn at the {{ current }} stage.</span>
    </figcaption>
  </figure>
</template>

<style scoped>
.sheet,
.sheet:hover {
  --mark: 0.875rem;
  border-color: color-mix(in oklab, var(--color-secondary) 55%, transparent);
  background-color: color-mix(in oklab, var(--color-base-200) 85%, transparent);
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
@media (prefers-reduced-motion: reduce) {
  .caret {
    animation: none;
  }
}
</style>
