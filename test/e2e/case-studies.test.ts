import { createPage } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'
import { setupApp } from './setup'

await setupApp()

describe('case studies while none are published', () => {
  it('leaves no trace of the section on the page', async () => {
    const page = await createPage('/', { reducedMotion: 'reduce' })

    expect(await page.locator('#work').count()).toBe(0)
    expect(await page.getByText('Drawings on file.').count()).toBe(0)
    await page.close()
  })
})
