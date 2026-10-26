import process from 'node:process'
import { setup } from '@nuxt/test-utils/e2e'

// With NUXT_TEST_HOST set, suites drive that running server instead of building one.
export async function setupApp() {
  const host = process.env.NUXT_TEST_HOST
  await setup(host
    ? { host }
    : {
        rootDir: process.cwd(),
      })
}
