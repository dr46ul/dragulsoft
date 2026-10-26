<script setup lang="ts">
import { caseStudies } from '~/data/case-studies'

const root = useTemplateRef<HTMLElement>('root')
useReveal(root)
</script>

<template>
  <section
    v-if="caseStudies.length"
    id="work"
    ref="root"
    class="border-t border-secondary/25"
    aria-labelledby="work-title"
  >
    <div class="mx-auto max-w-[90rem] px-4 py-24 md:px-8">
      <div class="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p class="mb-5 flex items-center gap-3 eyebrow text-secondary">
            <span class="h-px w-8 bg-secondary" aria-hidden="true" />Sheet 05 · Case studies
          </p>
          <h2
            id="work-title"
            data-reveal="words"
            class="font-display text-[clamp(2rem,3.6vw,3.25rem)] leading-none font-bold tracking-[-0.025em]"
          >
            Drawings on file.
          </h2>
        </div>
        <p data-reveal="rise" class="max-w-sm text-pretty text-base-content/70">
          Case studies are published here as projects launch, each one with the client’s permission.
        </p>
      </div>
      <ul data-reveal="stagger" class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <li v-for="study in caseStudies" :key="study.title" class="card card-drawn">
          <div class="card-body">
            <h3 class="card-title font-display text-xl font-bold">
              {{ study.title }}
            </h3>
            <p class="text-base-content/75">
              {{ study.summary }}
            </p>
            <table class="titleblock mt-auto w-full font-label text-[0.6875rem] uppercase">
              <tbody>
                <tr>
                  <th scope="row">
                    Client
                  </th>
                  <td>{{ clientLabel(study.client) }}</td>
                </tr>
                <tr>
                  <th scope="row">
                    Market
                  </th>
                  <td>{{ study.market }}</td>
                </tr>
                <tr>
                  <th scope="row">
                    Disciplines
                  </th>
                  <td>
                    <span class="flex flex-wrap gap-1">
                      <span
                        v-for="discipline in study.disciplines"
                        :key="discipline"
                        class="badge badge-outline badge-sm badge-secondary"
                      >
                        {{ disciplineLabel(discipline) }}
                      </span>
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
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
