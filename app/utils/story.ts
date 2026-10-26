import { ANSWER, STAGES } from '../data/story'

const clamp01 = (value: number) => Math.min(1, Math.max(0, value))
const pad = (value: number) => String(value).padStart(2, '0')

// A stage counts as reached once the level that completes it is half-way.
export function stageFromLevels(levels: readonly number[]) {
  return levels.filter(level => level >= 0.5).length
}

export function figuresAt(build: number, arrivals: number) {
  if (build < 0.02)
    return { orders: '—', revenue: '—', basket: '—' }
  const eased = 1 - (1 - clamp01(build / 0.8)) ** 3
  return {
    orders: Math.round(1284 * eased + arrivals).toLocaleString('en'),
    revenue: `€${(38.2 * eased + arrivals * 0.03).toFixed(1)}k`,
    basket: `€${(29.8 * eased).toFixed(2)}`,
  }
}

export function streamedAnswer(build: number) {
  return ANSWER.slice(0, Math.round(ANSWER.length * clamp01((build - 0.3) / 0.6)))
}

export function titleBlockFor(stage: number, drawnBy: string) {
  const { label, status, rev } = STAGES.at(stage) ?? STAGES[0]
  return [
    { label: 'Project', value: 'Order desk' },
    { label: 'Client', value: 'Example' },
    { label: 'Drawn by', value: drawnBy },
    { label: 'Stage', value: `${pad(stage + 1)} · ${label}` },
    { label: 'Status', value: status },
    { label: 'Rev', value: rev },
  ]
}
