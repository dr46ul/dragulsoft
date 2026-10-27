<script setup lang="ts">
const { brand } = useAppConfig()
const { available, start } = useEnquiry()
const year = new Date().getFullYear()

const root = useTemplateRef<HTMLElement>('root')
useReveal(root)
</script>

<template>
  <footer ref="root" class="border-t border-secondary/25">
    <div class="mx-auto max-w-[90rem] px-4 pt-20 pb-10 md:px-8">
      <div data-reveal="rise" class="relative" aria-hidden="true">
        <span class="absolute inset-x-0 top-[0.06em] border-t border-dashed border-secondary/40" />
        <!-- 6.8 is the wordmark's width in em at this weight and tracking, so 100vw minus the page padding fits it from 360px to 1920px. -->
        <p class="wordmark outlined-text font-display text-[length:min(calc((100vw-4rem)/6.8),12.75rem)] leading-[0.78] font-extrabold tracking-[-0.045em] uppercase">
          {{ brand.name }}
        </p>
        <span class="absolute inset-x-0 bottom-0 border-t border-dashed border-secondary/40" />
        <span class="absolute right-0 -bottom-6 font-label text-[0.55rem] tracking-[0.2em] text-secondary uppercase">
          Wordmark · cap height to baseline
        </span>
      </div>

      <div
        :class="available ? 'lg:grid-cols-[2fr_1.3fr_1.5fr_1fr]' : 'lg:grid-cols-[2fr_1.5fr_1fr]'"
        class="footer mt-16 grid-flow-row gap-px overflow-hidden rounded-box border border-secondary/45 bg-secondary/45 sm:grid-cols-2"
      >
        <div class="flex size-full flex-col gap-2 bg-base-100 px-6 py-5">
          <p class="eyebrow text-secondary">
            Drawn by
          </p>
          <p class="flex items-center gap-3 font-display text-lg font-bold">
            <BrandMark class="size-7" />{{ brand.name }}
          </p>
          <p class="text-base-content/70">
            {{ brand.descriptor }}. Run by {{ brand.owner }}.
          </p>
        </div>
        <div v-if="available" class="flex size-full flex-col items-start gap-2 bg-base-100 px-6 py-5">
          <p class="eyebrow text-secondary">
            Contact
          </p>
          <button type="button" class="link link-primary text-left link-hover" @click="start('footer')">
            Start a project
          </button>
        </div>
        <div class="flex size-full flex-col gap-2 bg-base-100 px-6 py-5">
          <p class="eyebrow text-secondary">
            Disciplines
          </p>
          <ul class="space-y-1">
            <li><a href="#services" class="link link-hover">Web apps &amp; SaaS</a></li>
            <li><a href="#services" class="link link-hover">Websites &amp; landing pages</a></li>
            <li><a href="#services" class="link link-hover">AI integrations</a></li>
          </ul>
        </div>
        <div
          :class="!available && 'sm:col-span-2 lg:col-span-1'"
          class="flex size-full flex-col gap-2 bg-base-100 px-6 py-5"
        >
          <p class="eyebrow text-secondary">
            Sheet
          </p>
          <p class="font-label">
            06 of 06
          </p>
          <p class="text-base-content/60">
            © {{ year }} {{ brand.name }}
          </p>
          <a href="#top" class="link link-hover">Back to top ↑</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.wordmark {
  background-image: linear-gradient(var(--color-base-content), var(--color-base-content));
  background-size: 100% 0%;
}
.wordmark:hover {
  background-size: 100% 100%;
}
@media (prefers-reduced-motion: no-preference) {
  .wordmark {
    transition: background-size 1.2s var(--ease-draft);
  }
}
</style>
