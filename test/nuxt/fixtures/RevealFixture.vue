<script setup lang="ts">
import { ref } from 'vue'
import { useReveal } from '~/composables/useReveal'

const root = ref<HTMLElement | null>(null)
useReveal(root)
</script>

<template>
  <section ref="root">
    <h2 data-reveal="words">
      Software drawn up properly
    </h2>
    <p data-reveal="rise">
      One accountable lead from first sketch to launch.
    </p>
    <ul data-reveal="stagger">
      <li>Specify</li>
      <li>Design</li>
      <li>Build</li>
    </ul>
  </section>
</template>
