<script setup lang="ts">
const notes = [
  {
    title: 'One accountable lead.',
    copy: 'You deal with the person doing the work, from the first call to launch day. Nothing gets lost in a hand-off.',
  },
  {
    title: 'Scope in writing before code.',
    copy: 'Every engagement starts with a written scope and estimate. Changes are priced before they are built, never after.',
  },
  {
    title: 'A demo every week.',
    copy: 'Working software on a staging link, so you judge progress by using it rather than by reading status reports.',
  },
  {
    title: 'You own everything.',
    copy: 'Code, accounts, domains and data sit in your name from day one. Nothing is held back as leverage.',
  },
  {
    title: 'Handover included.',
    copy: 'Documentation and a walkthrough at the end, so your team or the next developer can pick it up cold.',
  },
]

const root = useTemplateRef<HTMLElement>('root')
useReveal(root)
</script>

<template>
  <section id="notes" ref="root" class="border-t border-secondary/25" aria-labelledby="notes-title">
    <div class="mx-auto max-w-[90rem] px-4 py-24 md:px-8 md:py-32">
      <p class="mb-5 flex items-center gap-3 eyebrow text-secondary">
        <span class="h-px w-8 bg-secondary" aria-hidden="true" />Sheet 04 · Working together
      </p>
      <h2 id="notes-title" data-reveal="words" class="max-w-4xl font-display text-[clamp(2.25rem,5vw,4.5rem)] leading-[0.95] font-bold tracking-[-0.03em] text-balance">
        The terms are on the drawing, not in the small print.
      </h2>

      <div data-reveal="rise" class="mt-14 card card-drawn">
        <div class="flex items-center justify-between border-b border-secondary/40 px-5 py-3 md:px-8">
          <p class="eyebrow text-primary">
            General notes
          </p>
          <p class="eyebrow text-[0.6rem] text-base-content/50">
            Apply to every engagement
          </p>
        </div>
        <ol class="grid gap-px overflow-hidden rounded-b-box bg-secondary/30 md:grid-cols-2 xl:grid-cols-5">
          <li
            v-for="(item, index) in notes"
            :key="item.title"
            class="flex flex-col gap-3 bg-base-200 p-5 md:p-8 md:max-xl:last:col-span-2"
          >
            <span class="font-display text-5xl leading-none font-bold text-secondary/60 tabular-nums">{{ index + 1 }}.</span>
            <h3 class="font-display text-xl font-bold tracking-tight text-balance">
              {{ item.title }}
            </h3>
            <p class="text-pretty text-base-content/75">
              {{ item.copy }}
            </p>
          </li>
        </ol>
      </div>
    </div>
  </section>
</template>
