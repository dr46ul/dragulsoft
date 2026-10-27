# daisyUI for every component, layout and design

Everything visual in this project is built from daisyUI on Tailwind CSS 4:
components, page layouts, and the designs and prototypes they start from. A
reader who knows daisyUI can read any template here, and a theme change reaches
every screen.

## Components

Reach for the daisyUI component before writing one. A button is `btn
btn-primary`, a card is `card` with `card-body`, a text field is `input`, a
dialog is `modal`.

```vue
<!-- ✅ -->
<button class="btn btn-primary">
  Send
</button>

<!-- ❌ -->
<button class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
  Send
</button>
```

A Vue component that only gives a daisyUI pattern a name and props is fine;
its template is still daisyUI classes.

## Layouts

Page structure uses daisyUI's layout components too: `navbar`, `drawer` for a
sidebar, `footer`, `hero`, `dock`, `join` for grouped controls, `divider`,
`stack`. Tailwind utilities place things around them (`flex`, `grid`, `gap-4`,
`mx-auto max-w-5xl`), but don't rebuild what one of those components already is.

## Colour and theme

Colours come from daisyUI's semantic tokens (`primary`, `secondary`, `accent`,
`base-100`, `base-content`, `error`), never a raw palette value like
`blue-600` or a hex code. Brand colours, radii and fonts belong in a theme in
`app/assets/css/main.css` (`@plugin 'daisyui/theme'`), not in per-component
overrides.

`app/spa-loading-template.html` is the one exception. Nuxt renders it before the
stylesheet loads, so it carries its own copies of the theme colours, and
`test/unit/spa-loading-template.test.ts` fails when they stop matching
`main.css`.

## Designs and prototypes

Mockups, prototypes and design explorations for this project use daisyUI
classes and themes as well, so a design that is approved can move into code
unchanged. When a design skill or tool brings its own styling defaults, daisyUI
takes precedence in this repo. Where a design needs something daisyUI lacks,
build it from Tailwind utilities and semantic tokens, and name what's missing
so it can become a shared component.

## Where it lives

The setup is in `app/assets/css/main.css` (`@import 'tailwindcss'`,
`@plugin 'daisyui'`) and the `@tailwindcss/vite` plugin in `nuxt.config.ts`.
There is no `tailwind.config.js`; Tailwind 4 configures itself in CSS. For
class names and modifiers, read <https://daisyui.com/llms.txt> (written for
agents) or <https://daisyui.com/components/>.

Severity:

- ❌ HIGH — a second component library or CSS framework added alongside
  daisyUI.
- ⚠️ MEDIUM — a hand-rolled component or layout where a daisyUI one exists, or
  a raw palette colour or hex code where a semantic token fits.
