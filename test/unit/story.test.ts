import { describe, expect, it } from 'vitest'
import { figuresAt, stageFromLevels, streamedAnswer, titleBlockFor } from '../../app/utils/story'

const answer = 'North, up 18% on last week. Mostly repeat customers. Want it broken down by product?'

describe('stageFromLevels', () => {
  it('is the Brief stage while no level has reached a half', () => {
    expect(stageFromLevels([0, 0, 0, 0])).toBe(0)
    expect(stageFromLevels([0.49, 0, 0, 0])).toBe(0)
  })

  it('counts the levels at or above a half', () => {
    expect(stageFromLevels([0.5, 0, 0, 0])).toBe(1)
    expect(stageFromLevels([1, 0.7, 0.2, 0])).toBe(2)
    expect(stageFromLevels([1, 1, 1, 1])).toBe(4)
  })
})

describe('figuresAt', () => {
  it('shows dashes until the build has started', () => {
    expect(figuresAt(0, 0)).toEqual({ orders: '—', revenue: '—', basket: '—' })
    expect(figuresAt(0.019, 5)).toEqual({ orders: '—', revenue: '—', basket: '—' })
  })

  it('reaches the exact values by 0.8 and holds them', () => {
    const final = { orders: '1,284', revenue: '€38.2k', basket: '€29.80' }
    expect(figuresAt(0.8, 0)).toEqual(final)
    expect(figuresAt(1, 0)).toEqual(final)
  })

  it('eases out, so half-way through the count-up is already most of the way', () => {
    expect(figuresAt(0.4, 0).orders).toBe('1,124')
  })

  it('adds each arrived order to the orders and 0.03k of revenue', () => {
    expect(figuresAt(1, 10)).toEqual({ orders: '1,294', revenue: '€38.5k', basket: '€29.80' })
  })
})

describe('streamedAnswer', () => {
  it('is empty up to 0.3', () => {
    expect(streamedAnswer(0)).toBe('')
    expect(streamedAnswer(0.3)).toBe('')
  })

  it('streams in proportion to the build level', () => {
    expect(streamedAnswer(0.6)).toBe('North, up 18% on last week. Mostly repeat ')
  })

  it('is the whole answer from 0.9', () => {
    expect(streamedAnswer(0.9)).toBe(answer)
    expect(streamedAnswer(1)).toBe(answer)
  })
})

describe('titleBlockFor', () => {
  it('describes the project as received at the Brief stage', () => {
    expect(titleBlockFor(0, 'Dragulsoft')).toEqual([
      { label: 'Project', value: 'Order desk' },
      { label: 'Client', value: 'Example' },
      { label: 'Drawn by', value: 'Dragulsoft' },
      { label: 'Stage', value: '01 · Brief' },
      { label: 'Status', value: 'Received' },
      { label: 'Rev', value: '—' },
    ])
  })

  it.each([
    {
      stage: 1,
      name: '02 · Spec',
      status: 'For approval',
      rev: 'A',
    },
    {
      stage: 2,
      name: '03 · Design',
      status: 'Approved',
      rev: 'B',
    },
    {
      stage: 3,
      name: '04 · Build',
      status: 'In build',
      rev: 'C',
    },
    {
      stage: 4,
      name: '05 · Launch',
      status: 'Issued · live',
      rev: '1.0',
    },
  ])('moves the stage, status and revision on at $name', ({ stage, name, status, rev }) => {
    const rows = Object.fromEntries(titleBlockFor(stage, 'Dragulsoft').map(({ label, value }) => [label, value]))

    expect(rows).toMatchObject({ Stage: name, Status: status, Rev: rev })
  })
})
