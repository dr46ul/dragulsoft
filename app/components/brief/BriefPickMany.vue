<script setup lang="ts" generic="T extends string">
defineProps<{
  legend: string
  hint?: string
  options: readonly { value: T, label: string }[]
  issue?: string
}>()

const model = defineModel<T[]>({ required: true })
const hintId = useId()
const issueId = useId()
</script>

<template>
  <fieldset
    :aria-describedby="[hint && hintId, issue && issueId].filter(Boolean).join(' ') || undefined"
    class="fieldset gap-2"
  >
    <legend class="fieldset-legend text-base">
      {{ legend }}
    </legend>
    <div class="flex flex-wrap gap-2">
      <input
        v-for="option in options"
        :key="option.value"
        v-model="model"
        :value="option.value"
        :aria-label="option.label"
        type="checkbox"
        class="btn btn-outline btn-sm"
      >
    </div>
    <p v-if="hint" :id="hintId" class="label text-wrap">
      {{ hint }}
    </p>
    <p v-if="issue" :id="issueId" role="alert" class="text-sm text-error">
      {{ issue }}
    </p>
    <slot />
  </fieldset>
</template>
