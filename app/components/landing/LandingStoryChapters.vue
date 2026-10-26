<script setup lang="ts">
import { CHAPTERS } from '~/data/story'

const enquiry = useEnquiry()
const { ready, stage } = useStory()

const pad = (value: number) => String(value).padStart(2, '0')
</script>

<template>
  <div class="lg:col-start-1 lg:row-start-2">
    <article
      v-for="(chapter, index) in CHAPTERS"
      :key="chapter.stage"
      data-chapter
      :data-stage="index + 1"
      class="flex min-h-[72svh] flex-col justify-start pt-2 pb-16 transition-opacity duration-500 lg:min-h-[calc(100svh-4rem)] lg:justify-center lg:py-12"
      :class="{ 'lg:opacity-30': ready && stage !== index + 1 }"
    >
      <p class="mb-5 flex items-center gap-3 eyebrow text-primary">
        <span class="h-px w-8 bg-primary" aria-hidden="true" />{{ pad(index + 2) }} — {{ chapter.stage }}
      </p>
      <h2 data-reveal="words" class="font-display text-[clamp(2rem,3.6vw,3.5rem)] leading-none font-bold tracking-[-0.025em] text-balance">
        {{ chapter.title }}
      </h2>
      <p class="mt-6 max-w-lg text-lg text-pretty text-base-content/75">
        {{ chapter.copy }}
      </p>
      <div class="mt-7">
        <p class="mb-2.5 eyebrow text-[0.6rem] text-base-content/50">
          You receive
        </p>
        <ul class="flex flex-wrap gap-2">
          <li v-for="item in chapter.receive" :key="item" class="badge gap-1.5 badge-outline border-secondary/50 py-3 font-label text-[0.65rem]">
            <Icon name="solar:check-read-linear" class="size-3.5 text-primary" />{{ item }}
          </li>
        </ul>
      </div>
      <div v-if="index === CHAPTERS.length - 1 && enquiry.available.value" class="mt-10">
        <button class="btn btn-primary" @click="enquiry.start('story')">
          Start yours
          <Icon name="solar:arrow-right-linear" class="size-4" />
        </button>
      </div>
    </article>
  </div>
</template>
