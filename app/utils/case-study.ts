// Titles match the Services section's cards.
const DISCIPLINE_LABELS = {
  'web-app': 'Web apps & SaaS',
  'website': 'Websites & landing pages',
  'ai-integration': 'AI integrations',
}

export type Discipline = keyof typeof DISCIPLINE_LABELS

export interface CaseStudy {
  title: string
  /** One sentence. */
  summary: string
  /** The client's name, or `'confidential'` when it can't be named. */
  client: string
  market: string
  disciplines: [Discipline, ...Discipline[]]
}

export function disciplineLabel(discipline: Discipline) {
  return DISCIPLINE_LABELS[discipline]
}

export function clientLabel(client: string) {
  return client === 'confidential'
    ? 'Confidential client'
    : client
}
