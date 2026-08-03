/**
 * color.js — dependency-free color science utilities.
 *
 * Everything the app needs to convert, transform, harmonise and audit colors:
 * hex/rgb/hsl/hsv conversion, WCAG 2.1 contrast maths, palette scales and
 * harmony generation.
 */

/* ------------------------------------------------------------------ */
/* small helpers                                                       */
/* ------------------------------------------------------------------ */

export const clamp = (value, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value))

export const round = (value, precision = 0) => {
  const factor = 10 ** precision
  return Math.round(value * factor) / factor
}

/** Wrap a hue into the [0, 360) range. */
export const wrapHue = (hue) => ((hue % 360) + 360) % 360

/* ------------------------------------------------------------------ */
/* parsing + formatting                                                */
/* ------------------------------------------------------------------ */

const HEX_RE = /^#?([a-f\d]{3}|[a-f\d]{4}|[a-f\d]{6}|[a-f\d]{8})$/i

/** Expand `#abc` → `#aabbcc`, normalise casing, strip alpha. */
export function normalizeHex(input) {
  if (typeof input !== 'string') return null
  const match = input.trim().match(HEX_RE)
  if (!match) return null

  let hex = match[1]
  if (hex.length === 3 || hex.length === 4) {
    hex = hex
      .slice(0, 3)
      .split('')
      .map((char) => char + char)
      .join('')
  }
  return `#${hex.slice(0, 6).toUpperCase()}`
}

export function hexToRgb(hex) {
  const normalized = normalizeHex(hex)
  if (!normalized) return { r: 0, g: 0, b: 0 }
  const int = parseInt(normalized.slice(1), 16)
  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255,
  }
}

export function rgbToHex({ r, g, b }) {
  const toHex = (channel) =>
    Math.round(clamp(channel, 0, 255)).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase()
}

/** Accepts `#hex`, `rgb(...)`, `hsl(...)` or a bare hex — returns `#RRGGBB`. */
export function parseColor(input) {
  if (typeof input !== 'string') return null
  const value = input.trim().toLowerCase()

  const hex = normalizeHex(value)
  if (hex) return hex

  const rgbMatch = value.match(
    /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/,
  )
  if (rgbMatch) {
    return rgbToHex({
      r: Number(rgbMatch[1]),
      g: Number(rgbMatch[2]),
      b: Number(rgbMatch[3]),
    })
  }

  const hslMatch = value.match(
    /^hsla?\(\s*([\d.]+)(?:deg)?[\s,]+([\d.]+)%[\s,]+([\d.]+)%/,
  )
  if (hslMatch) {
    return hslToHex({
      h: Number(hslMatch[1]),
      s: Number(hslMatch[2]),
      l: Number(hslMatch[3]),
    })
  }

  return null
}

/* ------------------------------------------------------------------ */
/* RGB <-> HSL                                                          */
/* ------------------------------------------------------------------ */

/** @returns {{h: number, s: number, l: number}} h 0-360, s/l 0-100 */
export function rgbToHsl({ r, g, b }) {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255

  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const delta = max - min
  const l = (max + min) / 2

  let h = 0
  let s = 0

  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min)
    switch (max) {
      case rn:
        h = ((gn - bn) / delta + (gn < bn ? 6 : 0)) * 60
        break
      case gn:
        h = ((bn - rn) / delta + 2) * 60
        break
      default:
        h = ((rn - gn) / delta + 4) * 60
    }
  }

  return { h: wrapHue(h), s: s * 100, l: l * 100 }
}

/** @param {{h: number, s: number, l: number}} hsl h 0-360, s/l 0-100 */
export function hslToRgb({ h, s, l }) {
  const hue = wrapHue(h) / 360
  const sat = clamp(s / 100)
  const light = clamp(l / 100)

  if (sat === 0) {
    const value = light * 255
    return { r: value, g: value, b: value }
  }

  const q = light < 0.5 ? light * (1 + sat) : light + sat - light * sat
  const p = 2 * light - q

  const channel = (t) => {
    let temp = t
    if (temp < 0) temp += 1
    if (temp > 1) temp -= 1
    if (temp < 1 / 6) return p + (q - p) * 6 * temp
    if (temp < 1 / 2) return q
    if (temp < 2 / 3) return p + (q - p) * (2 / 3 - temp) * 6
    return p
  }

  return {
    r: channel(hue + 1 / 3) * 255,
    g: channel(hue) * 255,
    b: channel(hue - 1 / 3) * 255,
  }
}

