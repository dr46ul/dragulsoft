<script setup lang="ts">
import type { BriefIssue } from '~/utils/brief'
import { featuresByKind } from '@dragulsoft/adam-protocol'
import { FEATURE_LABELS, KINDS } from '~/data/brief'

defineProps<{ issue: BriefIssue | null }>()

const { answers } = useBrief()
const chosenKinds = computed(() => KINDS.filter(kind => answers.value.kinds.includes(kind.value)))
</script>

<template>
  <div class="flex flex-col gap-6">
    <BriefPickMany
      v-model="answers.kinds"
      :options="KINDS"
      :issue="issue?.field === 'kinds' ? issue.message : undefined"
      legend="What are you building?"
      hint="Pick everything that applies. A shop with a chat assistant is a website plus an AI integration."
    />

    <fieldset class="fieldset gap-3">
      <legend class="fieldset-legend text-base">
        What should it do?
      </legend>
      <p v-if="!chosenKinds.length" class="text-sm text-base-content/60">
        Choose what you’re building first, and its features appear here.
      </p>
      <div v-for="kind in chosenKinds" :key="kind.value" class="card card-border border-secondary/35 p-3">
        <p class="mb-2 eyebrow text-[0.6rem] text-base-content/55">
          {{ kind.label }}
        </p>
        <ul class="flex flex-col gap-2">
          <li v-for="feature in featuresByKind[kind.value]" :key="feature" class="flex flex-wrap items-center gap-2">
            <input
              v-model="answers.features"
              :value="feature"
              :aria-label="FEATURE_LABELS[feature]"
              type="checkbox"
              class="btn btn-outline btn-sm"
            >
            <div
              v-if="answers.features.includes(feature)"
              :aria-label="`${FEATURE_LABELS[feature]} priority`"
              role="radiogroup"
              class="join"
            >
              <input
                v-model="answers.priorities[feature]"
                :name="`priority-${feature}`"
                type="radio"
                class="btn join-item btn-ghost btn-xs"
                value="must"
                aria-label="Must-have"
              >
              <input
                v-model="answers.priorities[feature]"
                :name="`priority-${feature}`"
                type="radio"
                class="btn join-item btn-ghost btn-xs"
                value="nice"
                aria-label="Nice-to-have"
              >
            </div>
          </li>
        </ul>
      </div>
      <p class="label text-wrap">
        Must-haves are what the first release can’t ship without. Nice-to-haves can follow later.
      </p>
      <BriefOwnWords
        v-model="answers.scopeOther"
        label="Something else"
        hint="For example: a kiosk mode for the shop floor."
      />
    </fieldset>
  </div>
</template>
