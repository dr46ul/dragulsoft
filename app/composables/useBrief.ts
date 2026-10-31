import type { EnquiryPrefill } from './useEnquiry'
import { blankAnswers } from '~/utils/brief'

// Held in Nuxt state rather than the dialog, so a closed wizard keeps its answers for the page's lifetime.
export function useBrief() {
  const answers = useState('brief-answers', blankAnswers)
  const step = useState('brief-step', () => 0)
  const reached = useState('brief-reached', () => 0)

  function applyPrefill(prefill: EnquiryPrefill) {
    const { kinds, features, start, launch, projectName } = prefill
    answers.value = {
      ...answers.value,
      ...(kinds && {
        kinds: [...kinds],
      }),
      ...(features && {
        features: [...features],
      }),
      ...(start && { start }),
      ...(launch && { launch }),
      ...(projectName !== undefined && { projectName }),
    }
    step.value = 0
  }

  function goTo(index: number) {
    step.value = index
    reached.value = Math.max(reached.value, index)
  }

  function reset() {
    answers.value = blankAnswers()
    step.value = 0
    reached.value = 0
  }

  return {
    answers,
    step,
    reached,
    applyPrefill,
    goTo,
    reset,
  }
}
