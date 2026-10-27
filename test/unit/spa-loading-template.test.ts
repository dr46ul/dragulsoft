import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const template = readFileSync(new URL('../../app/spa-loading-template.html', import.meta.url), 'utf8')
const css = readFileSync(new URL('../../app/assets/css/main.css', import.meta.url), 'utf8')

function tokens(source: string, prefix: string) {
  const declarations = source.matchAll(new RegExp(`${prefix}([\\w-]+):\\s*(oklch\\([^)]*\\))`, 'g'))
  return new Map(Array.from(declarations, ([, name, value]) => [name, value]))
}

const loader = tokens(template, '--')
const theme = tokens(css, '--color-')

// The loader names its tokens for what it draws; each one is a copy of this theme colour.
const copies = {
  'base-100': 'base-100',
  'base-200': 'base-200',
  'content': 'base-content',
  'primary': 'primary',
  'secondary': 'secondary',
}

describe('the SPA loading template', () => {
  it('copies every colour it uses from the theme', () => {
    expect(Array.from(loader.keys()).sort()).toEqual(Object.keys(copies).sort())
  })

  it.each(Object.entries(copies))('has --%s equal to the theme\'s --color-%s', (copy, source) => {
    expect(theme.get(source)).toBeDefined()
    expect(loader.get(copy)).toBe(theme.get(source))
  })
})
