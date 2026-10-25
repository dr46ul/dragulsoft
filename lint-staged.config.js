// Typechecking needs the whole project, so it is a function that ignores the staged file list.
export default {
  '*': 'eslint --fix --no-warn-ignored',
  '*.{ts,vue}': () => 'pnpm typecheck',
}
