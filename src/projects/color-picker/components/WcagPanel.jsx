import { useMemo } from 'react'
import { contrastRatio, formatHsl, formatRgb, gradeContrast } from '../lib/color.js'

/**
 * WcagPanel — the "WCAG ANALYSIS" table.
 *
 * Audits the pairings that actually matter in the generated theme rather than
 * a single foreground/background combo, so a failing color is easy to spot.
 */

function buildChecks(theme) {
  return [
    {
      id: 'accent-ink',
      name: 'Accent button label',
      hint: 'Button text on the accent fill',
      fg: theme.accentInk,
      bg: theme.accent,
      kind: 'normal',
    },
    {
      id: 'body',
      name: 'Body text',
      hint: 'Primary ink on the page surface',
      fg: theme.ink,
      bg: theme.surface,
      kind: 'normal',
    },
    {
      id: 'muted',
      name: 'Secondary text',
      hint: 'Muted ink on the page surface',
      fg: theme.inkMuted,
      bg: theme.surface,
      kind: 'normal',
    },
    {
      id: 'accent-text',
      name: 'Accent link text',
      hint: 'Accent used as text on the background',
      fg: theme.accentText,
      bg: theme.bg,
      kind: 'normal',
    },
    {
      id: 'soft',
      name: 'Soft badge',
      hint: 'Accent ink on the tinted chip',
      fg: theme.accentSoftInk,
      bg: theme.accentSoft,
      kind: 'normal',
    },
    {
      id: 'border',
      name: 'Focus ring / border',
      hint: 'Non-text UI contrast (needs 3:1)',
      fg: theme.accent,
      bg: theme.surface,
      kind: 'ui',
    },
  ]
}

export default function WcagPanel({ theme, accent }) {
  const checks = useMemo(() => {
    return buildChecks(theme).map((check) => {
      const ratio = contrastRatio(check.fg, check.bg)
      return { ...check, ratio, grade: gradeContrast(ratio, check.kind) }
    })
  }, [theme])

  const passing = checks.filter((c) => c.grade.pass).length
  const allPass = passing === checks.length
  const score = Math.round((passing / checks.length) * 100)

  return (
    <section className="panel wcag" aria-labelledby="wcag-heading">
      <header className="wcag__head">
        <div>
          <h2 id="wcag-heading" className="wcag__title">
            WCAG Analysis
          </h2>
          <p className="wcag__sub">
            {passing} of {checks.length} pairings meet WCAG 2.1 AA
          </p>
        </div>
        <span className={`pill pill--lg ${allPass ? 'pill--pass' : 'pill--warn'}`}>
          {allPass ? 'PASSED' : `${score}%`}
        </span>
      </header>

      <div className="wcag__summary" aria-hidden="true">
        <div className="wcag__meter">
          <span className="wcag__meter-fill" style={{ width: `${score}%` }} />
        </div>
      </div>

      <div className="wcag__rows" role="table" aria-label="Contrast results">
        <div className="wcag__row wcag__row--head" role="row">
          <span role="columnheader">Pairing</span>
          <span role="columnheader" className="wcag__num">
            Ratio
          </span>
          <span role="columnheader" className="wcag__status-col">
            Result
          </span>
        </div>

        {checks.map((check) => (
          <div className="wcag__row" role="row" key={check.id}>
            <div className="wcag__pair" role="cell">
              <span
                className="wcag__demo"
                style={{ background: check.bg, color: check.fg, borderColor: theme.border }}
                aria-hidden="true"
              >
                Aa
              </span>
              <span className="wcag__meta">
                <span className="wcag__name">{check.name}</span>
                <span className="wcag__hint">{check.hint}</span>
              </span>
            </div>
            <span className="wcag__num" role="cell">
              {check.ratio.toFixed(2)}
              <span className="wcag__num-unit">:1</span>
            </span>
            <span className="wcag__status-col" role="cell">
              <span
                className={`pill ${check.grade.pass ? 'pill--pass' : 'pill--fail'}`}
                title={`${check.ratio.toFixed(2)}:1`}
              >
                {check.grade.pass ? `${check.grade.label} ${check.grade.level}` : 'FAILED'}
              </span>
            </span>
          </div>
        ))}
      </div>

      <footer className="wcag__foot">
        <span className="wcag__foot-item">
          <b>HEX</b> {accent}
        </span>
        <span className="wcag__foot-item">
          <b>HSL</b> {formatHsl(accent)}
        </span>
        <span className="wcag__foot-item">
          <b>RGB</b> {formatRgb(accent)}
        </span>
      </footer>
    </section>
  )
}
