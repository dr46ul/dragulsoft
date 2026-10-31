<script setup lang="ts">
import type { BriefIssue } from '~/utils/brief'
import { AUDIENCES, TODAYS } from '~/data/brief'

defineProps<{ issue: BriefIssue | null }>()

const { answers } = useBrief()
</script>

<template>
  <div class="flex flex-col gap-6">
    <BriefOwnWords
      v-model="answers.problem"
      :maxlength="280"
      :issue="issue?.field === 'problem' ? issue.message : undefined"
      label="What problem should this solve?"
      hint="For example: Orders arrive by email and phone, and we re-type them into three spreadsheets. Nobody sees today’s total until Friday."
      multiline
      required
    />
    <BriefPickMany
      v-model="answers.audience"
      :options="AUDIENCES"
      legend="Who has this problem?"
      hint="The people who feel it every day."
    >
      <BriefOwnWords
        v-model="answers.audienceOther"
        label="Someone else"
        hint="For example: the drivers who collect the orders."
      />
    </BriefPickMany>
    <BriefPickOne
      v-model="answers.today"
      :options="TODAYS"
      legend="What exists today?"
      hint="Whatever handles it now, however rough."
    >
      <BriefOwnWords
        v-model="answers.todayOther"
        label="Something else"
        hint="For example: a shared inbox and a spreadsheet per shop."
      />
    </BriefPickOne>
  </div>
</template>
