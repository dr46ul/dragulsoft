<script setup lang="ts">
import type { BriefIssue } from '~/utils/brief'

defineProps<{ issue: BriefIssue | null }>()

const { answers } = useBrief()
</script>

<template>
  <div class="flex flex-col gap-4">
    <BriefOwnWords
      v-model="answers.name"
      :maxlength="80"
      :counted="false"
      :issue="issue?.field === 'name' ? issue.message : undefined"
      label="Your name"
      required
      autocomplete="name"
    />
    <BriefOwnWords
      v-model="answers.email"
      :maxlength="254"
      :counted="false"
      :issue="issue?.field === 'email' ? issue.message : undefined"
      label="Email"
      hint="The reply comes here. It isn’t shared or added to a list."
      type="email"
      required
      autocomplete="email"
    />
    <BriefOwnWords
      v-model="answers.company"
      :maxlength="80"
      :counted="false"
      label="Company (optional)"
      autocomplete="organization"
    />
    <BriefOwnWords
      v-model="answers.projectName"
      :maxlength="32"
      label="Project name (optional)"
      hint="It heads the brief. Leave it empty and the brief says “Your product”."
    />
  </div>
</template>
