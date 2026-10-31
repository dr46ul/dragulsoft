<script setup lang="ts">
import { DATA_SOURCES, SYSTEMS } from '~/data/brief'

const { answers } = useBrief()
</script>

<template>
  <div class="flex flex-col gap-6">
    <BriefPickMany
      v-model="answers.systems"
      :options="SYSTEMS"
      legend="What must it connect to?"
      hint="The systems it has to talk to, such as Stripe for payments or HubSpot as the CRM."
    >
      <BriefOwnWords
        v-model="answers.systemsOther"
        label="Another system"
        hint="For example: the till system in each shop."
      />
    </BriefPickMany>
    <BriefPickOne
      v-model="answers.data"
      :options="DATA_SOURCES"
      legend="Is there data to move over?"
      hint="Records that have to arrive in the new system on day one."
    >
      <BriefOwnWords
        v-model="answers.dataOther"
        label="Where the data lives"
        hint="For example: three years of orders in Excel."
      />
    </BriefPickOne>
  </div>
</template>
