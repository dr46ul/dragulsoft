<script setup lang="ts">
import { CONSTRAINTS, DECIDERS, DONES, READIES } from '~/data/brief'

const { answers } = useBrief()
</script>

<template>
  <div class="flex flex-col gap-6">
    <BriefPickMany
      v-model="answers.done"
      :options="DONES"
      legend="What does done look like?"
      hint="How you’ll know it worked."
    >
      <BriefOwnWords
        v-model="answers.doneOther"
        label="In your own words"
        hint="For example: today’s total is on screen by five o’clock."
      />
    </BriefPickMany>
    <BriefPickMany
      v-model="answers.ready"
      :options="READIES"
      legend="What’s ready?"
      hint="Anything that already exists, so it isn’t made twice."
    />
    <BriefPickMany
      v-model="answers.constraints"
      :options="CONSTRAINTS"
      legend="Any hosting or compliance needs?"
      hint="Rules the work has to follow from the start."
    >
      <BriefOwnWords
        v-model="answers.constraintsOther"
        label="Another need"
        hint="For example: data has to stay in the EU."
      />
    </BriefPickMany>
    <BriefPickOne
      v-model="answers.decider"
      :options="DECIDERS"
      legend="Who decides?"
      hint="So the reply goes to the conversation that can say yes."
    />
  </div>
</template>
