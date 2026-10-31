<script setup lang="ts">
import type { BriefIssue } from '~/utils/brief'
import { currencies } from '@dragulsoft/adam-protocol'
import { BANDS, LAUNCHES, STARTS } from '~/data/brief'
import { budgetLabel } from '~/utils/brief'

defineProps<{ issue: BriefIssue | null, today: string }>()

const { answers } = useBrief()
const bands = computed(() => BANDS.map(band => ({
  value: band,
  label: budgetLabel(answers.value.currency, band),
})))
const deadlineId = useId()
const deadlineHintId = useId()
const deadlineIssueId = useId()
</script>

<template>
  <div class="flex flex-col gap-6">
    <BriefPickOne
      v-model="answers.start"
      :options="STARTS"
      legend="Where are you starting?"
      hint="Rough sketches count as designs."
    />
    <BriefPickOne
      v-model="answers.launch"
      :options="LAUNCHES"
      legend="When should it launch?"
      hint="Pick the closest. A date that can’t move goes in the next question."
    />

    <div class="flex flex-col gap-1">
      <label :for="deadlineId" class="fieldset-legend text-base">Is there a hard deadline?</label>
      <input
        :id="deadlineId"
        v-model="answers.deadline"
        :min="today"
        :aria-invalid="issue?.field === 'deadline' ? true : undefined"
        :aria-describedby="[deadlineHintId, issue?.field === 'deadline' && deadlineIssueId].filter(Boolean).join(' ')"
        type="date"
        class="input w-full max-w-xs"
      >
      <p :id="deadlineHintId" class="label text-xs text-wrap">
        Only if something real depends on it, like a trade fair or a contract.
      </p>
      <p v-if="issue?.field === 'deadline'" :id="deadlineIssueId" role="alert" class="text-sm text-error">
        {{ issue.message }}
      </p>
    </div>

    <fieldset class="fieldset gap-2">
      <legend class="fieldset-legend text-base">
        What’s the budget?
      </legend>
      <div class="join" role="radiogroup" aria-label="Currency">
        <input
          v-for="currency in currencies"
          :key="currency"
          v-model="answers.currency"
          :value="currency"
          :aria-label="currency"
          type="radio"
          name="brief-currency"
          class="btn join-item btn-outline btn-xs"
        >
      </div>
      <div class="flex flex-wrap gap-2">
        <input
          v-for="band in bands"
          :key="band.value"
          v-model="answers.band"
          :value="band.value"
          :aria-label="band.label"
          type="radio"
          name="brief-band"
          class="btn btn-outline btn-sm"
        >
      </div>
      <p class="label text-wrap">
        A range is enough to shape the proposal.
      </p>
    </fieldset>
  </div>
</template>
