import { useMemo, useState } from 'react'
import { CheckIcon, CopyIcon, DownloadIcon } from './icons.jsx'
import { buildScale, formatCssHsl, formatRgb } from '../lib/color.js'
import { themeToCssText } from '../lib/theme.js'

/**
 * ExportPanel — turns the live theme into code the user can actually ship:
 * CSS custom properties, a Tailwind color scale, or JSON design tokens.
 */

const FORMATS = [
  { id: 'css', label: 'CSS' },
  { id: 'tailwind', label: 'Tailwind' },
  { id: 'json', label: 'JSON' },
]

function toTailwind(accent) {
  const scale = buildScale(accent)
  const body = scale.map(({ stop, hex }) => `        ${stop}: '${hex}',`).join('\n')
  return `// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        brand: {
${body}
          DEFAULT: '${accent}',
        },
      },
    },
  },
}`
}

function toJson(theme, accent) {
  const scale = Object.fromEntries(buildScale(accent).map(({ stop, hex }) => [stop, hex]))
  return JSON.stringify(
    {
      name: 'ThemeFlex export',
      mode: theme.mode,
      radius: theme.radius,
      accent: {
        hex: accent,
        rgb: formatRgb(accent),
        hsl: formatCssHsl(accent),
      },
      scale,
      semantic: {
        background: theme.bg,
        surface: theme.surface,
        ink: theme.ink,
        inkMuted: theme.inkMuted,
        border: theme.border,
        success: theme.success,
        danger: theme.danger,
        warning: theme.warning,
      },
    },
    null,
    2,
  )
}

export default function ExportPanel({ theme, accent, onCopy, copied }) {
  const [format, setFormat] = useState('css')

  const code = useMemo(() => {
    if (format === 'tailwind') return toTailwind(accent)
    if (format === 'json') return toJson(theme, accent)
    return themeToCssText(theme)
  }, [format, theme, accent])

  const download = () => {
    const ext = format === 'tailwind' ? 'js' : format
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `themeflex-${accent.replace('#', '').toLowerCase()}.${ext}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <section className="panel export" aria-labelledby="export-heading">
      <header className="panel__head panel__head--tabs">
        <h2 id="export-heading" className="panel__title">
          Export tokens
        </h2>
        <div className="tabs" role="tablist" aria-label="Export format">
          {FORMATS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={format === item.id}
              className={`tab${format === item.id ? ' is-active' : ''}`}
              onClick={() => setFormat(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      <pre className="export__code" tabIndex={0}>
        <code>{code}</code>
      </pre>

      <div className="export__actions">
        <button
          type="button"
          className="btn btn--primary btn--sm"
          onClick={() => onCopy(code, 'export')}
        >
          {copied === 'export' ? <CheckIcon size={15} /> : <CopyIcon size={15} />}
          {copied === 'export' ? 'Copied' : 'Copy code'}
        </button>
        <button type="button" className="btn btn--outline btn--sm" onClick={download}>
          <DownloadIcon size={15} />
          Download
        </button>
      </div>
    </section>
  )
}
