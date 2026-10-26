<script setup lang="ts">
// There is no backend yet: the enquiry is handed to the visitor's own mail app, so nothing is stored or sent from the site.
const { brand } = useAppConfig()
const { open, brief } = useContact()

const dialog = useTemplateRef<HTMLDialogElement>('dialog')
const handedOff = ref(false)
const copy = ref<'idle' | 'copied' | 'failed'>('idle')
const name = ref('')
const company = ref('')
const message = ref('')

watch(open, (isOpen) => {
  if (!isOpen)
    return dialog.value?.close()
  message.value = brief.value
  handedOff.value = false
  copy.value = 'idle'
  dialog.value?.showModal()
})

const signature = computed(() => [name.value, company.value].filter(Boolean).join(', '))
const mailto = computed(() => {
  const subject = company.value
    ? `Project brief · ${company.value}`
    : 'Project brief'
  const body = `${message.value}\n\n${signature.value}`
  return `mailto:${brand.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
})

function send() {
  window.location.href = mailto.value
  handedOff.value = true
}

async function copyBrief() {
  try {
    await navigator.clipboard.writeText(`${message.value}\n\n${signature.value}`)
    copy.value = 'copied'
  }
  catch {
    copy.value = 'failed'
  }
}
</script>

<template>
  <dialog ref="dialog" class="modal" aria-labelledby="contact-title" @close="open = false">
    <div class="modal-box max-w-lg rounded-box border-[1.5px] border-secondary/55 bg-base-200 p-6 md:p-8">
      <p class="mb-3 eyebrow text-[0.6rem] text-primary">
        Sheet 06 · Your brief
      </p>
      <h3 id="contact-title" class="font-display text-3xl font-bold tracking-tight">
        Start a project
      </h3>

      <form v-if="!handedOff" class="mt-4" @submit.prevent="send">
        <p class="text-sm text-pretty text-base-content/70">
          This opens your email app with a draft to {{ brand.email }}. Nothing is sent until you press send there.
        </p>
        <fieldset class="fieldset mt-4 gap-1">
          <label class="label" for="contact-name">Your name</label>
          <input id="contact-name" v-model="name" class="input w-full" required autocomplete="name">
          <label class="label mt-2" for="contact-company">Company <span class="text-base-content/50">(optional)</span></label>
          <input id="contact-company" v-model="company" class="input w-full" autocomplete="organization">
          <label class="label mt-2" for="contact-message">What are you building?</label>
          <textarea id="contact-message" v-model="message" class="textarea h-36 w-full" required placeholder="The problem, who has it, and where you are today." />
        </fieldset>
        <div class="modal-action">
          <button type="button" class="btn btn-ghost" @click="open = false">
            Cancel
          </button>
          <button class="btn btn-primary">
            Open in email app
            <Icon name="solar:letter-linear" class="size-4" />
          </button>
        </div>
      </form>

      <template v-else>
        <div role="status" class="mt-5 alert alert-info alert-soft text-sm">
          <Icon name="solar:letter-opened-linear" class="size-5 shrink-0" />
          <span>Your email app should now have a draft addressed to <a :href="mailto" class="link">{{ brand.email }}</a>. If nothing opened, copy the brief and send it from wherever you write email.</span>
        </div>
        <p v-if="copy === 'failed'" role="alert" class="mt-3 text-sm text-error">
          Copying isn’t allowed here. Select the text in the form and copy it by hand.
        </p>
        <div class="modal-action">
          <button type="button" class="btn btn-outline" @click="copyBrief">
            <Icon :name="copy === 'copied' ? 'solar:check-read-linear' : 'solar:copy-linear'" class="size-4" />
            {{ copy === 'copied' ? 'Copied' : 'Copy brief' }}
          </button>
          <button type="button" class="btn btn-primary" @click="open = false">
            Done
          </button>
        </div>
      </template>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button>Close</button>
    </form>
  </dialog>
</template>
