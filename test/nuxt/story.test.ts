import { renderSuspended } from '@nuxt/test-utils/runtime'
import userEvent from '@testing-library/user-event'
import { screen, within } from '@testing-library/vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { clearNuxtState } from '#imports'
import LandingHero from '~/components/landing/LandingHero.vue'
import { useEnquiry } from '~/composables/useEnquiry'
import { useStory } from '~/composables/useStory'

const chapters = [
  {
    eyebrow: '02 — Spec',
    heading: 'Scoped on paper before a line of code.',
    copy: 'Screens, flows, data and integrations get mapped first, while a change costs an eraser instead of a sprint. You sign off a written scope with a fixed estimate and the trade-offs spelled out.',
    receive: ['Written scope', 'Fixed estimate', 'Clickable wireframe'],
  },
  {
    eyebrow: '03 — Design',
    heading: 'Every state designed before it’s built.',
    copy: 'Your brand, real typography, and the screens nobody remembers until launch week: empty, loading, error. You approve a working prototype, not a picture of one.',
    receive: ['Design system', 'Interactive prototype'],
  },
  {
    eyebrow: '04 — Build',
    heading: 'Built in the open. Demoed every week.',
    copy: 'Working software from the first milestone, on a staging link you can click. Every change is tested and reviewed, so changing course stays cheap.',
    receive: ['Weekly demo', 'Staging link', 'Tested, reviewed code'],
  },
  {
    eyebrow: '05 — Launch',
    heading: 'Launched, then looked after.',
    copy: 'Production deploys, monitoring and handover docs. Code, accounts and data are yours from day one. Keep Dragulsoft on for the next iteration, or take it in-house.',
    receive: ['Production deploy', 'Monitoring', 'Handover docs'],
  },
]

// The scroll wiring listens for media changes, which a bare `{ matches }` stand-in can't do.
function requestReducedMotion(reduce: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: reduce && query === '(prefers-reduced-motion: reduce)',
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
  }))
}

