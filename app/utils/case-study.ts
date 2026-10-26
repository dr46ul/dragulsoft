import { SERVICES } from '../data/services'

export type Discipline = (typeof SERVICES)[number]['id']

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
  return SERVICES.find(service => service.id === discipline)?.title ?? discipline
}

export function clientLabel(client: string) {
  return client === 'confidential'
    ? 'Confidential client'
    : client
}
