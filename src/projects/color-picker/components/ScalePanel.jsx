import { useMemo, useState } from 'react'
import { CheckIcon, CopyIcon } from './icons.jsx'
import {
  bestForeground,
  buildHarmonies,
  buildScale,
  contrastRatio,
} from '../lib/color.js'

/**
 * ScalePanel — tonal ramp (50→900) plus color-theory harmonies.
 * Every swatch is click-to-copy and shows its contrast against white.
 */
export default function ScalePanel({ accent, onPick, onCopy, copied }) {
  const [tab, setTab] = useState('scale')
  const scale = useMemo(() => buildScale(accent), [accent])
  const harmonies = useMemo(() => buildHarmonies(accent), [accent])

  return (
    <section className="panel scale" aria-labelledby="scale-heading">
      <header className="panel__head panel__head--tabs">
        <h2 id="scale-heading" className="panel__title">
          Palette
        </h2>
        <div className="tabs" role="tablist" aria-label="Palette view">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'scale'}
            className={`tab${tab === 'scale' ? ' is-active' : ''}`}
            onClick={() => setTab('scale')}
          >
            Scale
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'harmony'}
            className={`tab${tab === 'harmony' ? ' is-active' : ''}`}
            onClick={() => setTab('harmony')}
          >
            Harmony
          </button>
        </div>
      </header>

      {tab === 'scale' ? (
        <div className="scale__ramp">
          {scale.map(({ stop, hex }) => {
            const ink = bestForeground(hex)
            return (
              <button
                key={stop}
                type="button"
                className="scale__step"
                style={{ background: hex, color: ink }}
                onClick={() => onCopy(hex, `scale-${stop}`)}
                onDoubleClick={() => onPick(hex)}
                title={`${hex} — click to copy, double-click to apply`}
              >
                <span className="scale__stop">{stop}</span>
                <span className="scale__hex">
                  {copied === `scale-${stop}` ? 'Copied' : hex}
                </span>
              </button>
            )
          })}
        </div>
      ) : (
        <div className="scale__harmonies">
          {harmonies.map((harmony) => (
            <div className="harmony" key={harmony.id}>
              <span className="harmony__name">{harmony.name}</span>
              <div className="harmony__row">
                {harmony.colors.map((hex, index) => (
                  <button
                    key={`${harmony.id}-${hex}-${index}`}
                    type="button"
                    className="harmony__swatch"
                    style={{ background: hex }}
                    onClick={() => onPick(hex)}
                    title={`Apply ${hex}`}
                    aria-label={`${harmony.name} color ${hex}`}
                  >
                    <span
                      className="harmony__ratio"
                      style={{ color: bestForeground(hex) }}
                    >
                      {contrastRatio('#FFFFFF', hex).toFixed(1)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="scale__hint">
        {tab === 'scale'
          ? 'Click a step to copy it · double-click to make it the theme color'
          : 'Click any swatch to load it into the picker'}
        <span className="scale__copy-icon" aria-hidden="true">
          {copied ? <CheckIcon size={13} /> : <CopyIcon size={13} />}
        </span>
      </p>
    </section>
  )
}