export const hexToHsl = (hex) => rgbToHsl(hexToRgb(hex))
export const hslToHex = (hsl) => rgbToHex(hslToRgb(hsl))

/* ------------------------------------------------------------------ */
/* RGB <-> HSV  (the color wheel works in HSV space)                    */
/* ------------------------------------------------------------------ */

/** @returns {{h: number, s: number, v: number}} h 0-360, s/v 0-100 */
export function rgbToHsv({ r, g, b }) {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255

  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const delta = max - min

  let h = 0
  if (delta !== 0) {
    switch (max) {
      case rn:
        h = ((gn - bn) / delta + (gn < bn ? 6 : 0)) * 60
        break
      case gn:
        h = ((bn - rn) / delta + 2) * 60
        break
      default:
        h = ((rn - gn) / delta + 4) * 60
    }
  }

  return {
    h: wrapHue(h),
    s: max === 0 ? 0 : (delta / max) * 100,
    v: max * 100,
  }
}

/** @param {{h: number, s: number, v: number}} hsv h 0-360, s/v 0-100 */
export function hsvToRgb({ h, s, v }) {
  const hue = wrapHue(h) / 60
  const sat = clamp(s / 100)
  const val = clamp(v / 100)

  const i = Math.floor(hue)
  const f = hue - i
  const p = val * (1 - sat)
  const q = val * (1 - sat * f)
  const t = val * (1 - sat * (1 - f))

  const table = [
    [val, t, p],
    [q, val, p],
    [p, val, t],
    [p, q, val],
    [t, p, val],
    [val, p, q],
  ]
  const [r, g, b] = table[i % 6]
  return { r: r * 255, g: g * 255, b: b * 255 }
}

export const hexToHsv = (hex) => rgbToHsv(hexToRgb(hex))
export const hsvToHex = (hsv) => rgbToHex(hsvToRgb(hsv))

/* ------------------------------------------------------------------ */
/* WCAG 2.1 contrast                                                    */
/* ------------------------------------------------------------------ */

