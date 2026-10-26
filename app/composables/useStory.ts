const DESKTOP = '(min-width: 1024px)'

/*
 * The story's shared state: the four 0 → 1 levels the chapters scrub, one per stage they complete,
 * and everything the sheet, the chapters and the hero derive from them.
 */
export function useStory() {
  const levels = useState<number[]>('story-levels', () => [0, 0, 0, 0])
  const progress = useState('story-progress', () => 0)
  // False until the scroll wiring is live, so the server render and a no-script page show every chapter at full strength.
  const ready = useState('story-ready', () => false)

  const stage = computed(() => stageFromLevels(levels.value))
  const build = computed(() => levels.value[2] ?? 0)
  const launched = computed(() => (levels.value[3] ?? 0) > 0.95)

  function setLevel(index: number, value: number) {
    if (levels.value[index] !== value) {
      levels.value = levels.value.map((level, i) => i === index
        ? value
        : level)
    }
  }

  function reset() {
    levels.value = [0, 0, 0, 0]
    progress.value = 0
    ready.value = false
  }

  return {
    levels,
    progress,
    ready,
    stage,
    build,
    launched,
    setLevel,
    reset,
  }
}

/*
 * Where a chapter sits once it is being read: centred beside the sheet on desktop; on phones, its top just under the
 * pinned sheet band, whose height varies with the screen, so the line is measured rather than fixed.
 */
export function readingLine() {
  if (window.matchMedia(DESKTOP).matches)
    return { edge: 'center', offset: window.innerHeight * 0.55 }
  const band = document.querySelector<HTMLElement>('[data-story-band]')
  if (!band)
    return { edge: 'top', offset: window.innerHeight * 0.6 }
  return { edge: 'top', offset: Number.parseFloat(getComputedStyle(band).top) + band.offsetHeight + 16 }
}

export function goToStage(index: number) {
  if (index === 0)
    return scrollToY(0)
  const chapter = document.querySelector<HTMLElement>(`[data-stage="${index}"]`)
  if (!chapter)
    return
  const rect = chapter.getBoundingClientRect()
  const { edge, offset } = readingLine()
  scrollToY(window.scrollY + rect.top + (edge === 'center'
    ? rect.height / 2
    : 0) - offset)
}
