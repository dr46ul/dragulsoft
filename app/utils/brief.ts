import type {
  Audience,
  Band,
  Constraint,
  Currency,
  DataSource,
  Decider,
  Done,
  Feature,
  Kind,
  Launch,
  Priority,
  Ready,
  Source,
  Start,
  System,
  Today,
} from '@dragulsoft/adam-protocol'
import { Enquiry, featuresByKind } from '@dragulsoft/adam-protocol'
import { CURRENCY_SYMBOLS, FEATURE_LABELS, KINDS, LAUNCHES, STARTS } from '../data/brief'

export interface BriefAnswers {
  kinds: Kind[]
  features: Feature[]
  priorities: Record<Feature, Priority>
  scopeOther: string
  systems: System[]
  systemsOther: string
  data: DataSource | null
  dataOther: string
  start: Start
  launch: Launch
  deadline: string
  currency: Currency
  band: Band | null
  problem: string
  audience: Audience[]
  audienceOther: string
  today: Today | null
  todayOther: string
  done: Done[]
  doneOther: string
  ready: Ready[]
  constraints: Constraint[]
  constraintsOther: string
  decider: Decider | null
  name: string
  email: string
  company: string
  projectName: string
}

export function blankAnswers(): BriefAnswers {
  return {
    kinds: [],
    features: [],
    priorities: {
      auth: 'must',
      dashboard: 'must',
      payments: 'must',
      admin: 'must',
      integrations: 'must',
      cms: 'must',
      blog: 'must',
      i18n: 'must',
      leads: 'must',
      analytics: 'must',
      assistant: 'must',
      docsearch: 'must',
      extract: 'must',
      workflow: 'must',
    },
    scopeOther: '',
    systems: [],
    systemsOther: '',
    data: null,
    dataOther: '',
    // The protocol requires timing, so both start on the answer that commits the client to least.
    start: 'idea',
    launch: 'open',
    deadline: '',
    currency: 'EUR',
    band: null,
    problem: '',
    audience: [],
    audienceOther: '',
    today: null,
    todayOther: '',
    done: [],
    doneOther: '',
    ready: [],
    constraints: [],
    constraintsOther: '',
    decider: null,
    name: '',
    email: '',
    company: '',
    projectName: '',
  }
}

function text(value: string) {
  return value.trim() || undefined
}

export function chosenFeatures(answers: BriefAnswers) {
  return KINDS
    .filter(kind => answers.kinds.includes(kind.value))
    .flatMap(kind => featuresByKind[kind.value].filter(feature => answers.features.includes(feature)))
}

function choicesWithOther<T>(choices: T[], otherAnswer: string) {
  const other = text(otherAnswer)
  return choices.length || other
    ? { choices, other }
    : undefined
}

export function toEnquiry(answers: BriefAnswers, source: Source): Enquiry {
  const systemsOther = text(answers.systemsOther)
  const dataOther = text(answers.dataOther)
  const todayOther = text(answers.todayOther)
  return {
    contact: {
      name: answers.name.trim(),
      email: answers.email.trim(),
      company: text(answers.company),
      projectName: text(answers.projectName),
    },
    scope: {
      kinds: KINDS.filter(kind => answers.kinds.includes(kind.value)).map(kind => kind.value),
      features: chosenFeatures(answers).map(feature => ({ feature, priority: answers.priorities[feature] })),
      other: text(answers.scopeOther),
    },
    connections: answers.systems.length || systemsOther || answers.data || dataOther
      ? {
          systems: answers.systems,
          systemsOther,
          data: answers.data ?? undefined,
          dataOther,
        }
      : undefined,
    timing: { start: answers.start, launch: answers.launch, deadline: answers.deadline || undefined },
    budget: answers.band
      ? { currency: answers.currency, band: answers.band }
      : undefined,
    problem: answers.problem.trim(),
    audience: choicesWithOther(answers.audience, answers.audienceOther),
    today: answers.today || todayOther
      ? { choice: answers.today ?? undefined, other: todayOther }
      : undefined,
    done: choicesWithOther(answers.done, answers.doneOther),
    ready: answers.ready.length
      ? { choices: answers.ready }
      : undefined,
    constraints: choicesWithOther(answers.constraints, answers.constraintsOther),
    decider: answers.decider ?? undefined,
    summary: composeBrief(answers),
    source,
  }
}

export function budgetLabel(currency: Currency, band: Band) {
  const symbol = CURRENCY_SYMBOLS[currency]
  switch (band) {
    case 'under-5k': return `Under ${symbol}5k`
    case '5-15k': return `${symbol}5–15k`
    case '15-40k': return `${symbol}15–40k`
    case '40k-plus': return `${symbol}40k+`
    case 'unsure': return 'Not sure yet'
  }
}

function list(items: readonly string[]) {
  if (items.length < 2)
    return items.join('')
  return `${items.slice(0, -1).join(', ')} and ${items.at(-1)}`
}

export function composeBrief(answers: BriefAnswers) {
  const parts = KINDS.filter(kind => answers.kinds.includes(kind.value)).map((kind) => {
    const chosen = featuresByKind[kind.value]
      .filter(feature => answers.features.includes(feature))
      .map(feature => FEATURE_LABELS[feature].toLowerCase())
    return chosen.length
      ? `${kind.noun} with ${list(chosen)}`
      : kind.noun
  })
  if (!parts.length)
    return ''
  const what = parts.length > 1
    ? `${parts.slice(0, -1).join(', ')}, plus ${parts.at(-1)}`
    : parts.join('')
  const name = answers.projectName.trim() || 'Your product'
  const from = STARTS.find(start => start.value === answers.start)?.text
  const when = LAUNCHES.find(launch => launch.value === answers.launch)?.text
  return `${name}: ${what}. We’re starting from ${from}, and ${when}.`
}

export interface BriefIssue {
  field: 'kinds' | 'deadline' | 'problem' | 'name' | 'email'
  message: string
}

// `today` is the visitor's local date as YYYY-MM-DD, which compares correctly as a string.
export function stepIssue(step: number, answers: BriefAnswers, today: string): BriefIssue | null {
  switch (step) {
    case 0:
      return answers.kinds.length
        ? null
        : { field: 'kinds', message: 'Choose at least one thing you’re building.' }
    case 2:
      return answers.deadline && answers.deadline < today
        ? { field: 'deadline', message: 'Pick a deadline from today onwards.' }
        : null
    case 3:
      return answers.problem.trim()
        ? null
        : { field: 'problem', message: 'Describe the problem in a line or two.' }
    case 5:
      if (!answers.name.trim())
        return { field: 'name', message: 'Add your name, so the reply knows who to address.' }
      return Enquiry.shape.contact.shape.email.safeParse(answers.email.trim()).success
        ? null
        : { field: 'email', message: 'Add an email address the reply can reach.' }
    default:
      return null
  }
}
