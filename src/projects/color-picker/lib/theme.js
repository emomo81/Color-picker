/**
 * theme.js — turns a single accent color into a complete, accessible
 * design-token set that can be poured straight into CSS custom properties.
 */

import {
  adjustLightness,
  adjustSaturation,
  bestForeground,
  clamp,
  contrastRatio,
  darken,
  hexToHsl,
  hslToHex,
  mix,
  rotateHue,
  withAlpha,
} from './color.js'

/** Colors that ship with the app — the "quick start" swatch row. */
export const PRESETS = [
  { name: 'Amber',     hex: '#F6C341' },
  { name: 'Tangerine', hex: '#F97316' },
  { name: 'Rose',      hex: '#F43F5E' },
  { name: 'Violet',    hex: '#7C5CFF' },
  { name: 'Indigo',    hex: '#4F46E5' },
  { name: 'Azure',     hex: '#0EA5E9' },
  { name: 'Teal',      hex: '#14B8A6' },
  { name: 'Emerald',   hex: '#10B981' },
  { name: 'Lime',      hex: '#84CC16' },
  { name: 'Slate',     hex: '#64748B' },
]

export const DEFAULT_ACCENT = '#F6C341'
export const DEFAULT_MODE = 'light'
export const DEFAULT_RADIUS = 14

/** The "before" palette used by the comparison layer. */
export const BASELINE_THEME = {
  accent: '#8E95A3',
  mode: 'light',
  radius: 14,
}

/**
 * Nudge an accent until it clears `target` contrast against `on`,
 * so that accent-colored *text* stays readable no matter what the user picks.
 */
function ensureContrast(hex, on, target = 4.5, maxSteps = 60) {
  let candidate = hex
  const goDarker = contrastRatio('#000000', on) > contrastRatio('#FFFFFF', on)
  for (let i = 0; i < maxSteps; i += 1) {
    if (contrastRatio(candidate, on) >= target) break
    candidate = adjustLightness(candidate, goDarker ? -2 : 2)
  }
  return candidate
}

/**
 * Derive every token the UI needs from an accent color + mode.
 * @param {{accent: string, mode: 'light'|'dark', radius: number}} options
 */
export function createTheme({
  accent = DEFAULT_ACCENT,
  mode = DEFAULT_MODE,
  radius = DEFAULT_RADIUS,
} = {}) {
  const dark = mode === 'dark'
  const { h, s } = hexToHsl(accent)

  // A hue-tinted neutral ramp keeps the whole page feeling "themed"
  // instead of an accent color floating on grey.
  const neutral = (lightness, saturation = 12) =>
    hslToHex({ h, s: clamp(Math.min(s, saturation), 0, 100), l: lightness })

  const accentInk = bestForeground(accent)
  const accentHover = dark ? adjustLightness(accent, 6) : darken(accent, 0.1)
  const accentPress = dark ? adjustLightness(accent, -4) : darken(accent, 0.18)

  const surface = dark ? neutral(13, 16) : '#FFFFFF'
  const bg = dark ? neutral(8, 18) : neutral(97, 30)
  const ink = dark ? neutral(96, 14) : neutral(13, 24)

  return {
    /* identity */
    accent,
    mode,
    radius,

    /* accent family */
    accentHover,
    accentPress,
    accentInk,
    accentSoft: dark ? mix(accent, surface, 0.82) : mix(accent, '#FFFFFF', 0.86),
    accentSoftInk: ensureContrast(
      accent,
      dark ? mix(accent, surface, 0.82) : mix(accent, '#FFFFFF', 0.86),
      4.5,
    ),
    accentBorder: dark ? mix(accent, surface, 0.62) : mix(accent, '#FFFFFF', 0.66),
    accentQuiet: withAlpha(accent, dark ? 0.16 : 0.12),
    accentRing: withAlpha(accent, dark ? 0.45 : 0.32),
    accentGlow: withAlpha(accent, dark ? 0.3 : 0.22),
    /** accent that is safe to use as text on the page background */
    accentText: ensureContrast(accent, bg, 4.5),

    /* surfaces */
    bg,
    bgMuted: dark ? neutral(11, 18) : neutral(94, 26),
    surface,
    surfaceMuted: dark ? neutral(17, 14) : neutral(98, 22),
    surfaceRaised: dark ? neutral(20, 14) : '#FFFFFF',

    /* ink */
    ink,
    inkMuted: dark ? neutral(72, 10) : neutral(38, 14),
    inkSubtle: dark ? neutral(56, 8) : neutral(52, 10),
    inkFaint: dark ? neutral(42, 8) : neutral(68, 8),

    /* lines + shadows */
    border: dark ? neutral(26, 12) : neutral(89, 16),
    borderStrong: dark ? neutral(34, 12) : neutral(82, 16),
    shadowSm: dark
      ? '0 1px 2px rgba(0, 0, 0, 0.5)'
      : '0 1px 2px rgba(16, 24, 40, 0.06)',
    shadowMd: dark
      ? '0 12px 28px -12px rgba(0, 0, 0, 0.7)'
      : '0 12px 28px -14px rgba(16, 24, 40, 0.18)',
    shadowLg: dark
      ? '0 32px 70px -28px rgba(0, 0, 0, 0.8)'
      : '0 32px 70px -30px rgba(16, 24, 40, 0.28)',

    /* hero wash — the gradient block from the reference */
    heroFrom: dark ? mix(accent, bg, 0.78) : mix(accent, '#FFFFFF', 0.14),
    heroTo: dark ? mix(rotateHue(accent, -12), bg, 0.9) : mix(rotateHue(accent, -14), '#FFFFFF', 0.3),

    /* status */
    success: dark ? '#3DDC97' : '#0E9F6E',
    successSoft: dark ? 'rgba(61, 220, 151, 0.16)' : '#E3F7EF',
    danger: dark ? '#FF6B6B' : '#D92D20',
    dangerSoft: dark ? 'rgba(255, 107, 107, 0.16)' : '#FEECEB',
    warning: dark ? '#FFC65C' : '#B54708',
    warningSoft: dark ? 'rgba(255, 198, 92, 0.16)' : '#FEF4E6',

    /* decorative */
    wheelShadow: withAlpha(adjustSaturation(accent, 10), dark ? 0.42 : 0.3),
  }
}

