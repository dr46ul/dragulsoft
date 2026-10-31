<script setup lang="ts">
import { Enquiry, ENQUIRY_PATH } from '@dragulsoft/adam-protocol'
import { STEPS } from '~/data/brief'
import { stepIssue, toEnquiry } from '~/utils/brief'

const enquiry = useEnquiry()
const { answers, step, reached, applyPrefill, goTo, reset } = useBrief()
const { adamBaseUrl } = useRuntimeConfig().public

const dialog = useTemplateRef<HTMLDialogElement>('dialog')
const heading = useTemplateRef<HTMLHeadingElement>('heading')
const state = ref<'editing' | 'sending' | 'sent' | 'failed'>('editing')
const sentTo = ref('')
const attempted = ref(false)
// Under reduced motion the step swaps without CSS, so nothing waits on a transition that never runs.
const fades = ref(false)

const today = () => new Date().toLocaleDateString('en-CA')
const issue = computed(() => attempted.value
  ? stepIssue(step.value, answers.value, today())
  : null)
const last = computed(() => step.value === STEPS.length - 1)

async function focusHeading() {
  await nextTick()
  heading.value?.focus()
}

function show(index: number) {
  attempted.value = false
  goTo(index)
  focusHeading()
}

watch(() => enquiry.open.value, (open) => {
  if (!open)
    return dialog.value?.close()
  if (enquiry.prefill.value)
    applyPrefill(enquiry.prefill.value)
  if (!dialog.value?.open)
    dialog.value?.showModal()
  focusHeading()
})

function onClose() {
  enquiry.close()
  if (state.value === 'sent')
    state.value = 'editing'
}

function next() {
  if (stepIssue(step.value, answers.value, today())) {
    attempted.value = true
    return
  }
  show(step.value + 1)
}

async function send() {
  const blocked = STEPS.findIndex((_, index) => stepIssue(index, answers.value, today()))
  if (blocked !== -1) {
    show(blocked)
    attempted.value = true
    return
  }
  const source = enquiry.source.value
  const parsed = source && Enquiry.safeParse(toEnquiry(answers.value, source))
  if (!parsed || !parsed.success) {
    state.value = 'failed'
    return
  }
  state.value = 'sending'
  try {
    await $fetch(ENQUIRY_PATH, { baseURL: adamBaseUrl, method: 'POST', body: parsed.data })
    sentTo.value = parsed.data.contact.email
    reset()
    state.value = 'sent'
  }
  catch {
    state.value = 'failed'
  }
}

onMounted(() => {
  fades.value = !prefersReducedMotion()
  enquiry.markAvailable()
})
</script>

