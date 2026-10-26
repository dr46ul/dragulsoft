<script setup lang="ts">
const { brand } = useAppConfig()
const { start } = useContact()

type Glyph = 'form' | 'chart' | 'card' | 'table' | 'plug' | 'text' | 'cards' | 'tags' | 'chat' | 'search' | 'extract' | 'flow'

const kinds = [
  {
    key: 'app',
    label: 'Web app / SaaS',
    noun: 'a web app',
    features: [
      { key: 'auth', label: 'Accounts & sign-in', glyph: 'form' },
      { key: 'dashboard', label: 'Dashboards & reports', glyph: 'chart' },
      { key: 'payments', label: 'Payments & billing', glyph: 'card' },
      { key: 'admin', label: 'Admin panel', glyph: 'table' },
      { key: 'integrations', label: 'Integrations', glyph: 'plug' },
    ],
  },
  {
    key: 'site',
    label: 'Website',
    noun: 'a website',
    features: [
      { key: 'cms', label: 'Content editing (CMS)', glyph: 'text' },
      { key: 'blog', label: 'Blog or news', glyph: 'cards' },
      { key: 'i18n', label: 'Several languages', glyph: 'tags' },
      { key: 'leads', label: 'Contact & lead forms', glyph: 'form' },
      { key: 'analytics', label: 'Analytics', glyph: 'chart' },
    ],
  },
  {
    key: 'ai',
    label: 'AI integration',
    noun: 'an AI integration',
    features: [
      { key: 'assistant', label: 'Chat assistant', glyph: 'chat' },
      { key: 'docsearch', label: 'Search your documents', glyph: 'search' },
      { key: 'extract', label: 'Extract data from files', glyph: 'extract' },
      { key: 'workflow', label: 'Automate a workflow', glyph: 'flow' },
    ],
  },
] as const satisfies readonly { key: string, label: string, noun: string, features: readonly { key: string, label: string, glyph: Glyph }[] }[]

const starts = [
  { key: 'idea', label: 'Just an idea', text: 'just an idea' },
  { key: 'designs', label: 'Have designs', text: 'existing designs' },
  { key: 'existing', label: 'Live product', text: 'a product that already exists' },
] as const
const whens = ['As soon as possible', 'Within a quarter', 'No fixed date'] as const
const whenText = ['would like to launch as soon as possible', 'are aiming to launch within a quarter', 'have no fixed launch date'] as const
const cadences = [
  'Weekly releases, smallest useful version first.',
  'A release per milestone, each one demoed.',
  'Paced to your budget, shipped when it’s right.',
] as const

const chosenKinds = ref<string[]>(['app', 'ai'])
const chosenFeatures = ref<string[]>(['auth', 'dashboard', 'assistant'])
const startingPoint = ref<string>('idea')
const when = ref(1)
const projectName = ref('')

const activeKinds = computed(() => kinds.filter(kind => chosenKinds.value.includes(kind.key)))
const modules = computed(() => activeKinds.value.flatMap(kind =>
  kind.features
    .filter(feature => chosenFeatures.value.includes(feature.key))
    .map(feature => ({ ...feature, kind: kind.key })),
))

const name = computed(() => projectName.value.trim() || 'Your product')
const slug = computed(() => name.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'your-product')

const revision = ref(0)
watch([
  chosenKinds,
  chosenFeatures,
  startingPoint,
  when,
], () => revision.value++, { deep: true })
const rev = computed(() => String.fromCharCode(65 + (revision.value % 26)))

// Proportions only, never durations: a figure here would read as a quote nobody has made.
const plan = computed(() => {
  const fromIdea = startingPoint.value === 'idea'
  const hasDesigns = startingPoint.value === 'designs'
  const weights = [
    {
      label: 'Spec',
      weight: fromIdea ? 2 : 1.2,
      tone: 'spec',
    },
    {
      label: 'Design',
      weight: hasDesigns
        ? 0.8
        : fromIdea ? 3 : 2,
      tone: 'design',
    },
    { label: 'Build', weight: 2 + modules.value.length * 0.9 + activeKinds.value.length * 0.4, tone: 'build' },
    {
      label: 'Launch',
      weight: chosenKinds.value.includes('site')
        ? 1.4
        : 1,
      tone: 'launch',
    },
  ]
  const total = weights.reduce((sum, phase) => sum + phase.weight, 0)
  return weights.map(phase => ({ ...phase, share: (phase.weight / total) * 100 }))
})

