import antfu from '@antfu/eslint-config'
import vueWrapLongElements from './eslint/vue-wrap-long-elements.js'

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
    // Bindings before static attributes, so a long class list closes the tag instead of burying them.
    'vue/attributes-order': [
      'error',
      {
        order: [
          'DEFINITION',
          'LIST_RENDERING',
          'CONDITIONALS',
          'RENDER_MODIFIERS',
          'GLOBAL',
          ['UNIQUE', 'SLOT'],
          'TWO_WAY_BINDING',
          'OTHER_DIRECTIVES',
          'ATTR_DYNAMIC',
          ['ATTR_STATIC', 'ATTR_SHORTHAND_BOOL'],
          'EVENTS',
          'CONTENT',
        ],
      },
    ],
    // Line length decides when a tag wraps (local/vue-wrap-long-elements); once wrapped, one attribute per line.
    'vue/max-attributes-per-line': [
      'error',
      { singleline: Number.POSITIVE_INFINITY, multiline: 1 },
    ],
  },
}, {
  files: ['**/*.vue'],
  plugins: {
    local: {
      rules: { 'vue-wrap-long-elements': vueWrapLongElements },
    },
  },
  rules: {
    'local/vue-wrap-long-elements': [
      'error',
      { maxLength: 120 },
    ],
  },
})
