<script setup lang="ts" generic="T extends string | null">
defineProps<{
  legend: string
  hint?: string
  options: readonly { value: NonNullable<T>, label: string }[]
}>()

const model = defineModel<T>({ required: true })
const name = useId()
const hintId = useId()
</script>

<template>
  <fieldset :aria-describedby="hint && hintId" class="fieldset gap-2">
    <legend class="fieldset-legend text-base">
      {{ legend }}
    </legend>
    <div class="flex flex-wrap gap-2">
      <input
        v-for="option in options"
        :key="option.value"
        v-model="model"
        :name
        :value="option.value"
        :aria-label="option.label"
        type="radio"
        class="btn btn-outline btn-sm"
      >
    </div>
    <p v-if="hint" :id="hintId" class="label text-wrap">
      {{ hint }}
    </p>
    <slot />
  </fieldset>
</template>
