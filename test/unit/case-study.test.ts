import { describe, expect, it } from 'vitest'
import { clientLabel, disciplineLabel } from '../../app/utils/case-study'

describe('disciplineLabel', () => {
  it('uses the Services titles', () => {
    expect(disciplineLabel('web-app')).toBe('Web apps & SaaS')
    expect(disciplineLabel('website')).toBe('Websites & landing pages')
    expect(disciplineLabel('ai-integration')).toBe('AI integrations')
  })
})

describe('clientLabel', () => {
  it('shows a named client as written', () => {
    expect(clientLabel('Northwind Freight')).toBe('Northwind Freight')
  })

  it('shows a confidential client as "Confidential client"', () => {
    expect(clientLabel('confidential')).toBe('Confidential client')
  })
})