function list(items: readonly string[]) {
  if (items.length < 2)
    return items.join('')
  return `${items.slice(0, -1).join(', ')} and ${items.at(-1)}`
}
const brief = computed(() => {
  const parts = activeKinds.value.map((kind) => {
    const features = kind.features.filter(feature => chosenFeatures.value.includes(feature.key)).map(feature => feature.label.toLowerCase())
    return features.length
      ? `${kind.noun} with ${list(features)}`
      : kind.noun
  })
  if (!parts.length)
    return ''
  const from = starts.find(option => option.key === startingPoint.value)?.text ?? 'just an idea'
  const what = parts.length > 1
    ? `${parts.slice(0, -1).join(', ')}, plus ${parts.at(-1)}`
    : parts.join('')
  return `${name.value}: ${what}. We’re starting from ${from}, and ${whenText[when.value]}.`
})

const root = useTemplateRef<HTMLElement>('root')
useReveal(root)
</script>

<template>
  <section id="brief" ref="root" class="border-t border-secondary/25" aria-labelledby="brief-title">
    <div class="mx-auto max-w-[90rem] px-4 py-24 md:px-8 md:py-32">
      <div class="mb-14 grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end">
        <div>
          <p class="mb-5 flex items-center gap-3 eyebrow text-primary">
            <span class="h-px w-8 bg-primary" aria-hidden="true" />Sheet 06 · Your brief
          </p>
          <h2 id="brief-title" data-reveal="words" class="font-display text-[clamp(2.5rem,6vw,5.5rem)] leading-[0.92] font-bold tracking-[-0.035em] text-balance">
            Draw up your project.
          </h2>
        </div>
        <p data-reveal="rise" class="max-w-md text-lg text-pretty text-base-content/75">
          Pick what you need. The drawing and a written brief update as you go. Send it when it looks right, and the reply is questions, not a sales deck.
        </p>
      </div>

      <div class="grid gap-10 lg:grid-cols-[22rem_minmax(0,1fr)] xl:gap-14">
        <form class="flex flex-col gap-7" aria-label="Project specification" @submit.prevent="start(brief)">
          <fieldset class="fieldset gap-3">
            <legend class="fieldset-legend eyebrow text-secondary">
              01 · What are you building?
            </legend>
            <div class="flex flex-wrap gap-2">
              <input
                v-for="kind in kinds"
                :key="kind.key"
                v-model="chosenKinds"
                type="checkbox"
                class="btn btn-outline btn-sm"
                :value="kind.key"
                :aria-label="kind.label"
              >
            </div>
          </fieldset>

          <fieldset class="fieldset gap-3">
            <legend class="fieldset-legend eyebrow text-secondary">
              02 · What should it do?
            </legend>
            <p v-if="!activeKinds.length" class="text-sm text-base-content/60">
              Choose at least one thing to build above.
            </p>
            <TransitionGroup name="group" tag="div" class="flex flex-col gap-3">
              <div v-for="kind in activeKinds" :key="kind.key" class="rounded-box border border-secondary/35 p-3">
                <p class="mb-1.5 font-label text-[0.6rem] tracking-[0.2em] text-base-content/55 uppercase">
                  {{ kind.label }}
                </p>
                <label v-for="feature in kind.features" :key="feature.key" class="label flex cursor-pointer gap-3 py-1 text-sm text-base-content">
                  <input v-model="chosenFeatures" type="checkbox" class="checkbox checkbox-sm checkbox-primary" :value="feature.key">
                  {{ feature.label }}
                </label>
              </div>
            </TransitionGroup>
          </fieldset>

          <fieldset class="fieldset gap-3">
            <legend class="fieldset-legend eyebrow text-secondary">
              03 · Where are you starting?
            </legend>
            <div class="join w-full">
              <input
                v-for="option in starts"
                :key="option.key"
                v-model="startingPoint"
                type="radio"
                name="brief-start"
                class="btn join-item flex-1 btn-outline btn-sm"
                :value="option.key"
                :aria-label="option.label"
              >
            </div>
          </fieldset>

          <fieldset class="fieldset gap-3">
            <legend class="fieldset-legend eyebrow text-secondary">
              04 · When should it launch?
            </legend>
            <input v-model.number="when" type="range" min="0" max="2" step="1" class="range w-full range-sm range-primary" aria-label="Launch timing" :aria-valuetext="whens[when]">
            <div class="flex justify-between font-label text-[0.6rem] uppercase">
              <span v-for="(label, index) in whens" :key="label" :class="index === when ? 'text-primary' : 'text-base-content/50'">{{ label }}</span>
            </div>
          </fieldset>

          <fieldset class="fieldset gap-3">
            <legend class="fieldset-legend eyebrow text-secondary">
              05 · Name it (optional)
            </legend>
            <input v-model="projectName" class="input w-full font-label" placeholder="Your product" maxlength="32" aria-label="Project name">
          </fieldset>
        </form>

        <div class="lg:sticky lg:top-24 lg:self-start">
          <figure class="card card-drawn p-4 md:p-6" :aria-label="`Drawing of ${name}`">
            <div class="mb-3 flex items-center gap-2 font-label text-[0.6rem] tracking-[0.2em] text-secondary uppercase" aria-hidden="true">
              <span class="h-px flex-1 bg-secondary/60" /><span>w · responsive · 360 → 1920</span><span class="h-px flex-1 bg-secondary/60" />
            </div>

            <div class="rounded-field border border-secondary/60 bg-base-100/60">
              <div class="flex items-center gap-3 border-b border-secondary/60 px-3 py-2">
                <span class="flex gap-1.5" aria-hidden="true"><i class="dot" /><i class="dot" /><i class="dot" /></span>
                <span class="flex-1 truncate rounded-field border border-secondary/30 px-2 py-0.5 font-label text-[0.65rem]">{{ slug }}.app</span>
              </div>
              <div class="relative min-h-72 p-4">
                <p v-if="!modules.length" class="grid min-h-64 place-items-center border border-dashed border-secondary/40 text-center font-label text-xs text-base-content/70">
                  Pick what it should do.<br>The drawing starts here.
                </p>
                <TransitionGroup name="draw" tag="ol" class="grid grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] gap-3">
                  <li v-for="(module, index) in modules" :key="module.key" class="module relative border border-base-content/60 p-3 pt-6" :class="`kind-${module.kind}`">
                    <span class="absolute -top-2.5 -left-2.5 grid size-5 place-items-center rounded-full bg-primary font-label text-[0.6rem] font-bold text-primary-content">{{ index + 1 }}</span>
                    <div class="glyph h-14" aria-hidden="true">
                      <template v-if="module.glyph === 'form'">
                        <span class="ln w-full" /><span class="ln w-full" /><span class="block-fill mt-1 h-3 w-1/2" />
                      </template>
                      <template v-else-if="module.glyph === 'chart'">
                        <span class="flex h-full items-end gap-1"><span v-for="h in [40, 65, 50, 85, 70, 95]" :key="h" class="bar flex-1" :style="{ height: `${h}%` }" /></span>
                      </template>
                      <template v-else-if="module.glyph === 'card'">
                        <span class="relative block h-full rounded-sm border border-current"><span class="absolute top-2 left-2 h-2.5 w-3.5 rounded-[2px] bg-primary" /><span class="ln absolute right-2 bottom-2 left-2" /></span>
                      </template>
                      <template v-else-if="module.glyph === 'table'">
                        <span v-for="r in 4" :key="r" class="ln w-full" :class="r === 1 ? 'opacity-100' : 'opacity-50'" />
                      </template>
                      <template v-else-if="module.glyph === 'plug'">
                        <span class="flex h-full items-center justify-between"><span class="node" /><span class="mx-1 h-px flex-1 border-t border-dashed border-current" /><span class="node" /><span class="mx-1 h-px flex-1 border-t border-dashed border-current" /><span class="node" /></span>
                      </template>
                      <template v-else-if="module.glyph === 'text'">
                        <span class="ln w-3/4" /><span class="ln w-full" /><span class="ln w-5/6" /><span class="caret ln w-1/3" />
                      </template>
                      <template v-else-if="module.glyph === 'cards'">
                        <span class="grid h-full grid-cols-3 gap-1"><span v-for="c in 3" :key="c" class="border border-current" /></span>
                      </template>
                      <template v-else-if="module.glyph === 'tags'">
                        <span class="flex flex-wrap gap-1"><span v-for="lang in ['EN', 'DE', 'RO', 'ES']" :key="lang" class="border border-current px-1 font-label text-[0.55rem]">{{ lang }}</span></span>
                      </template>
                      <template v-else-if="module.glyph === 'chat'">
                        <span class="ml-auto block h-3 w-2/3 rounded-full border border-current" /><span class="mt-1.5 block h-3 w-3/4 rounded-full bg-primary/80" /><span class="typing mt-1.5 block h-3 w-1/2 rounded-full border border-current" />
                      </template>
                      <template v-else-if="module.glyph === 'search'">
                        <span class="flex items-center gap-1 border border-current px-1"><span class="size-2 rounded-full border border-current" /><span class="ln flex-1" /></span><span class="ln mt-2 w-full opacity-50" /><span class="ln w-4/5 bg-primary" />
                      </template>
                      <template v-else-if="module.glyph === 'extract'">
                        <span class="flex h-full items-center gap-2"><span class="h-full w-8 border border-current" /><span class="arrow-r" /><span class="flex flex-1 flex-col gap-1"><span class="ln" /><span class="ln bg-primary" /><span class="ln" /></span></span>
                      </template>
                      <template v-else>
                        <span class="flex h-full items-center justify-between"><span class="node rounded-full" /><span class="flowline h-px flex-1" /><span class="node rotate-45" /><span class="flowline h-px flex-1" /><span class="node rounded-full bg-primary" /></span>
                      </template>
                    </div>
                    <p class="mt-2 font-label text-[0.6rem] leading-tight tracking-wider uppercase">
                      {{ module.label }}
                    </p>
                  </li>
                </TransitionGroup>
              </div>
            </div>

            <table class="titleblock mt-4 w-full font-label text-[0.6rem] uppercase">
              <tbody>
                <tr>
                  <th>Project</th><td class="max-w-0 truncate">
                    {{ name }}
                  </td>
                  <th>Drawn by</th><td>{{ brand.name }}</td>
                </tr>
                <tr>
                  <th>Scope</th><td>{{ modules.length }} modules</td>
                  <th>Rev</th><td><span :key="rev" class="rev inline-block text-primary">{{ rev }}</span></td>
                </tr>
              </tbody>
            </table>

            <div class="mt-5">
              <div class="mb-2 flex justify-between gap-4 font-label text-[0.6rem] tracking-[0.18em] uppercase">
                <span class="text-secondary">Plan · indicative proportions, not a quote</span>
                <span class="hidden text-right text-base-content/60 md:inline">{{ cadences[when] }}</span>
              </div>
              <div class="flex h-9 w-full overflow-hidden rounded-field border border-secondary/60">
                <div
                  v-for="phase in plan"
                  :key="phase.label"
                  class="phase flex items-center overflow-hidden border-r border-secondary/60 px-2 font-label text-[0.6rem] whitespace-nowrap uppercase last:border-r-0"
                  :class="`tone-${phase.tone}`"
                  :style="{ width: `${phase.share}%` }"
                >
                  {{ phase.label }}
                </div>
              </div>
            </div>
          </figure>

          <div class="mt-6 flex flex-col gap-4 rounded-box border border-primary/60 bg-base-200/80 p-5 md:flex-row md:items-center">
            <p class="flex-1 text-pretty" aria-live="polite">
              <span class="mb-1 block eyebrow text-[0.6rem] text-primary">Your brief</span>
              {{ brief || 'Pick at least one thing to build and your brief writes itself here.' }}
            </p>
            <button class="btn shrink-0 btn-primary" :disabled="!brief" @click="start(brief)">
              Send this brief
              <Icon name="solar:arrow-right-linear" class="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.dot {
  display: block;
  width: 0.45rem;
  height: 0.45rem;
  border-radius: 999px;
  border: 1px solid currentColor;
}

