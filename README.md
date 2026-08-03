<!-- # React Projects — shared code base

A single React + Vite code base that hosts a series of projects. Each project
lives in its own folder under `src/projects/` with its own components, hooks,
lib and styles, while sharing the tooling, build pipeline and global reset.

**Project 1 — ThemeFlex Color Picker** is complete and is what renders today.

---

## Quick start

```bash
npm install
npm run dev      # http://localhost:5173
```

Other scripts:

```bash
npm run build    # production build → dist/
npm run preview  # serve the production build
```

---

## Project 1 · ThemeFlex Color Picker

A live theme customizer. Pick a color and an entire product UI re-themes itself
in real time, with WCAG 2.1 contrast checked as you drag.

### Features

- **HSV color wheel** — canvas-rendered wheel (angle = hue, radius =
  saturation) plus a vertical brightness rail. Full pointer-drag support with
  pointer capture, so the drag keeps tracking outside the element, and arrow-key
  control for keyboard users.
- **Draft vs. applied theme** — the picker edits a *draft* color that previews
  live in the right-hand card; **Apply theme** commits it to the whole page.
  That is what makes the Apply / Reset buttons meaningful.
- **Full token generation** — one accent color derives ~35 tokens: accent
  hover/press/soft/border states, a hue-tinted neutral ramp, surfaces, ink
  levels, borders, shadows and status colors. Written to CSS custom properties,
  so re-theming is a single style object swap.
- **WCAG 2.1 analysis** — six real pairings audited (button label, body text,
  secondary text, link text, soft badge, focus ring) with exact contrast ratios
  and AA / AAA grading. Non-text UI is correctly held to the 3:1 threshold.
- **Auto-corrected accent text** — accent colors that would fail as text are
  automatically nudged in lightness until they clear 4.5:1, so the generated
  theme stays readable no matter what you pick.
- **Before / after wipe** — drag the split handle to compare a neutral baseline
  against your theme, exactly like the reference design.
- **Tonal scale + harmonies** — a 50→900 ramp plus complement, analogous,
  triadic, split-complement, tetradic and monochrome sets.
- **Export** — copy or download the theme as CSS custom properties, a Tailwind
  brand scale, or JSON design tokens.
- **Light / dark mode**, adjustable corner radius, recent colors, undo,
  localStorage persistence and toast feedback.

### Keyboard shortcuts

| Key | Action |
| --- | --- |
| `Enter` | Apply the draft color |
| `R` | Reset to the default theme |
| `D` | Toggle dark mode |
| `←` `→` `↑` `↓` | Adjust hue / saturation on the focused wheel |

### Structure

```
src/
├── App.jsx                        project registry + shell
├── main.jsx
├── styles/base.css                shared reset & global primitives
└── projects/color-picker/
    ├── ColorPickerApp.jsx         page composition
    ├── components/
    │   ├── ColorWheel.jsx         canvas HSV wheel
    │   ├── ValueSlider.jsx        vertical brightness rail
    │   ├── PickerPanel.jsx        picker card: wheel, hex, presets, actions
    │   ├── UiPalette.jsx          miniature component kit preview
    │   ├── WcagPanel.jsx          contrast audit table
    │   ├── ScalePanel.jsx         tonal scale + harmonies
    │   ├── ExportPanel.jsx        CSS / Tailwind / JSON output
    │   ├── CompareSlider.jsx      before/after wipe
    │   ├── ShowcaseCards.jsx      realistic themed product UI
    │   ├── SiteHeader.jsx         sticky nav
    │   ├── Toast.jsx
    │   └── icons.jsx              inline SVG icon set
    ├── hooks/
    │   ├── useTheme.js            draft/applied state, history, persistence
    │   ├── useClipboard.js        copy with fallback
    │   └── usePointerDrag.js      pointer-capture drag helper
    ├── lib/
    │   ├── color.js               conversions, WCAG maths, palettes
    │   └── theme.js               accent → design-token generation
    └── styles/color-picker.css
```

### Notes

- **Zero runtime dependencies** beyond React. All color science, contrast
  maths and the wheel rendering are hand-written in `lib/color.js` and
  `ColorWheel.jsx`.
- **Accessible by construction**: semantic roles on the custom controls
  (`role="slider"` with `aria-valuenow`, `role="switch"` with `aria-checked`),
  visible focus rings, full keyboard operation, and
  `prefers-reduced-motion` support.
- The color chip in the picker card also opens the **native OS color picker**,
  which gives you the system eyedropper for free.

### Adding another project

1. Create `src/projects/<name>/` with its own entry component.
2. Register it in the `PROJECTS` array in `src/App.jsx`.

The build, reset and design primitives are already shared. -->
