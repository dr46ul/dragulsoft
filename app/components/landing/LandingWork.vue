<script setup lang="ts">
const root = useTemplateRef<HTMLElement>('root')
useReveal(root)
</script>

<template>
  <section id="work" ref="root" class="border-t border-secondary/25" aria-labelledby="work-title">
    <div class="mx-auto max-w-[90rem] px-4 py-24 md:px-8">
      <div class="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p class="mb-5 flex items-center gap-3 eyebrow text-secondary">
            <span class="h-px w-8 bg-secondary" aria-hidden="true" />Sheet 05 · Case studies
          </p>
          <h2 id="work-title" data-reveal="words" class="font-display text-[clamp(2rem,3.6vw,3.25rem)] leading-none font-bold tracking-[-0.025em]">
            Drawings on file.
          </h2>
        </div>
        <p data-reveal="rise" class="max-w-sm text-pretty text-base-content/70">
          Case studies are published here as projects launch, each one with the client’s permission.
        </p>
      </div>
      <ul data-reveal="stagger" class="grid gap-6 md:grid-cols-3">
        <li v-for="slot in 3" :key="slot" class="hatch flex aspect-[4/3] flex-col justify-end rounded-box border border-dashed border-secondary/40 p-4">
          <table class="titleblock w-full bg-base-100 font-label text-[0.6rem] uppercase">
            <tbody>
              <tr><th>Project</th><td>In preparation</td></tr>
              <tr><th>Sheet</th><td>05.{{ slot }}</td></tr>
            </tbody>
          </table>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.hatch {
  background-image: repeating-linear-gradient(
    45deg,
    transparent 0 10px,
    color-mix(in oklab, var(--color-base-content) 7%, transparent) 10px 11px
  );
}
.titleblock :is(th, td) {
  border: 1px solid color-mix(in oklab, var(--color-secondary) 45%, transparent);
  padding: 0.35rem 0.5rem;
  text-align: left;
  font-weight: 400;
}
.titleblock th {
  width: 40%;
  color: var(--color-secondary);
}
</style>
