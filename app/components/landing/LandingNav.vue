<script setup lang="ts">
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const { brand } = useAppConfig()
const { start } = useContact()

const links = [
  { href: '#process', label: 'Process' },
  { href: '#services', label: 'Services' },
  { href: '#clients', label: 'Who it’s for' },
  { href: '#notes', label: 'Working together' },
]

const menu = useTemplateRef<HTMLDetailsElement>('menu')
const ruler = useTemplateRef<HTMLElement>('ruler')
let trigger: ScrollTrigger | undefined

onMounted(() => {
  trigger = ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => {
      ruler.value?.style.setProperty('scale', `${self.progress} 1`)
    },
  })
})
onBeforeUnmount(() => trigger?.kill())

function closeMenu() {
  menu.value?.removeAttribute('open')
}
</script>

<template>
  <header class="navbar sticky top-0 z-50 min-h-16 border-b border-secondary/25 bg-base-100/85 px-4 backdrop-blur-md md:px-8">
    <div class="navbar-start">
      <a href="#top" class="group flex items-center gap-3 rounded-field" :aria-label="`${brand.name}, back to top`">
        <BrandMark class="size-9 text-base-content" />
        <span class="leading-none">
          <span class="block font-display text-[1.05rem] font-extrabold tracking-[0.08em] uppercase">{{ brand.name }}</span>
          <span class="mt-1 hidden eyebrow text-[0.6rem] text-secondary sm:block">{{ brand.descriptor }}</span>
        </span>
      </a>
    </div>

    <nav class="navbar-center hidden lg:flex" aria-label="Main">
      <ul class="menu menu-horizontal gap-1 px-0 font-label text-xs">
        <li v-for="link in links" :key="link.href">
          <a :href="link.href" class="tracking-wide">{{ link.label }}</a>
        </li>
      </ul>
    </nav>

    <div class="navbar-end gap-2">
      <button class="btn btn-sm btn-primary" @click="start()">
        Start a project
      </button>
      <details ref="menu" class="dropdown dropdown-end lg:hidden">
        <summary class="btn btn-square btn-ghost btn-sm" aria-label="Open menu">
          <Icon name="solar:hamburger-menu-linear" class="size-5" />
        </summary>
        <ul class="menu dropdown-content z-10 mt-3 w-56 rounded-box border border-secondary/40 bg-base-200 p-2 font-label text-xs shadow-2xl">
          <li v-for="link in links" :key="link.href">
            <a :href="link.href" @click="closeMenu">{{ link.label }}</a>
          </li>
        </ul>
      </details>
    </div>

    <span ref="ruler" class="ruler pointer-events-none absolute inset-x-0 -bottom-px h-px origin-left bg-primary" aria-hidden="true" />
  </header>
</template>

<style scoped>
.ruler {
  scale: 0 1;
}
</style>
