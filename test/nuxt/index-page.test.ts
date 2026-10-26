import { renderSuspended } from '@nuxt/test-utils/runtime'
import { screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import IndexPage from '~/pages/index.vue'

describe('index page', () => {
  it('has a main landmark for the sections to render in', async () => {
    await renderSuspended(IndexPage)

    expect(screen.getByRole('main').id).toBe('main')
  })

  it('offers a skip link to the main landmark as the first link', async () => {
    await renderSuspended(IndexPage)

    const [firstLink] = screen.getAllByRole('link')
    expect(firstLink).toBe(screen.getByRole('link', { name: 'Skip to content' }))
    expect(firstLink?.getAttribute('href')).toBe(`#${screen.getByRole('main').id}`)
  })
})