describe('story chapters', () => {
  beforeEach(() => {
    clearNuxtState()
    requestReducedMotion(true)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it.each(chapters)('says what you receive at $eyebrow', async ({ eyebrow, heading, copy, receive }) => {
    await renderSuspended(LandingHero)

    const article = screen.getByRole('heading', { level: 2, name: heading }).closest('article')
    if (!article)
      throw new Error(`The "${heading}" heading is not inside a chapter.`)
    const chapter = within(article)
    expect(chapter.getByText(eyebrow)).toBeTruthy()
    expect(chapter.getByText(copy)).toBeTruthy()
    expect(chapter.getByText('You receive')).toBeTruthy()
    expect(chapter.getAllByRole('listitem').map(item => item.textContent.trim())).toEqual(receive)
  })

  it('offers a way to jump to the Spec chapter', async () => {
    await renderSuspended(LandingHero)

    expect(screen.getByRole('button', { name: 'See how a project runs' })).toBeTruthy()
  })

  it('offers no way to start yours while the enquiry entry point is unavailable', async () => {
    await renderSuspended(LandingHero)

    expect(screen.queryByRole('button', { name: 'Start yours' })).toBeNull()
  })

  it('opens the enquiry entry point from the Launch chapter with the story source once it is available', async () => {
    const enquiry = useEnquiry()
    enquiry.markAvailable()
    await renderSuspended(LandingHero)

    await userEvent.click(screen.getByRole('button', { name: 'Start yours' }))

    expect(enquiry.open.value).toBe(true)
    expect(enquiry.source.value).toBe('story')
  })
})

describe('story steps', () => {
  beforeEach(() => {
    clearNuxtState()
    requestReducedMotion(true)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('has a button for each stage, with Brief current on mount', async () => {
    await renderSuspended(LandingHero)

    const steps = [
      'Brief',
      'Spec',
      'Design',
      'Build',
      'Launch',
    ].map(name => screen.getByRole('button', { name }))
    expect(steps.map(step => step.getAttribute('aria-current'))).toEqual(['step', null, null, null, null])
  })

  it('moves the current step, stage count and title block along with the story', async () => {
    const story = useStory()
    await renderSuspended(LandingHero)

    story.setLevel(0, 1)
    story.setLevel(1, 1)
    await vi.waitFor(() => expect(screen.getByRole('button', { name: 'Design' }).getAttribute('aria-current')).toBe('step'))

    expect(screen.getByRole('button', { name: 'Brief' }).getAttribute('aria-current')).toBeNull()
    expect(screen.getByText(/^Stage 03/)).toBeTruthy()
    const titleBlock = document.querySelector('[aria-label="Title block"]')
    if (!(titleBlock instanceof HTMLElement))
      throw new TypeError('The title block is missing.')
    expect(within(titleBlock).getByText('03 · Design')).toBeTruthy()
    expect(within(titleBlock).getByText('Approved')).toBeTruthy()
    expect(within(titleBlock).getByText('B')).toBeTruthy()
  })

  it('describes the stage for assistive technology', async () => {
    const story = useStory()
    await renderSuspended(LandingHero)

    story.setLevel(0, 1)
    story.setLevel(1, 1)
    story.setLevel(2, 1)

    await vi.waitFor(() => {
      const figure = screen.getByRole('figure', { name: 'Example product · not a client project' })
      expect(figure.textContent).toContain('An order dashboard with an AI assistant, drawn at the Build stage.')
    })
  })

  it('scrolls to the top from the Brief step', async () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    await renderSuspended(LandingHero)

    await userEvent.click(screen.getByRole('button', { name: 'Brief' }))

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'instant' })
  })
})

describe('the example product', () => {
  beforeEach(() => {
    clearNuxtState()
    requestReducedMotion(true)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  it('shows dashes for the figures before the build and the real values once it is done', async () => {
    const story = useStory()
    await renderSuspended(LandingHero)
    expect(screen.queryByText('1,284')).toBeNull()

    story.setLevel(2, 1)

    await vi.waitFor(() => expect(screen.getByText('1,284')).toBeTruthy())
    expect(screen.getByText('€38.2k')).toBeTruthy()
    expect(screen.getByText('€29.80')).toBeTruthy()
  })

  it('streams the assistant answer in as the build progresses', async () => {
    const story = useStory()
    await renderSuspended(LandingHero)

    story.setLevel(2, 1)

    await vi.waitFor(() => expect(screen.getAllByText('North, up 18% on last week. Mostly repeat customers. Want it broken down by product?')).not.toHaveLength(0))
  })

  it('keeps orders trickling in once launched, and stops when scrolled back', async () => {
    vi.useFakeTimers()
    const story = useStory()
    await renderSuspended(LandingHero)
    vi.spyOn(Math, 'random').mockReturnValue(0)

    for (const index of [0, 1, 2, 3])
      story.setLevel(index, 1)
    await vi.advanceTimersByTimeAsync(2200)
    expect(screen.getByText('1,285')).toBeTruthy()

    story.setLevel(3, 0)
    await vi.advanceTimersByTimeAsync(2200)
    expect(screen.queryByText('1,286')).toBeNull()
    expect(screen.queryByText('1,285')).toBeNull()
  })

  it('does not add orders while the tab is in the background', async () => {
    vi.useFakeTimers()
    const story = useStory()
    await renderSuspended(LandingHero)
    vi.spyOn(document, 'hidden', 'get').mockReturnValue(true)

    for (const index of [0, 1, 2, 3])
      story.setLevel(index, 1)
    await vi.advanceTimersByTimeAsync(2200 * 3)

    expect(screen.getByText('1,284')).toBeTruthy()
  })
})

describe('the headline while the story moves', () => {
  beforeEach(() => {
    clearNuxtState()
    requestReducedMotion(false)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('is split once and not again when the stage changes', async () => {
    const story = useStory()
    await renderSuspended(LandingHero)
    const heading = screen.getByRole('heading', { level: 1 })
    const words = Array.from(heading.children)
    expect(words.length).toBeGreaterThan(0)

    story.setLevel(0, 1)
    await vi.waitFor(() => expect(screen.getByRole('button', { name: 'Spec' }).getAttribute('aria-current')).toBe('step'))

    expect(Array.from(heading.children)).toEqual(words)
  })
})