.module {
  background-color: color-mix(in oklab, var(--color-base-100) 80%, transparent);
}
.module.kind-ai {
  border-style: dashed;
  border-color: var(--color-secondary);
}
.glyph {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.375rem;
  color: color-mix(in oklab, var(--color-base-content) 75%, transparent);
}
.glyph .ln {
  display: block;
  height: 2px;
  background-color: currentColor;
}
.glyph .block-fill {
  display: block;
  background-color: var(--color-primary);
}
.glyph .bar {
  display: block;
  border: 1px solid currentColor;
  border-bottom: 0;
  transform-origin: bottom;
  animation: grow 0.8s var(--ease-draft) both;
}
.glyph .bar:nth-child(2n) {
  background-color: color-mix(in oklab, var(--color-primary) 60%, transparent);
}
.glyph .bar:nth-child(1) {
  animation-delay: 0.1s;
}
.glyph .bar:nth-child(2) {
  animation-delay: 0.15s;
}
.glyph .bar:nth-child(3) {
  animation-delay: 0.2s;
}
.glyph .bar:nth-child(4) {
  animation-delay: 0.25s;
}
.glyph .bar:nth-child(5) {
  animation-delay: 0.3s;
}
.glyph .bar:nth-child(6) {
  animation-delay: 0.35s;
}
@keyframes grow {
  from {
    transform: scaleY(0);
  }
}
.glyph .node {
  display: block;
  width: 0.9rem;
  height: 0.9rem;
  border: 1px solid currentColor;
  flex-shrink: 0;
}
.glyph .flowline {
  display: block;
  background-image: linear-gradient(90deg, currentColor 50%, transparent 50%);
  background-size: 6px 1px;
}
.glyph .arrow-r {
  display: block;
  width: 0;
  height: 0;
  border-block: 4px solid transparent;
  border-left: 6px solid var(--color-primary);
}
.glyph .caret {
  background-color: var(--color-primary);
}

