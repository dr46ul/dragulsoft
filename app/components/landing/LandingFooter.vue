<script setup lang="ts">
const { brand } = useAppConfig()
const { start } = useContact()
const year = new Date().getFullYear()

const root = useTemplateRef<HTMLElement>('root')
useReveal(root)
</script>

<template>
  <footer ref="root" class="border-t border-secondary/25">
    <div class="mx-auto max-w-[90rem] px-4 pt-20 pb-10 md:px-8">
      <div class="relative" aria-hidden="true">
        <span class="absolute inset-x-0 top-[0.06em] border-t border-dashed border-secondary/40" />
        <p data-reveal="rise" class="wordmark font-display text-[length:min(calc((100vw-4rem)/6.8),12.75rem)] leading-[0.78] font-extrabold tracking-[-0.045em] uppercase">
          {{ brand.name }}
        </p>
        <span class="absolute inset-x-0 bottom-0 border-t border-dashed border-secondary/40" />
        <span class="absolute right-0 -bottom-6 font-label text-[0.55rem] tracking-[0.2em] text-secondary uppercase">Wordmark · cap height to baseline</span>
      </div>

      <div class="footer mt-16 gap-px overflow-hidden rounded-box border border-secondary/45 bg-secondary/45 sm:grid-cols-2 lg:grid-cols-[2fr_1.3fr_1.5fr_1fr]">
        <div class="cell">
          <p class="eyebrow text-[0.6rem] text-secondary">
            Drawn by
          </p>
          <p class="flex items-center gap-3 font-display text-lg font-bold">
            <BrandMark class="size-7" />{{ brand.name }}
          </p>
          <p class="text-sm text-base-content/70">
            {{ brand.descriptor }}. Run by {{ brand.owner }}.
          </p>
        </div>
        <div class="cell">
          <p class="eyebrow text-[0.6rem] text-secondary">
            Contact
          </p>
          <a :href="`mailto:${brand.email}`" class="link link-hover">{{ brand.email }}</a>
          <button type="button" class="link link-primary link-hover text-left" @click="start()">
            Start a project
          </button>
        </div>
        <div class="cell">
          <p class="eyebrow text-[0.6rem] text-secondary">
            Disciplines
          </p>
          <ul class="space-y-1 text-sm">
            <li><a href="#services" class="link link-hover">Web apps &amp; SaaS</a></li>
            <li><a href="#services" class="link link-hover">Websites &amp; landing pages</a></li>
            <li><a href="#services" class="link link-hover">AI integrations</a></li>
          </ul>
        </div>
        <div class="cell">
          <p class="eyebrow text-[0.6rem] text-secondary">
            Sheet
          </p>
          <p class="font-label text-sm">
            06 of 06
          </p>
          <p class="text-sm text-base-content/60">
            © {{ year }} {{ brand.name }}
          </p>
          <a href="#top" class="link link-hover text-sm">Back to top ↑</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.cell {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  height: 100%;
  width: 100%;
  padding: 1.25rem 1.5rem;
  background-color: var(--color-base-100);
}
.wordmark {
  color: transparent;
  -webkit-text-stroke: 1.5px color-mix(in oklab, var(--color-base-content) 85%, transparent);
  background-image: linear-gradient(var(--color-base-content), var(--color-base-content));
  background-clip: text;
  background-repeat: no-repeat;
  background-size: 100% 0%;
  background-position: bottom;
  transition: background-size 1.2s var(--ease-draft);
}
.wordmark:hover {
  background-size: 100% 100%;
}
</style>
