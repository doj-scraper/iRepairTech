# Web Design Guidelines Compliance Checklist
## iRepair E-commerce Project

### Accessibility
- [ ] Icon-only buttons have `aria-label`
- [ ] Form controls have `<label>` or `aria-label`
- [ ] Interactive elements have keyboard handlers (`onKeyDown`/`onKeyUp`)
- [ ] Buttons use `<button>`, links use `<a>`/`<Link>` (not `<div onClick>`)
- [ ] Images have `alt` (or `alt=""` if decorative)
- [ ] Decorative icons have `aria-hidden="true"`
- [ ] Async updates (toasts, validation) have `aria-live="polite"`
- [ ] Semantic HTML (`<button>`, `<a>`, `<label>`, `<table>`) used before ARIA
- [ ] Headings hierarchical `<h1>`–`<h6>`; skip link for main content
- [ ] `scroll-margin-top` on heading anchors

### Focus States
- [ ] Interactive elements have visible focus: `focus-visible:ring-*`
- [ ] Never `outline-none` / `outline: none` without focus replacement
- [ ] `:focus-visible` used over `:focus` (avoid focus ring on click)
- [ ] `:focus-within` groups focus for compound controls

### Forms
- [ ] Inputs have `autocomplete` and meaningful `name`
- [ ] Correct `type` (`email`, `tel`, `url`, `number`) and `inputmode`
- [ ] No blocking paste (`onPaste` + `preventDefault`)
- [ ] Labels clickable (`htmlFor` or wrapping control)
- [ ] `spellCheck={false}` on emails, codes, usernames
- [ ] Checkboxes/radios: label + control share single hit target
- [ ] Submit button stays enabled until request starts; spinner during request
- [ ] Errors inline next to fields; focus first error on submit
- [ ] Placeholders end with `…` and show example pattern
- [ ] `autocomplete="off"` on non-auth fields
- [ ] Warn before navigation with unsaved changes

### Animation
- [ ] `prefers-reduced-motion` honored (reduced variant or disabled)
- [ ] Animate `transform`/`opacity` only (compositor-friendly)
- [ ] Never `transition: all`—list properties explicitly
- [ ] Correct `transform-origin`
- [ ] SVG transforms on `<g>` wrapper with `transform-box: fill-box; transform-origin: center`
- [ ] Animations interruptible—respond to user input mid-animation

### Typography
- [ ] `…` not `...`
- [ ] Curly quotes `"` `"` not straight `"`
- [ ] Non-breaking spaces: `10&nbsp;MB`, `⌘&nbsp;K`, brand names
- [ ] Loading states end with `…`: `"Loading…"`, `"Saving…"`
- [ ] `font-variant-numeric: tabular-nums` for number columns
- [ ] `text-wrap: balance` or `text-pretty` on headings

### Content Handling
- [ ] Text containers handle long content: `truncate`, `line-clamp-*`, or `break-words`
- [ ] Flex children need `min-w-0` to allow text truncation
- [ ] Empty states handled—don't render broken UI for empty strings/arrays
- [ ] User-generated content anticipated (short, average, very long)

### Images
- [ ] `<img>` has explicit `width` and `height` (prevents CLS)
- [ ] Below-fold images: `loading="lazy"`
- [ ] Above-fold critical images: `priority` or `fetchpriority="high"`

### Performance
- [ ] Large lists (>50 items): virtualize (`virtua`, `content-visibility: auto`)
- [ ] No layout reads in render (`getBoundingClientRect`, `offsetHeight`, etc.)
- [ ] DOM reads/writes batched; no interleaving
- [ ] Uncontrolled inputs preferred; controlled inputs cheap per keystroke
- [ ] `<link rel="preconnect">` for CDN/asset domains
- [ ] Critical fonts: `<link rel="preload" as="font">` with `font-display: swap`

### Navigation & State
- [ ] URL reflects state—filters, tabs, pagination, expanded panels in query params
- [ ] Links use `<a>`/`<Link>` (Cmd/Ctrl+click, middle-click support)
- [ ] Deep-link all stateful UI (URL sync via nuqs)
- [ ] Destructive actions need confirmation modal or undo window

### Touch & Interaction
- [ ] `touch-action: manipulation` (prevents double-tap zoom delay)
- [ ] `-webkit-tap-highlight-color` set intentionally
- [ ] `overscroll-behavior: contain` in modals/drawers/sheets
- [ ] During drag: disable text selection, `inert` on dragged elements
- [ ] `autoFocus` sparingly—desktop only, single primary input; avoid on mobile

### Safe Areas & Layout
- [ ] Full-bleed layouts need `env(safe-area-inset-*)` for notches
- [ ] `overflow-x-hidden` on containers, fix content overflow
- [ ] Flex/grid over JS measurement for layout

### Dark Mode & Theming
- [ ] `color-scheme: dark` on `<html>` for dark themes
- [ ] `<meta name="theme-color">` matches page background
- [ ] Native `<select>`: explicit `background-color` and `color` (Windows dark mode)

### Locale & i18n
- [ ] Dates/times: `Intl.DateTimeFormat` not hardcoded formats
- [ ] Numbers/currency: `Intl.NumberFormat` not hardcoded formats
- [ ] Language detected via `Accept-Language` / `navigator.languages`
- [ ] Brand names, code tokens: `translate="no"`

### Hydration Safety
- [ ] Inputs with `value` need `onChange` (or `defaultValue` for uncontrolled)
- [ ] Date/time rendering guarded against hydration mismatch
- [ ] `suppressHydrationWarning` only where truly needed

### Anti-patterns (Flag These)
- [ ] `user-scalable=no` or `maximum-scale=1` disabling zoom
- [ ] `onPaste` with `preventDefault`
- [ ] `transition: all`
- [ ] `outline-none` without focus-visible replacement
- [ ] Inline `onClick` navigation without `<a>`
- [ ] `<div>` or `<span>` with click handlers (should be `<button>`)
- [ ] Images without dimensions
- [ ] Large arrays `.map()` without virtualization
- [ ] Form inputs without labels
- [ ] Icon buttons without `aria-label`
- [ ] Hardcoded date/number formats (use `Intl.*`)
- [ ] `autoFocus` without clear justification