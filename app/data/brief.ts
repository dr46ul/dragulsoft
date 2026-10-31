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
  Ready,
  Start,
  System,
  Today,
} from '@dragulsoft/adam-protocol'

export const KINDS = [
  { value: 'app', label: 'Web app / SaaS', noun: 'a web app' },
  { value: 'site', label: 'Website', noun: 'a website' },
  { value: 'ai', label: 'AI integration', noun: 'an AI integration' },
] as const satisfies readonly { value: Kind, label: string, noun: string }[]

export const FEATURE_LABELS = {
  auth: 'Accounts & sign-in',
  dashboard: 'Dashboards & reports',
  payments: 'Payments & billing',
  admin: 'Admin panel',
  integrations: 'Integrations',
  cms: 'Content editing (CMS)',
  blog: 'Blog or news',
  i18n: 'Several languages',
  leads: 'Contact & lead forms',
  analytics: 'Analytics',
  assistant: 'Chat assistant',
  docsearch: 'Search your documents',
  extract: 'Extract data from files',
  workflow: 'Automate a workflow',
} as const satisfies Record<Feature, string>

export const SYSTEMS = [
  { value: 'payments', label: 'Payments' },
  { value: 'crm', label: 'CRM' },
  { value: 'email', label: 'Email or newsletter' },
  { value: 'accounting', label: 'Accounting' },
  { value: 'calendar', label: 'Calendar or booking' },
  { value: 'own-api', label: 'Your own API or database' },
  { value: 'none', label: 'None' },
] as const satisfies readonly { value: System, label: string }[]

export const DATA_SOURCES = [
  { value: 'none', label: 'None' },
  { value: 'spreadsheets', label: 'Spreadsheets' },
  { value: 'another-app', label: 'Another app or database' },
] as const satisfies readonly { value: DataSource, label: string }[]

export const STARTS = [
  { value: 'idea', label: 'Just an idea', text: 'just an idea' },
  { value: 'designs', label: 'Have designs', text: 'existing designs' },
  { value: 'live', label: 'Live product', text: 'a product that already exists' },
] as const satisfies readonly { value: Start, label: string, text: string }[]

export const LAUNCHES = [
  { value: 'asap', label: 'As soon as possible', text: 'would like to launch as soon as possible' },
  { value: 'quarter', label: 'Within a quarter', text: 'are aiming to launch within a quarter' },
  { value: 'open', label: 'No fixed date', text: 'have no fixed launch date' },
] as const satisfies readonly { value: Launch, label: string, text: string }[]

export const CURRENCY_SYMBOLS = { EUR: '€', USD: '$', GBP: '£' } as const satisfies Record<Currency, string>

export const BANDS = [
  'under-5k',
  '5-15k',
  '15-40k',
  '40k-plus',
  'unsure',
] as const satisfies readonly Band[]

export const AUDIENCES = [
  { value: 'customers', label: 'Our customers' },
  { value: 'team', label: 'Our team' },
  { value: 'partners', label: 'Partners or suppliers' },
] as const satisfies readonly { value: Audience, label: string }[]

export const TODAYS = [
  { value: 'nothing', label: 'Nothing yet' },
  { value: 'spreadsheets', label: 'Spreadsheets' },
  { value: 'off-the-shelf', label: 'An off-the-shelf tool' },
  { value: 'own-product', label: 'Our own product' },
] as const satisfies readonly { value: Today, label: string }[]

export const DONES = [
  { value: 'customers-use-it', label: 'Customers use it' },
  { value: 'team-saves-time', label: 'The team saves time' },
  { value: 'revenue-grows', label: 'Revenue grows' },
  { value: 'replaces-a-tool', label: 'It replaces a tool' },
] as const satisfies readonly { value: Done, label: string }[]

export const READIES = [
  { value: 'designs', label: 'Designs' },
  { value: 'content', label: 'Content' },
  { value: 'brand', label: 'Brand' },
  { value: 'none', label: 'None yet' },
] as const satisfies readonly { value: Ready, label: string }[]

export const CONSTRAINTS = [
  { value: 'gdpr', label: 'GDPR' },
  { value: 'accessibility', label: 'Accessibility' },
  { value: 'hosting', label: 'Specific hosting' },
  { value: 'none', label: 'None' },
] as const satisfies readonly { value: Constraint, label: string }[]

export const DECIDERS = [
  { value: 'me', label: 'Me' },
  { value: 'team', label: 'A team' },
  { value: 'someone-else', label: 'Someone else' },
] as const satisfies readonly { value: Decider, label: string }[]

export const STEPS = [
  'Scope',
  'Connections',
  'Timing & budget',
  'The problem',
  'Done & readiness',
  'Your details',
] as const
