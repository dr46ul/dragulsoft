<script setup lang="ts">
const { brand } = useAppConfig()
const description = `${brand.name} is an independent software practice building web apps, websites and AI integrations, with one accountable lead from first sketch to launch.`

useSeoMeta({
  title: `${brand.name} · Web apps, websites and AI integrations`,
  description,
  ogTitle: `${brand.name} · Software, drawn up properly and built to ship`,
  ogDescription: description,
  ogType: 'website',
})
</script>

<template>
  <div class="min-h-screen bg-drafting text-base-content">
    <a href="#main" class="btn absolute top-2 left-4 z-60 -translate-y-24 btn-sm btn-primary focus:translate-y-0">Skip to content</a>
    <main id="main" />
  </div>
</template>
