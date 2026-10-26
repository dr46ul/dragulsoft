<script setup lang="ts">
const clients = [
  {
    ref: 'C-01',
    who: 'Founders',
    copy: 'A first version real users can pay for, built so it doesn’t need a rewrite six months later.',
    tags: ['Web app', 'MVP'],
  },
  {
    ref: 'C-02',
    who: 'Growing businesses',
    copy: 'Software shaped around how you actually work, replacing the spreadsheets, copy-paste and inbox juggling.',
    tags: ['Internal tools', 'Automation'],
  },
  {
    ref: 'C-03',
    who: 'Agencies & studios',
    copy: 'Senior build capacity for client projects, delivered to your standards and your deadlines.',
    tags: ['Websites', 'Web apps'],
  },
  {
    ref: 'C-04',
    who: 'Product teams',
    copy: 'An extra pair of hands for a feature, an AI integration or a migration, working inside your codebase and process.',
    tags: ['AI integration', 'Features'],
  },
] as const

const root = useTemplateRef<HTMLElement>('root')
useReveal(root)
</script>

<template>
  <section id="clients" ref="root" class="border-t border-secondary/25" aria-labelledby="clients-title">
    <div class="mx-auto grid max-w-[90rem] gap-12 px-4 py-24 md:px-8 md:py-32 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
      <div class="lg:sticky lg:top-28 lg:self-start">
        <p class="mb-5 flex items-center gap-3 eyebrow text-secondary">
          <span class="h-px w-8 bg-secondary" aria-hidden="true" />Sheet 03 · Who it’s for
        </p>
        <h2 id="clients-title" data-reveal="words" class="font-display text-[clamp(2.25rem,4.4vw,4rem)] leading-[0.95] font-bold tracking-[-0.03em] text-balance">
          Different markets. Same drawing board.
        </h2>
        <p data-reveal="rise" class="mt-6 max-w-md text-lg text-pretty text-base-content/75">
          Whatever the industry, the method doesn’t change. Only the brief does.
        </p>
      </div>

      <div>
        <p class="mb-3 flex justify-between eyebrow text-[0.6rem] text-base-content/50" aria-hidden="true">
          <span>Schedule of clients</span><span>Ref.</span>
        </p>
        <ul data-reveal="stagger" class="border-t border-secondary/40">
          <li v-for="client in clients" :key="client.ref" class="group relative grid gap-3 border-b border-secondary/40 py-7 transition-colors duration-300 hover:bg-base-200/60 md:grid-cols-[minmax(0,1fr)_auto] md:gap-8 md:px-4">
            <span class="absolute top-0 left-0 h-0.5 w-0 bg-primary transition-[width] duration-500 ease-settle group-hover:w-full" aria-hidden="true" />
            <div>
              <h3 class="font-display text-2xl font-bold tracking-tight md:text-3xl">
                {{ client.who }}
              </h3>
              <p class="mt-2 max-w-xl text-pretty text-base-content/75">
                {{ client.copy }}
              </p>
              <ul class="mt-4 flex flex-wrap gap-2" aria-label="Typical work">
                <li v-for="tag in client.tags" :key="tag" class="badge badge-outline badge-sm border-secondary/50 font-label text-[0.6rem] text-secondary">
                  {{ tag }}
                </li>
              </ul>
            </div>
            <span class="order-first font-label text-sm text-base-content/50 transition-colors group-hover:text-primary md:order-none">{{ client.ref }}</span>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>
