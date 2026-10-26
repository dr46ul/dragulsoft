<template>
  <svg
    viewBox="0 0 40 40"
    fill="none"
    stroke="currentColor"
    stroke-width="1.75"
    stroke-linecap="round"
    class="brand-mark"
    aria-hidden="true"
  >
    <line x1="2" y1="34" x2="38" y2="34" stroke-width="1" stroke-dasharray="1.5 2.5" class="opacity-45" />
    <line x1="27" y1="2" x2="27" y2="38" stroke-width="1" stroke-dasharray="1.5 2.5" class="opacity-45" />
    <circle cx="17" cy="24" r="10" pathLength="1" class="stroke" style="--d: 0.15s" />
    <line x1="27" y1="6" x2="27" y2="34" pathLength="1" class="stroke" style="--d: 0.55s" />
    <circle cx="27" cy="6" r="2.4" class="node fill-primary stroke-none" />
  </svg>
</template>

<style scoped>
@media (prefers-reduced-motion: no-preference) {
  .stroke {
    stroke-dasharray: 1;
    animation: draw 1.1s var(--ease-draft) var(--d) both;
  }
  .node {
    transform-origin: 27px 6px;
    animation: pop 0.5s var(--ease-settle) 1.2s both;
  }
}
@keyframes draw {
  from {
    stroke-dashoffset: 1;
  }
}
@keyframes pop {
  from {
    transform: scale(0);
  }
}
</style>
