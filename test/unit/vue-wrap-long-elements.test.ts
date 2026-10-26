import { ESLint } from 'eslint'
import { describe, expect, it } from 'vitest'

const eslint = new ESLint({ fix: true })

async function format(template: string) {
  const [result] = await eslint.lintText(`<template>\n  <div>\n${template}\n  </div>\n</template>\n`, {
    filePath: 'app/components/Fixture.vue',
  })
  return result?.output?.split('\n').slice(2, -3).join('\n') ?? template
}

const classes = 'flex-1 truncate rounded-field bg-base-200 px-2 py-0.5 font-label text-[0.55rem] text-base-content/60'

describe('vue-wrap-long-elements', () => {
  it('moves the content of a long element onto its own line', async () => {
    expect(await format(`    <span class="${classes}">orders.example.com</span>`)).toBe([
      `    <span class="${classes}">`,
      '      orders.example.com',
      '    </span>',
    ].join('\n'))
  })

  it('puts each attribute of a long tag on its own line, bindings first', async () => {
    expect(await format(`    <span class="${classes}" :id :data-order="data">orders.example.com</span>`)).toBe([
      '    <span',
      '      :id',
      '      :data-order="data"',
      `      class="${classes}"`,
      '    >',
      '      orders.example.com',
      '    </span>',
    ].join('\n'))
  })

  it('leaves an element that fits alone', async () => {
    const template = '    <span :id class="badge">orders.example.com</span>'
    expect(await format(template)).toBe(template)
  })

  it('leaves an element that shares its line with a sibling', async () => {
    const template = `    <span class="wire">Browser</span><span class="${classes}">orders.example.com</span>`
    expect(await format(template)).toBe(template)
  })

  it('leaves whitespace-sensitive content in place', async () => {
    const template = `    <pre class="${classes}">orders.example.com</pre>`
    expect(await format(template)).toBe(template)
  })
})
