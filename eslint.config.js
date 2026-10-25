import antfu from '@antfu/eslint-config'

export default antfu({
  vue: true,
  typescript: true,
  ignores: ['.agents/**'],
  rules: {
    'ts/consistent-type-assertions': [
      'error',
      { assertionStyle: 'never' },
    ],
    'vue/v-bind-style': [
      'error',
      'shorthand',
      { sameNameShorthand: 'always' },
    ],
  },
})
