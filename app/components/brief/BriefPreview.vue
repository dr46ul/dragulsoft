<script setup lang="ts">
import {
  AUDIENCES,
  CONSTRAINTS,
  DATA_SOURCES,
  DECIDERS,
  DONES,
  FEATURE_LABELS,
  LAUNCHES,
  READIES,
  STARTS,
  SYSTEMS,
  TODAYS,
} from '~/data/brief'
import { budgetLabel, chosenFeatures, composeBrief } from '~/utils/brief'

const { answers } = useBrief()

function labels<T extends string>(options: readonly { value: T, label: string }[], chosen: readonly T[], other = '') {
  return [
    ...options.filter(option => chosen.includes(option.value)).map(option => option.label),
    other.trim(),
  ].filter(Boolean).join(', ')
}

const summary = computed(() => composeBrief(answers.value))
const rows = computed(() => {
  const a = answers.value
  const features = chosenFeatures(a)
  const withPriority = (priority: 'must' | 'nice') =>
    features.filter(feature => a.priorities[feature] === priority).map(feature => FEATURE_LABELS[feature])
  const timing = [
    STARTS.find(start => start.value === a.start)?.label,
    LAUNCHES.find(launch => launch.value === a.launch)?.label,
    a.deadline && `Deadline ${a.deadline}`,
  ]
  return [
    {
      term: 'Must-haves',
      value: [
        ...withPriority('must'),
        a.scopeOther.trim(),
      ].filter(Boolean).join(', '),
    },
    {
      term: 'Nice-to-haves',
      value: withPriority('nice').join(', '),
    },
    {
      term: 'Connections',
      value: labels(SYSTEMS, a.systems, a.systemsOther),
    },
    {
      term: 'Data to move',
      value: labels(DATA_SOURCES, a.data
        ? [a.data]
        : [], a.dataOther),
    },
    {
      term: 'Timing',
      value: timing.filter(Boolean).join(' · '),
    },
    {
      term: 'Budget',
      value: a.band
        ? budgetLabel(a.currency, a.band)
        : '',
    },
    {
      term: 'The problem',
      value: a.problem.trim(),
    },
    {
      term: 'Who has it',
      value: labels(AUDIENCES, a.audience, a.audienceOther),
    },
    {
      term: 'Today',
      value: labels(TODAYS, a.today
        ? [a.today]
        : [], a.todayOther),
    },
    {
      term: 'Done means',
      value: labels(DONES, a.done, a.doneOther),
    },
    {
      term: 'Ready',
      value: labels(READIES, a.ready),
    },
    {
      term: 'Hosting & compliance',
      value: labels(CONSTRAINTS, a.constraints, a.constraintsOther),
    },
    {
      term: 'Who decides',
      value: labels(DECIDERS, a.decider
        ? [a.decider]
        : []),
    },
  ].filter(row => row.value)
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <p v-if="summary" class="text-pretty">
      {{ summary }}
    </p>
    <p v-else class="text-sm text-base-content/60">
      Pick what you’re building, and the brief starts here.
    </p>
    <dl class="grid gap-3 text-sm">
      <div v-for="row in rows" :key="row.term">
        <dt class="eyebrow text-[0.6rem] text-secondary">
          {{ row.term }}
        </dt>
        <dd class="mt-0.5 text-pretty text-base-content/85">
          {{ row.value }}
        </dd>
      </div>
    </dl>
  </div>
</template>
