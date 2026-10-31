// Stands in for the contracts package Adam publishes to GitHub Packages, written to Adam's Enquiry spec until it ships.
// Replace the `link:` dependency in package.json with the published version and delete this directory.
/* eslint-disable ts/no-redeclare -- each schema shares its name with its inferred type, as in Adam's package */
import { z } from 'zod'

export const ENQUIRY_PATH = '/api/enquiries'

export const kinds = ['app', 'site', 'ai'] as const
export const Kind = z.enum(kinds)
export type Kind = z.infer<typeof Kind>

export const featuresByKind = {
  app: [
    'auth',
    'dashboard',
    'payments',
    'admin',
    'integrations',
  ],
  site: [
    'cms',
    'blog',
    'i18n',
    'leads',
    'analytics',
  ],
  ai: [
    'assistant',
    'docsearch',
    'extract',
    'workflow',
  ],
} as const satisfies Record<Kind, readonly string[]>
export const features = [
  ...featuresByKind.app,
  ...featuresByKind.site,
  ...featuresByKind.ai,
] as const
export const Feature = z.enum(features)
export type Feature = z.infer<typeof Feature>

export const priorities = ['must', 'nice'] as const
export const Priority = z.enum(priorities)
export type Priority = z.infer<typeof Priority>

export const systems = [
  'payments',
  'crm',
  'email',
  'accounting',
  'calendar',
  'own-api',
  'none',
] as const
export const System = z.enum(systems)
export type System = z.infer<typeof System>

export const dataSources = ['none', 'spreadsheets', 'another-app'] as const
export const DataSource = z.enum(dataSources)
export type DataSource = z.infer<typeof DataSource>

export const starts = ['idea', 'designs', 'live'] as const
export const Start = z.enum(starts)
export type Start = z.infer<typeof Start>

export const launches = ['asap', 'quarter', 'open'] as const
export const Launch = z.enum(launches)
export type Launch = z.infer<typeof Launch>

export const currencies = ['EUR', 'USD', 'GBP'] as const
export const Currency = z.enum(currencies)
export type Currency = z.infer<typeof Currency>

export const bands = [
  'under-5k',
  '5-15k',
  '15-40k',
  '40k-plus',
  'unsure',
] as const
export const Band = z.enum(bands)
export type Band = z.infer<typeof Band>

export const audiences = ['customers', 'team', 'partners'] as const
export const Audience = z.enum(audiences)
export type Audience = z.infer<typeof Audience>

export const todays = [
  'nothing',
  'spreadsheets',
  'off-the-shelf',
  'own-product',
] as const
export const Today = z.enum(todays)
export type Today = z.infer<typeof Today>

export const dones = [
  'customers-use-it',
  'team-saves-time',
  'revenue-grows',
  'replaces-a-tool',
] as const
export const Done = z.enum(dones)
export type Done = z.infer<typeof Done>

export const readies = ['designs', 'content', 'brand', 'none'] as const
export const Ready = z.enum(readies)
export type Ready = z.infer<typeof Ready>

export const constraints = [
  'gdpr',
  'accessibility',
  'hosting',
  'none',
] as const
export const Constraint = z.enum(constraints)
export type Constraint = z.infer<typeof Constraint>

export const deciders = ['me', 'team', 'someone-else'] as const
export const Decider = z.enum(deciders)
export type Decider = z.infer<typeof Decider>

export const sources = [
  'nav',
  'hero',
  'story',
  'teaser',
  'footer',
] as const
export const Source = z.enum(sources)
export type Source = z.infer<typeof Source>

const other = z.string().max(200).optional()

export const Enquiry = z.object({
  contact: z.object({
    name: z.string().min(1).max(80),
    email: z.email(),
    company: z.string().max(80).optional(),
    projectName: z.string().max(32).optional(),
  }),
  scope: z.object({
    kinds: z.array(Kind).min(1),
    features: z.array(z.object({ feature: Feature, priority: Priority })),
    other,
  }).refine(
    scope => scope.features.every(({ feature }) => scope.kinds.some((kind) => {
      const owned: readonly Feature[] = featuresByKind[kind]
      return owned.includes(feature)
    })),
    {
      message: 'Every feature must belong to a chosen kind',
      path: ['features'],
    },
  ),
  connections: z.object({
    systems: z.array(System),
    systemsOther: other,
    data: DataSource.optional(),
    dataOther: other,
  }).optional(),
  timing: z.object({
    start: Start,
    launch: Launch,
    deadline: z.iso.date().optional(),
  }),
  budget: z.object({ currency: Currency, band: Band }).optional(),
  problem: z.string().min(1).max(280),
  audience: z.object({
    choices: z.array(Audience),
    other,
  }).optional(),
  today: z.object({
    choice: Today.optional(),
    other,
  }).optional(),
  done: z.object({
    choices: z.array(Done),
    other,
  }).optional(),
  ready: z.object({
    choices: z.array(Ready),
  }).optional(),
  constraints: z.object({
    choices: z.array(Constraint),
    other,
  }).optional(),
  decider: Decider.optional(),
  summary: z.string().min(1).max(600),
  source: Source,
})
export type Enquiry = z.infer<typeof Enquiry>
