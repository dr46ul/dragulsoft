import { mockNuxtImport, renderSuspended } from '@nuxt/test-utils/runtime'
import { fireEvent, screen } from '@testing-library/vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { createError } from '#imports'
import ErrorPage from '~/error.vue'
import { requestReducedMotion } from './reduced-motion'

const { clearError, reloadNuxtApp } = vi.hoisted(() => ({
  clearError: vi.fn(),
  reloadNuxtApp: vi.fn(),
}))
mockNuxtImport('clearError', () => clearError)
mockNuxtImport('reloadNuxtApp', () => reloadNuxtApp)

async function renderError(fields: Parameters<typeof createError>[0]) {
  return renderSuspended(ErrorPage, {
    props: {
      error: createError(fields),
    },
  })
}

// createError always fills `status`, so the deprecated-only shape has to be made by hand.
async function renderLegacyError(statusCode?: number) {
  const error = createError({ statusCode })
  Object.defineProperty(error, 'status', { value: undefined })
  return renderSuspended(ErrorPage, {
    props: { error },
  })
}

describe('error page', () => {
  afterEach(() => {
    clearError.mockClear()
    reloadNuxtApp.mockClear()
    vi.unstubAllGlobals()
  })

  it('tells a visitor on a missing page that nothing is drawn at the address', async () => {
    await renderError({ status: 404 })

    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('This sheet isn’t in the set.')
    expect(screen.getByText(/There’s no page drawn at this address/)).toBeTruthy()
    expect(screen.getByText(/Error 404/)).toBeTruthy()
  })

  it('tells a visitor of a server failure that the problem is on our side', async () => {
    await renderError({ status: 503 })

    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('This drawing didn’t render.')
    expect(screen.getByText(/went wrong on our side/)).toBeTruthy()
  })

  it('names a refusal by its status text and says the page can’t be shown from here', async () => {
    await renderError({ status: 403, statusText: 'Forbidden' })

    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('This sheet can’t be shown.')
    expect(screen.getByText(/Forbidden/)).toBeTruthy()
  })

  it('reads the status from the deprecated statusCode when status is absent', async () => {
    await renderLegacyError(404)

    expect(screen.getByText(/Error 404/)).toBeTruthy()
  })

  it('treats an error with no status at all as a server failure', async () => {
    const error = createError({})
    Object.defineProperty(error, 'status', { value: undefined })
    Object.defineProperty(error, 'statusCode', { value: undefined })
    await renderSuspended(ErrorPage, {
      props: { error },
    })

    expect(screen.getByText(/Error 500/)).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Try again' })).toBeTruthy()
  })

  it('falls back to a generic label when a refusal has no status text', async () => {
    await renderError({ status: 403, statusText: '' })

    expect(screen.getByText(/· Withheld/, { selector: '.chip' })).toBeTruthy()
  })

  it('offers only a primary way home on a refusal', async () => {
    await renderError({ status: 403 })

    expect(screen.queryByRole('button', { name: 'Try again' })).toBeNull()
    expect(screen.getByRole('button', { name: 'Back to the homepage' }).className).toContain('btn-primary')
  })

  it('makes the way home the ghost button beside Try again on a server failure', async () => {
    await renderError({ status: 500 })

    expect(screen.getByRole('button', { name: 'Try again' }).className).toContain('btn-primary')
    expect(screen.getByRole('button', { name: 'Back to the homepage' }).className).toContain('btn-ghost')
  })

  it('offers only the way home on a missing page, and sends the visitor to the homepage', async () => {
    await renderError({ status: 404 })

    expect(screen.queryByRole('button', { name: 'Try again' })).toBeNull()
    await fireEvent.click(screen.getByRole('button', { name: 'Back to the homepage' }))

    expect(clearError).toHaveBeenCalledWith({ redirect: '/' })
  })

  it('sends the visitor home from the brand link without following the href', async () => {
    await renderError({ status: 404 })

    await fireEvent.click(screen.getByRole('link', { name: /Dragulsoft/ }))

    expect(clearError).toHaveBeenCalledWith({ redirect: '/' })
  })

  it('offers Try again first on a server failure, which reloads the app', async () => {
    await renderError({ status: 500 })

    const buttons = screen.getAllByRole('button').map(button => button.textContent?.trim())
    expect(buttons).toEqual(['Try again', 'Back to the homepage'])
    await fireEvent.click(screen.getByRole('button', { name: 'Try again' }))

    expect(reloadNuxtApp).toHaveBeenCalledWith({ force: true })
  })

  it('has one main landmark and keeps the decorative layers out of the accessibility tree', async () => {
    const { container } = await renderError({ status: 404 })

    expect(screen.getAllByRole('main')).toHaveLength(1)
    expect(screen.getAllByRole('heading')).toHaveLength(1)
    const hidden = [
      container.querySelector('.numeral'),
      container.querySelector('.crosshair'),
      container.querySelector('.target'),
      screen.getByText('A', { selector: 'span' }),
      screen.getByText('1', { selector: 'span' }),
    ]
    for (const element of hidden)
      expect(element?.closest('[aria-hidden="true"]')).not.toBeNull()
  })

  it('moves the readout with the mouse, and ignores touch', async () => {
    requestReducedMotion(false)
    await renderError({ status: 404 })
    expect(screen.getByText(/· Not in set/, { selector: '.chip' })).toBeTruthy()

    window.dispatchEvent(new PointerEvent('pointermove', { pointerType: 'touch', clientX: 10, clientY: 10 }))
    await nextTick()
    expect(screen.getByText(/· Not in set/, { selector: '.chip' })).toBeTruthy()

    window.dispatchEvent(new PointerEvent('pointermove', { pointerType: 'mouse', clientX: 10, clientY: 10 }))
    await nextTick()
    expect(screen.getByText('A1 · Blank', { selector: '.chip' })).toBeTruthy()
  })

  it('parks the crosshair rather than following the pointer under reduced motion', async () => {
    requestReducedMotion(true)
    await renderError({ status: 404 })

    window.dispatchEvent(new PointerEvent('pointermove', { pointerType: 'mouse', clientX: 10, clientY: 10 }))
    await nextTick()

    expect(screen.getByText(/· Not in set/, { selector: '.chip' })).toBeTruthy()
  })
})
