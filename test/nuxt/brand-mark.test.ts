import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import BrandMark from '~/components/BrandMark.vue'

describe('brand mark', () => {
  it('is decorative, so assistive tech skips the drawing', async () => {
    const wrapper = await mountSuspended(BrandMark)

    expect(wrapper.find('svg').attributes('aria-hidden')).toBe('true')
  })
})
