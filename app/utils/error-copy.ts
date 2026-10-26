export interface ErrorCopy {
  label: string
  title: string
  lede: string
}

export function errorCopy(status: number, statusText?: string): ErrorCopy {
  if (status === 404) {
    return {
      label: 'Not in set',
      title: 'This sheet isn’t in the set.',
      lede: 'There’s no page drawn at this address. It may have moved, or the link was copied down wrong.',
    }
  }
  if (status >= 500) {
    return {
      label: 'Failed to plot',
      title: 'This drawing didn’t render.',
      lede: 'Something went wrong on our side while drawing up this page. Try again, or head back to the start.',
    }
  }
  return {
    label: statusText ?? 'Withheld',
    title: 'This sheet can’t be shown.',
    lede: 'The page exists, but it can’t be opened from here. Head back to the start and pick another way in.',
  }
}