.draw-enter-active {
  animation: sketch 0.7s var(--ease-draft) both;
}
.draw-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}
.draw-leave-to {
  opacity: 0;
  transform: scale(0.94);
}
.draw-move {
  transition: transform 0.5s var(--ease-draft);
}
@keyframes sketch {
  0% {
    clip-path: inset(0 100% 100% 0);
    border-style: dashed;
  }
  60% {
    clip-path: inset(0 0 0 0);
    border-style: dashed;
  }
  100% {
    clip-path: inset(-12px);
  }
}

.group-enter-active,
.group-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s var(--ease-draft);
}
.group-enter-from,
.group-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.phase {
  transition: width 0.7s var(--ease-draft);
}
.tone-spec {
  background-color: color-mix(in oklab, var(--color-secondary) 22%, transparent);
}
.tone-design {
  background-image: repeating-linear-gradient(
    -45deg,
    transparent 0 5px,
    color-mix(in oklab, var(--color-base-content) 18%, transparent) 5px 6px
  );
}
.tone-build {
  background-color: color-mix(in oklab, var(--color-primary) 30%, transparent);
}
.tone-launch {
  background-color: var(--color-accent);
  color: var(--color-accent-content);
}

.titleblock :is(th, td) {
  border: 1px solid color-mix(in oklab, var(--color-secondary) 45%, transparent);
  padding: 0.35rem 0.5rem;
  text-align: left;
  font-weight: 400;
}
.titleblock th {
  width: 18%;
  color: var(--color-secondary);
}

@media (prefers-reduced-motion: no-preference) {
  .rev {
    animation: stamp 0.5s var(--ease-settle);
  }
  .glyph .flowline {
    animation: flow 0.6s linear infinite;
  }
  .glyph .caret {
    animation: blink 1s steps(1) infinite;
  }
  .glyph .typing {
    animation: pulse 1.4s ease-in-out infinite;
  }
}
@keyframes stamp {
  from {
    transform: scale(2.2) rotate(-12deg);
    opacity: 0;
  }
}
@keyframes flow {
  to {
    background-position: 6px 0;
  }
}
@keyframes blink {
  50% {
    opacity: 0;
  }
}
@keyframes pulse {
  50% {
    opacity: 0.3;
  }
}
@media (prefers-reduced-motion: reduce) {
  .draw-enter-active,
  .glyph .bar {
    animation: none;
  }
  .draw-move,
  .phase,
  .group-enter-active,
  .group-leave-active {
    transition: none;
  }
}
</style>