const CSS_VAR_NAMES = {
  accent: '--accent',
  accentHover: '--accent-hover',
  accentPress: '--accent-press',
  accentInk: '--accent-ink',
  accentSoft: '--accent-soft',
  accentSoftInk: '--accent-soft-ink',
  accentBorder: '--accent-border',
  accentQuiet: '--accent-quiet',
  accentRing: '--accent-ring',
  accentGlow: '--accent-glow',
  accentText: '--accent-text',
  bg: '--bg',
  bgMuted: '--bg-muted',
  surface: '--surface',
  surfaceMuted: '--surface-muted',
  surfaceRaised: '--surface-raised',
  ink: '--ink',
  inkMuted: '--ink-muted',
  inkSubtle: '--ink-subtle',
  inkFaint: '--ink-faint',
  border: '--border',
  borderStrong: '--border-strong',
  shadowSm: '--shadow-sm',
  shadowMd: '--shadow-md',
  shadowLg: '--shadow-lg',
  heroFrom: '--hero-from',
  heroTo: '--hero-to',
  success: '--success',
  successSoft: '--success-soft',
  danger: '--danger',
  dangerSoft: '--danger-soft',
  warning: '--warning',
  warningSoft: '--warning-soft',
  wheelShadow: '--wheel-shadow',
}

/** Convert a theme object into a React `style` object of CSS variables. */
export function themeToCssVars(theme) {
  const vars = {}
  for (const [key, name] of Object.entries(CSS_VAR_NAMES)) {
    if (theme[key] != null) vars[name] = theme[key]
  }
  vars['--radius'] = `${theme.radius}px`
  vars['--radius-sm'] = `${Math.max(4, theme.radius - 6)}px`
  vars['--radius-lg'] = `${theme.radius + 8}px`
  vars['--radius-pill'] = '999px'
  vars.colorScheme = theme.mode === 'dark' ? 'dark' : 'light'
  return vars
}

/** Export the current theme as copy-pasteable CSS. */
export function themeToCssText(theme) {
  const lines = Object.entries(CSS_VAR_NAMES)
    .filter(([key]) => theme[key] != null)
    .map(([key, name]) => `  ${name}: ${theme[key]};`)
  lines.push(`  --radius: ${theme.radius}px;`)
  return `:root {\n  color-scheme: ${theme.mode};\n${lines.join('\n')}\n}`
}
