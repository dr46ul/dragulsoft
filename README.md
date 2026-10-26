<div align="center">

# dragulsoft

The website for Dragulsoft, an independent software practice building web apps, websites and AI integrations.

[![CI](https://github.com/dr46ul/dragulsoft/actions/workflows/ci.yml/badge.svg)](https://github.com/dr46ul/dragulsoft/actions/workflows/ci.yml)
[![Security](https://github.com/dr46ul/dragulsoft/actions/workflows/security.yml/badge.svg)](https://github.com/dr46ul/dragulsoft/actions/workflows/security.yml)
![Nuxt 4](https://img.shields.io/badge/Nuxt-4-00DC82?logo=nuxt&logoColor=white)
![daisyUI 5](https://img.shields.io/badge/daisyUI-5-5A0EF8?logo=daisyui&logoColor=white)
![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)

</div>

## Contents

- [Stack](#stack)
- [Getting started](#getting-started)
- [Scripts](#scripts)
- [Project structure](#project-structure)
- [UI](#ui)
- [Contributing](#contributing)
- [Quality and security](#quality-and-security)
- [License](#license)

## Stack

| Layer      | Choice                                                                            |
| ---------- | --------------------------------------------------------------------------------- |
| Framework  | [Nuxt 4](https://nuxt.com) on [Vue 3](https://vuejs.org)                          |
| Language   | [TypeScript 6](https://www.typescriptlang.org), type-checked with `vue-tsc`       |
| UI         | [daisyUI 5](https://daisyui.com) on [Tailwind CSS 4](https://tailwindcss.com)     |
| Linting    | [`@antfu/eslint-config`](https://github.com/antfu/eslint-config)                  |
| Git hooks  | [Husky](https://typicode.github.io/husky/), lint-staged, commitlint               |
| Tooling    | Node.js 26, pnpm 12                                                               |

## Getting started

### Prerequisites

- **Node.js**: the version in [`.nvmrc`](.nvmrc). With nvm or fnm, run `nvm use` or `fnm use` in the repo.
- **pnpm 12**: the exact version is pinned in `packageManager` in [`package.json`](package.json).

### Install and run

```bash
git clone git@github.com:dr46ul/dragulsoft.git
cd dragulsoft
pnpm install
pnpm dev
```

The dev server runs at <http://localhost:3000>. `pnpm install` also generates Nuxt's types and installs the Git hooks.

## Scripts

| Command          | What it does                                    |
| ---------------- | ----------------------------------------------- |
| `pnpm dev`       | Start the dev server with hot reload            |
| `pnpm build`     | Build for production into `.output/`            |
| `pnpm preview`   | Serve the production build locally              |
| `pnpm generate`  | Pre-render the site as static files             |
| `pnpm lint`      | Lint every file                                 |
| `pnpm lint:fix`  | Lint and apply automatic fixes                  |
| `pnpm typecheck` | Type-check the app with `vue-tsc`               |

## Project structure

```text
.
├── app/
│   ├── app.vue              # root component
│   └── assets/css/main.css  # Tailwind and daisyUI entry point, themes
├── public/                  # static files served as-is
├── docs/agents/             # issue tracker, triage labels, domain docs
├── .agents/rules/           # coding rules for people and agents
├── AGENTS.md                # agent entry point (CLAUDE.md links here)
└── nuxt.config.ts
```

## UI

The UI is built with [daisyUI 5](https://daisyui.com/components/) on [Tailwind CSS 4](https://tailwindcss.com/docs). That covers components, page layouts, designs and prototypes.

- **Components and layouts:** use the daisyUI component first (`btn`, `card`, `modal`, `navbar`, `drawer`, `footer`, `hero`), and Tailwind utilities to place things around it.
- **Colour:** use daisyUI's theme colours (`primary`, `base-100`, `base-content`, `error`), never fixed values like `blue-600` or hex codes.
- **Themes:** brand colours, radii and fonts live in a daisyUI theme in [`app/assets/css/main.css`](app/assets/css/main.css). There is no `tailwind.config.js`; Tailwind 4 is configured in CSS.

The full rule is [`.agents/rules/daisyui.md`](.agents/rules/daisyui.md).

## Contributing

1. Branch from `main`.
2. Commit using [Conventional Commits](https://www.conventionalcommits.org) (`feat:`, `fix:`, `chore:`, …). commitlint rejects anything else.
3. Open a pull request against `main`. Issues are tracked in [GitHub Issues](https://github.com/dr46ul/dragulsoft/issues).

The pre-commit hook runs ESLint with autofix on staged files and type-checks the project when a `.ts` or `.vue` file changes.

Coding rules live in [`.agents/rules/`](.agents/rules/) and apply to people and agents alike:

| Rule                                                                   | In short                                                       |
| ---------------------------------------------------------------------- | -------------------------------------------------------------- |
| [`comments.md`](.agents/rules/comments.md)                             | Comments say why, never what                                   |
| [`daisyui.md`](.agents/rules/daisyui.md)                               | daisyUI for every component, layout and design                 |
| [`no-type-assertions.md`](.agents/rules/no-type-assertions.md)         | No `as` assertions: use `satisfies`, or narrow                 |
| [`vue-same-name-shorthand.md`](.agents/rules/vue-same-name-shorthand.md) | Same-name `v-bind` uses the shorthand (`:profile`)           |
| [`human-is-the-only-author.md`](.agents/rules/human-is-the-only-author.md) | No agent attribution in commits, PRs or comments           |

## Quality and security

Every pull request runs:

- **CI:** `lint`, `typecheck` and `build`.
- **Security:** CodeQL analysis, dependency review (fails on high-severity advisories), `pnpm audit` on production dependencies, and a Gitleaks secret scan.

Dependabot opens weekly updates for npm packages and GitHub Actions. pnpm's supply-chain settings, including a no-downgrade trust policy, live in [`pnpm-workspace.yaml`](pnpm-workspace.yaml).

## License

Copyright © 2026 dragulsoft. All rights reserved.

The source is public to read. No license is granted to copy, modify or distribute it.
