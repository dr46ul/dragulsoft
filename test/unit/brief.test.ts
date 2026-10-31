import type { BriefAnswers } from '../../app/utils/brief'
import { Enquiry } from '@dragulsoft/adam-protocol'
import { describe, expect, it } from 'vitest'
import { blankAnswers, budgetLabel, composeBrief, toEnquiry } from '../../app/utils/brief'

function answers(overrides: Partial<BriefAnswers>): BriefAnswers {
  return {
    ...blankAnswers(),
    start: 'idea',
    launch: 'open',
    ...overrides,
  }
}

describe('composeBrief', () => {
  it('describes one kind with its features, the starting point and the launch window', () => {
    expect(composeBrief(answers({
      kinds: ['app'],
      features: ['auth', 'dashboard', 'payments'],
      start: 'idea',
      launch: 'quarter',
    }))).toBe('Your product: a web app with accounts & sign-in, dashboards & reports and payments & billing. We’re starting from just an idea, and are aiming to launch within a quarter.')
  })

  it('joins two kinds with ", plus"', () => {
    expect(composeBrief(answers({
      kinds: ['app', 'ai'],
      features: ['auth', 'assistant'],
    }))).toBe('Your product: a web app with accounts & sign-in, plus an AI integration with chat assistant. We’re starting from just an idea, and have no fixed launch date.')
  })

  it('joins three kinds with commas and ", plus" before the last, in catalog order', () => {
    expect(composeBrief(answers({
      kinds: ['ai', 'site', 'app'],
      features: ['blog', 'cms'],
    }))).toBe('Your product: a web app, a website with content editing (cms) and blog or news, plus an AI integration. We’re starting from just an idea, and have no fixed launch date.')
  })

  it('leaves out features whose kind is not chosen', () => {
    expect(composeBrief(answers({
      kinds: ['site'],
      features: ['auth', 'analytics'],
    }))).toBe('Your product: a website with analytics. We’re starting from just an idea, and have no fixed launch date.')
  })

  it('names the project when a name is given', () => {
    expect(composeBrief(answers({
      kinds: ['site'],
      projectName: '  Order desk ',
    }))).toBe('Order desk: a website. We’re starting from just an idea, and have no fixed launch date.')
  })

  it('leaves out the starting point and launch window until they are chosen', () => {
    expect(composeBrief(answers({
      kinds: ['site'],
      start: null,
      launch: null,
    }))).toBe('Your product: a website.')
  })

  it('gives the starting point alone while the launch window is open', () => {
    expect(composeBrief(answers({
      kinds: ['site'],
      launch: null,
    }))).toBe('Your product: a website. We’re starting from just an idea.')
  })

  it('gives the launch window alone while the starting point is open', () => {
    expect(composeBrief(answers({
      kinds: ['site'],
      start: null,
      launch: 'quarter',
    }))).toBe('Your product: a website. We are aiming to launch within a quarter.')
  })

  it('is empty until a kind is chosen', () => {
    expect(composeBrief(answers({
      features: ['auth'],
    }))).toBe('')
  })

  it.each([
    ['idea', 'just an idea'],
    ['designs', 'existing designs'],
    ['live', 'a product that already exists'],
  ] as const)('starts from %s as "%s"', (start, text) => {
    expect(composeBrief(answers({
      kinds: ['app'],
      start,
    }))).toContain(`We’re starting from ${text}, and`)
  })

  it.each([
    ['asap', 'would like to launch as soon as possible'],
    ['quarter', 'are aiming to launch within a quarter'],
    ['open', 'have no fixed launch date'],
  ] as const)('launches %s as "%s"', (launch, text) => {
    expect(composeBrief(answers({
      kinds: ['app'],
      launch,
    }))).toMatch(new RegExp(`, and ${text}\\.$`))
  })
})

describe('budgetLabel', () => {
  it.each([
    ['EUR', 'under-5k', 'Under €5k'],
    ['EUR', '5-15k', '€5–15k'],
    ['EUR', '15-40k', '€15–40k'],
    ['EUR', '40k-plus', '€40k+'],
    ['USD', '5-15k', '$5–15k'],
    ['USD', 'under-5k', 'Under $5k'],
    ['GBP', '40k-plus', '£40k+'],
    ['GBP', '15-40k', '£15–40k'],
    ['GBP', 'unsure', 'Not sure yet'],
  ] as const)('shows %s %s as "%s"', (currency, band, label) => {
    expect(budgetLabel(currency, band)).toBe(label)
  })
})

