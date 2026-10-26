export const STAGES = [
  { label: 'Brief', status: 'Received', rev: '—' },
  { label: 'Spec', status: 'For approval', rev: 'A' },
  { label: 'Design', status: 'Approved', rev: 'B' },
  { label: 'Build', status: 'In build', rev: 'C' },
  { label: 'Launch', status: 'Issued · live', rev: '1.0' },
] as const

export const CHAPTERS = [
  {
    stage: 'Spec',
    title: 'Scoped on paper before a line of code.',
    copy: 'Screens, flows, data and integrations get mapped first, while a change costs an eraser instead of a sprint. You sign off a written scope with a fixed estimate and the trade-offs spelled out.',
    receive: ['Written scope', 'Fixed estimate', 'Clickable wireframe'],
  },
  {
    stage: 'Design',
    title: 'Every state designed before it’s built.',
    copy: 'Your brand, real typography, and the screens nobody remembers until launch week: empty, loading, error. You approve a working prototype, not a picture of one.',
    receive: ['Design system', 'Interactive prototype'],
  },
  {
    stage: 'Build',
    title: 'Built in the open. Demoed every week.',
    copy: 'Working software from the first milestone, on a staging link you can click. Every change is tested and reviewed, so changing course stays cheap.',
    receive: ['Weekly demo', 'Staging link', 'Tested, reviewed code'],
  },
  {
    stage: 'Launch',
    title: 'Launched, then looked after.',
    copy: 'Production deploys, monitoring and handover docs. Code, accounts and data are yours from day one. Keep Dragulsoft on for the next iteration, or take it in-house.',
    receive: ['Production deploy', 'Monitoring', 'Handover docs'],
  },
]

export const LEGEND = [
  'Search & status',
  'Key figures',
  'Weekly trend',
  'AI assistant',
  'Orders table',
]

export const ORDERS = [
  {
    id: 4821,
    region: 'North',
    channel: 'Web',
    total: '€42.10',
    paid: true,
  },
  {
    id: 4820,
    region: 'Coast',
    channel: 'Store',
    total: '€18.00',
    paid: false,
  },
  {
    id: 4819,
    region: 'Central',
    channel: 'Web',
    total: '€96.40',
    paid: true,
  },
  {
    id: 4818,
    region: 'North',
    channel: 'App',
    total: '€27.90',
    paid: true,
  },
]

export const QUESTION = 'Which region grew fastest this week?'
export const ANSWER = 'North, up 18% on last week. Mostly repeat customers. Want it broken down by product?'
