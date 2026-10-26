import { defineVitestProject } from '@nuxt/test-utils/config'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          include: ['test/unit/**/*.{test,spec}.ts'],
          environment: 'node',
          passWithNoTests: true,
        },
      },
      await defineVitestProject({
        test: {
          name: 'nuxt',
          include: ['test/nuxt/**/*.{test,spec}.ts'],
          environment: 'nuxt',
          // Testing Library only registers its between-test cleanup when `afterEach` is global.
          globals: true,
          // The e2e project's browsers share the runner, so a component test can take well past the 5s default.
          testTimeout: 30_000,
        },
      }),
      {
        test: {
          name: 'e2e',
          include: ['test/e2e/**/*.{test,spec}.ts'],
          environment: 'node',
          // The suite builds the app in its setup hook when no server is running.
          hookTimeout: 120_000,
          testTimeout: 30_000,
        },
      },
    ],
  },
})