describe('toEnquiry', () => {
  it('maps a minimal brief onto an Enquiry the protocol accepts, leaving out what was not answered', () => {
    const minimal = answers({
      kinds: ['site'],
      problem: ' Nobody can find our opening hours. ',
      name: ' Ana ',
      email: 'ana@example.com',
    })

    const enquiry = toEnquiry(minimal, 'hero')

    expect(enquiry).toEqual({
      contact: { name: 'Ana', email: 'ana@example.com' },
      scope: {
        kinds: ['site'],
        features: [],
      },
      timing: { start: 'idea', launch: 'open' },
      problem: 'Nobody can find our opening hours.',
      summary: 'Your product: a website. We’re starting from just an idea, and have no fixed launch date.',
      source: 'hero',
    })
    expect(Enquiry.safeParse(enquiry).success).toBe(true)
  })

  it('maps a full brief onto an Enquiry the protocol accepts, with priorities and only features of chosen kinds', () => {
    const full = answers({
      kinds: ['app', 'ai'],
      features: [
        'auth',
        'dashboard',
        'cms',
        'assistant',
      ],
      priorities: {
        ...blankAnswers().priorities,
        dashboard: 'nice',
      },
      scopeOther: 'A kiosk mode',
      systems: ['payments', 'crm'],
      systemsOther: 'Shopify',
      data: 'spreadsheets',
      dataOther: 'Three years of orders',
      start: 'designs',
      launch: 'quarter',
      deadline: '2027-03-01',
      currency: 'GBP',
      band: '15-40k',
      problem: 'Orders are re-typed into three spreadsheets.',
      audience: ['team'],
      audienceOther: 'Our drivers',
      today: 'spreadsheets',
      todayOther: 'And a shared inbox',
      done: ['team-saves-time'],
      doneOther: 'Totals by Monday',
      ready: ['brand'],
      constraints: ['gdpr'],
      constraintsOther: 'EU hosting',
      decider: 'team',
      name: 'Ana',
      email: 'ana@example.com',
      company: 'Bakery Co',
      projectName: 'Order desk',
    })

    const enquiry = toEnquiry(full, 'teaser')

    expect(enquiry).toEqual({
      contact: {
        name: 'Ana',
        email: 'ana@example.com',
        company: 'Bakery Co',
        projectName: 'Order desk',
      },
      scope: {
        kinds: ['app', 'ai'],
        features: [
          { feature: 'auth', priority: 'must' },
          { feature: 'dashboard', priority: 'nice' },
          { feature: 'assistant', priority: 'must' },
        ],
        other: 'A kiosk mode',
      },
      connections: {
        systems: {
          choices: ['payments', 'crm'],
          other: 'Shopify',
        },
        data: {
          choice: 'spreadsheets',
          other: 'Three years of orders',
        },
      },
      timing: { start: 'designs', launch: 'quarter', deadline: '2027-03-01' },
      budget: { currency: 'GBP', band: '15-40k' },
      problem: 'Orders are re-typed into three spreadsheets.',
      audience: {
        choices: ['team'],
        other: 'Our drivers',
      },
      today: { choice: 'spreadsheets', other: 'And a shared inbox' },
      done: {
        choices: ['team-saves-time'],
        other: 'Totals by Monday',
      },
      ready: {
        choices: ['brand'],
      },
      constraints: {
        choices: ['gdpr'],
        other: 'EU hosting',
      },
      decider: 'team',
      summary: 'Order desk: a web app with accounts & sign-in and dashboards & reports, plus an AI integration with chat assistant. We’re starting from existing designs, and are aiming to launch within a quarter.',
      source: 'teaser',
    })
    expect(Enquiry.safeParse(enquiry).success).toBe(true)
  })

  it('has no Enquiry to give while the starting point or launch window is unanswered', () => {
    const undecided = answers({
      kinds: ['site'],
      problem: 'Nobody can find our opening hours.',
      name: 'Ana',
      email: 'ana@example.com',
    })

    expect(toEnquiry({ ...undecided, start: null }, 'hero')).toBeNull()
    expect(toEnquiry({ ...undecided, launch: null }, 'hero')).toBeNull()
  })

  it('sends only the connection that was answered', () => {
    const enquiry = toEnquiry(answers({
      kinds: ['site'],
      problem: 'Nobody can find our opening hours.',
      name: 'Ana',
      email: 'ana@example.com',
      data: 'another-app',
    }), 'hero')

    expect(enquiry?.connections).toEqual({
      data: { choice: 'another-app' },
    })
    expect(Enquiry.safeParse(enquiry).success).toBe(true)
  })
})
