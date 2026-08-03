import { useState } from 'react'
import { SettingsIcon } from './icons.jsx'
import { contrastRatio, gradeContrast } from '../lib/color.js'

/**
 * UiPalette — the "UI PALETTE" card from the reference: a miniature component
 * kit (buttons, toggles, slider, input, chips) rendered with the live theme so
 * you can judge a color on real UI instead of a swatch.
 */
export default function UiPalette({ theme, compact = false }) {
  const [toggles, setToggles] = useState([true, false])
  const [switches, setSwitches] = useState([true, true])
  const [slider, setSlider] = useState(62)

  const ratio = contrastRatio(theme.accentInk, theme.accent)
  const grade = gradeContrast(ratio, 'normal')

  return (
    <section className={`panel palette${compact ? ' palette--compact' : ''}`} aria-labelledby="palette-heading">
      <header className="panel__head">
        <h2 id="palette-heading" className="panel__title">
          UI Palette
        </h2>
        <span className={`pill ${grade.pass ? 'pill--pass' : 'pill--fail'}`}>
          {grade.pass ? `WCAG ${grade.level}` : 'LOW CONTRAST'}
        </span>
      </header>

      <div className="palette__row">
        <button type="button" className="btn btn--primary btn--sm">
          Primary button
        </button>
        <div className="palette__row-end">
          <span className="palette__aa" aria-hidden="true">
            Aa
          </span>
          <span className="palette__aa palette__aa--sm" aria-hidden="true">
            Aa
          </span>
          <span className="palette__gear" aria-hidden="true">
            <SettingsIcon size={13} />
          </span>
        </div>
      </div>

      <div className="palette__row">
        <button type="button" className="btn btn--outline btn--sm">
          Secondary button
        </button>
        <div className="palette__row-end">
          {toggles.map((on, index) => (
            <button
              key={index}
              type="button"
              role="switch"
              aria-checked={on}
              aria-label={`Preview toggle ${index + 1}`}
              className={`toggle${on ? ' is-on' : ''}`}
              onClick={() =>
                setToggles((prev) => prev.map((v, i) => (i === index ? !v : v)))
              }
            >
              <span className="toggle__dot" />
            </button>
          ))}
        </div>
      </div>

      <div className="palette__grid">
        <div className="palette__cell">
          <span className="palette__label">Slider</span>
          <input
            type="range"
            className="range"
            min="0"
            max="100"
            value={slider}
            aria-label="Preview slider"
            onChange={(event) => setSlider(Number(event.target.value))}
            style={{ '--fill': `${slider}%` }}
          />
        </div>
        <div className="palette__cell">
          <span className="palette__label">Switch</span>
          <div className="palette__row-end palette__row-end--start">
            {switches.map((on, index) => (
              <button
                key={index}
                type="button"
                role="switch"
                aria-checked={on}
                aria-label={`Preview switch ${index + 1}`}
                className={`toggle${on ? ' is-on' : ''}`}
                onClick={() =>
                  setSwitches((prev) => prev.map((v, i) => (i === index ? !v : v)))
                }
              >
                <span className="toggle__dot" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="palette__grid">
        <div className="palette__cell">
          <span className="palette__label">Text input</span>
          <input
            className="field"
            defaultValue="Text input"
            aria-label="Preview text input"
          />
        </div>
        <div className="palette__cell">
          <span className="palette__label">Text contrast</span>
          <div className="palette__chips">
            <span className="chip chip--solid">Chip</span>
            <span className="chip chip--soft">Chip</span>
          </div>
        </div>
      </div>
    </section>
  )
}