<template>
  <dialog ref="dialog" class="modal" aria-labelledby="brief-title" @close="onClose">
    <div
      class="modal-box flex flex-col gap-5 rounded-box border-[1.5px] border-secondary/55 bg-base-200 p-5 max-lg:size-full max-lg:max-h-none max-lg:max-w-none max-lg:rounded-none max-lg:border-0 md:p-8 lg:h-[min(52rem,calc(100svh-5rem))] lg:max-h-none lg:max-w-6xl"
    >
      <div class="flex items-start justify-between gap-4">
        <div>
          <p class="mb-2 eyebrow text-[0.6rem] text-primary">
            Sheet 06 · Your brief
          </p>
          <h2 id="brief-title" class="font-display text-3xl font-bold tracking-tight">
            Start a project
          </h2>
        </div>
        <button type="button" class="btn btn-square btn-ghost btn-sm" aria-label="Close" @click="dialog?.close()">
          <Icon name="solar:close-circle-linear" class="size-5" />
        </button>
      </div>

      <div v-if="state === 'sent'" class="flex flex-1 flex-col items-start gap-6">
        <div role="status" class="alert alert-soft alert-success">
          <Icon name="solar:check-circle-linear" class="size-5 shrink-0" />
          <span>Your brief is in. The reply comes to {{ sentTo }}.</span>
        </div>
        <button type="button" class="btn btn-primary" @click="dialog?.close()">
          Done
        </button>
      </div>

      <form v-else class="flex min-h-0 flex-1 flex-col" novalidate @submit.prevent="last ? send() : next()">
        <fieldset
          :disabled="state === 'sending'"
          class="grid min-h-0 flex-1 gap-5 lg:grid-cols-[minmax(0,1fr)_22rem] lg:grid-rows-[auto_minmax(0,1fr)_auto] lg:gap-x-10"
        >
          <nav aria-label="Brief steps" class="min-w-0">
            <ol class="steps w-full">
              <li
                v-for="(title, index) in STEPS"
                :key="title"
                :class="{ 'step-primary': index <= reached }"
                :data-content="index + 1"
                :aria-current="index === step ? 'step' : undefined"
                class="step text-xs max-md:min-w-0"
              >
                <button
                  v-if="index <= reached && index !== step"
                  type="button"
                  class="link link-hover"
                  @click="show(index)"
                >
                  <span class="max-md:sr-only">{{ title }}</span>
                </button>
                <span v-else class="max-md:sr-only">{{ title }}</span>
              </li>
            </ol>
          </nav>

          <div
            :class="{ 'collapse-open': last }"
            class="collapse rounded-box border border-secondary/30 bg-base-300/40 max-lg:collapse-arrow lg:collapse-open lg:col-start-2 lg:row-span-3 lg:row-start-1 lg:overflow-y-auto lg:contain-size"
          >
            <input v-if="!last" type="checkbox" class="lg:hidden" aria-label="Show your brief so far">
            <p class="collapse-title eyebrow text-[0.6rem] text-secondary">
              Your brief so far
            </p>
            <div class="collapse-content">
              <BriefPreview />
            </div>
          </div>

          <section class="relative min-h-0 overflow-y-auto pr-1" aria-labelledby="brief-step-title">
            <p class="mb-1 eyebrow text-[0.6rem] text-base-content/55">
              Step {{ step + 1 }} of {{ STEPS.length }}
            </p>
            <h3
              id="brief-step-title"
              ref="heading"
              tabindex="-1"
              class="mb-5 font-display text-2xl font-bold tracking-tight"
            >
              {{ STEPS[step] }}
            </h3>
            <div class="grid *:col-start-1 *:row-start-1">
              <Transition
                :css="fades"
                enter-active-class="transition-opacity duration-300 ease-settle"
                enter-from-class="opacity-0"
                leave-active-class="pointer-events-none transition-opacity duration-300 ease-settle"
                leave-to-class="opacity-0"
              >
                <BriefStepScope v-if="step === 0" :issue />
                <BriefStepConnections v-else-if="step === 1" />
                <BriefStepTiming v-else-if="step === 2" :issue :today="today()" />
                <BriefStepProblem v-else-if="step === 3" :issue />
                <BriefStepDone v-else-if="step === 4" />
                <BriefStepDetails v-else :issue />
              </Transition>
            </div>
          </section>

          <div class="flex flex-col gap-3">
            <div v-if="state === 'failed'" role="alert" class="alert alert-soft alert-error">
              <Icon name="solar:danger-triangle-linear" class="size-5 shrink-0" />
              <span>Your brief couldn’t be sent. Your answers are still here.</span>
            </div>
            <div class="flex justify-between gap-3">
              <button v-if="step > 0" type="button" class="btn btn-ghost" @click="show(step - 1)">
                <Icon name="solar:arrow-left-linear" class="size-4" />
                Back
              </button>
              <button type="submit" class="btn ml-auto btn-primary">
                <span v-if="state === 'sending'" class="loading loading-sm loading-spinner" />
                <template v-if="!last">
                  Next
                  <Icon name="solar:arrow-right-linear" class="size-4" />
                </template>
                <template v-else-if="state === 'failed'">
                  Try again
                </template>
                <template v-else>
                  Send brief
                </template>
              </button>
            </div>
          </div>
        </fieldset>
      </form>
    </div>
  </dialog>
</template>
