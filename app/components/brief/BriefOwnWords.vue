<script setup lang="ts">
const { maxlength = 200, counted = true, required, autocomplete, hint, issue } = defineProps<{
  label: string
  hint?: string
  maxlength?: number
  counted?: boolean
  multiline?: boolean
  required?: boolean
  type?: 'text' | 'email'
  autocomplete?: string
  issue?: string
}>()

const model = defineModel<string>({ required: true })
const id = useId()
const hintId = useId()
const countId = useId()
const issueId = useId()
const field = computed(() => ({
  maxlength,
  required,
  autocomplete,
  'aria-invalid': issue ? true : undefined,
  'aria-describedby': [hint && hintId, counted && countId, issue && issueId].filter(Boolean).join(' ') || undefined,
}))
</script>

<template>
  <div class="flex flex-col gap-1">
    <label :for="id" class="label text-sm text-base-content">{{ label }}</label>
    <textarea
      v-if="multiline"
      :id
      v-model="model"
      class="textarea h-28 w-full"
      v-bind="field"
    />
    <input
      v-else
      :id
      v-model="model"
      :type="type ?? 'text'"
      class="input w-full"
      v-bind="field"
    >
    <div class="flex items-start justify-between gap-3 text-xs text-base-content/60">
      <p v-if="hint" :id="hintId" class="text-pretty">
        {{ hint }}
      </p>
      <p v-if="counted" :id="countId" aria-live="polite" class="ml-auto shrink-0 font-label tabular-nums">
        {{ model.length }} / {{ maxlength }}<span class="sr-only"> characters</span>
      </p>
    </div>
    <p v-if="issue" :id="issueId" role="alert" class="text-sm text-error">
      {{ issue }}
    </p>
  </div>
</template>