/** sRGB relative luminance — https://www.w3.org/TR/WCAG21/#dfn-relative-luminance */
export function relativeLuminance(hex) {
  const { r, g, b } = hexToRgb(hex)
  const channel = (value) => {
    const c = value / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

/** Contrast ratio between two colors: 1 → 21. */
export function contrastRatio(foreground, background) {
  const l1 = relativeLuminance(foreground)
  const l2 = relativeLuminance(background)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Grade a contrast ratio against WCAG 2.1.
 * @param {number} ratio
 * @param {'normal'|'large'|'ui'} kind
 */
export function gradeContrast(ratio, kind = 'normal') {
  if (kind === 'ui') {
    return ratio >= 3 ? { label: 'PASSED', level: 'AA', pass: true } : { label: 'FAILED', level: '—', pass: false }
  }
  if (kind === 'large') {
    if (ratio >= 4.5) return { label: 'PASSED', level: 'AAA', pass: true }
    if (ratio >= 3) return { label: 'PASSED', level: 'AA', pass: true }
    return { label: 'FAILED', level: '—', pass: false }
  }
  if (ratio >= 7) return { label: 'PASSED', level: 'AAA', pass: true }
  if (ratio >= 4.5) return { label: 'PASSED', level: 'AA', pass: true }
  return { label: 'FAILED', level: '—', pass: false }
}

/** Pick black or white text for the strongest contrast on `background`. */
export function bestForeground(background, dark = '#101828', light = '#FFFFFF') {
  return contrastRatio(light, background) >= contrastRatio(dark, background)
    ? light
    : dark
}

export const isLight = (hex) => relativeLuminance(hex) > 0.4

/* ------------------------------------------------------------------ */
/* transforms                                                           */
/* ------------------------------------------------------------------ */

/** Linear blend between two hex colors. `amount` 0 → a, 1 → b. */
export function mix(a, b, amount = 0.5) {
  const ca = hexToRgb(a)
  const cb = hexToRgb(b)
  const t = clamp(amount)
  return rgbToHex({
    r: ca.r + (cb.r - ca.r) * t,
    g: ca.g + (cb.g - ca.g) * t,
    b: ca.b + (cb.b - ca.b) * t,
  })
}

export const lighten = (hex, amount = 0.1) => mix(hex, '#FFFFFF', amount)
export const darken = (hex, amount = 0.1) => mix(hex, '#000000', amount)

/** Nudge lightness in HSL space (keeps the hue vivid, unlike a white mix). */
export function adjustLightness(hex, delta) {
  const hsl = hexToHsl(hex)
  return hslToHex({ ...hsl, l: clamp(hsl.l + delta, 0, 100) })
}

export function adjustSaturation(hex, delta) {
  const hsl = hexToHsl(hex)
  return hslToHex({ ...hsl, s: clamp(hsl.s + delta, 0, 100) })
}

export function rotateHue(hex, degrees) {
  const hsl = hexToHsl(hex)
  return hslToHex({ ...hsl, h: wrapHue(hsl.h + degrees) })
}

/** `rgba()` string from a hex + alpha — handy for glows and rings. */
export function withAlpha(hex, alpha = 1) {
  const { r, g, b } = hexToRgb(hex)
  return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${round(clamp(alpha), 3)})`
}

/* ------------------------------------------------------------------ */
/* palettes                                                             */
/* ------------------------------------------------------------------ */

const SCALE_STEPS = [
  { stop: 50, l: 97 },
  { stop: 100, l: 94 },
  { stop: 200, l: 86 },
  { stop: 300, l: 77 },
  { stop: 400, l: 66 },
  { stop: 500, l: 56 },
  { stop: 600, l: 47 },
  { stop: 700, l: 38 },
  { stop: 800, l: 29 },
  { stop: 900, l: 20 },
]

/** Build a 50→900 tonal scale anchored on the source hue/saturation. */
export function buildScale(hex) {
  const { h, s } = hexToHsl(hex)
  return SCALE_STEPS.map(({ stop, l }) => ({
    stop,
    hex: hslToHex({
      h,
      // desaturate the extremes a touch so the ramp feels natural
      s: clamp(s * (l > 90 || l < 25 ? 0.72 : 1), 0, 100),
      l,
    }),
  }))
}

/** Classic color-theory harmonies for the given base color. */
export function buildHarmonies(hex) {
  return [
    { id: 'complement', name: 'Complement', colors: [hex, rotateHue(hex, 180)] },
    {
      id: 'analogous',
      name: 'Analogous',
      colors: [rotateHue(hex, -30), hex, rotateHue(hex, 30)],
    },
    {
      id: 'triadic',
      name: 'Triadic',
      colors: [hex, rotateHue(hex, 120), rotateHue(hex, 240)],
    },
    {
      id: 'split',
      name: 'Split complement',
      colors: [hex, rotateHue(hex, 150), rotateHue(hex, 210)],
    },
    {
      id: 'tetradic',
      name: 'Tetradic',
      colors: [hex, rotateHue(hex, 90), rotateHue(hex, 180), rotateHue(hex, 270)],
    },
    {
      id: 'monochrome',
      name: 'Monochrome',
      colors: [
        adjustLightness(hex, 26),
        adjustLightness(hex, 13),
        hex,
        adjustLightness(hex, -13),
        adjustLightness(hex, -24),
      ],
    },
  ]
}

/** A pleasant random color — avoids muddy, near-black and washed-out results. */
export function randomColor() {
  return hslToHex({
    h: Math.random() * 360,
    s: 58 + Math.random() * 34,
    l: 42 + Math.random() * 22,
  })
}

/* ------------------------------------------------------------------ */
/* display formatting                                                   */
/* ------------------------------------------------------------------ */

export function formatRgb(hex) {
  const { r, g, b } = hexToRgb(hex)
  return `${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}`
}

export function formatHsl(hex) {
  const { h, s, l } = hexToHsl(hex)
  return `${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%`
}

export function formatCssHsl(hex) {
  const { h, s, l } = hexToHsl(hex)
  return `hsl(${Math.round(h)} ${Math.round(s)}% ${Math.round(l)}%)`
}
