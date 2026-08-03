import { useEffect, useMemo, useState } from 'react'
import ColorWheel from './ColorWheel.jsx'
import ValueSlider from './ValueSlider.jsx'
import { CheckIcon, CopyIcon, DiceIcon, ResetIcon } from './icons.jsx'
import {
  formatHsl,
  formatRgb,
  normalizeHex,
  parseColor,
  randomColor,
} from '../lib/color.js'
import { PRESETS } from '../lib/theme.js'

/**
 * PickerPanel — the "COLOR PICKER" card: wheel, brightness rail, hex input,
 * preset swatches, recents and the apply/reset actions.
 */
export default function PickerPanel({
  draft,
  onDraftChange,
  onApply,
  onReset,
  isDirty,
  recents,
  onCopy,
  copied,
}) {
  const [input, setInput] = useState(draft)
  const [invalid, setInvalid] = useState(false)

  // keep the text field in sync while dragging the wheel
  useEffect(() => {
    setInput(draft)
    setInvalid(false)
  }, [draft])

  const rgb = useMemo(() => formatRgb(draft), [draft])
  const hsl = useMemo(() => formatHsl(draft), [draft])

  const commitInput = (raw) => {
    const parsed = parseColor(raw)
    if (parsed) {
      onDraftChange(parsed)
      setInvalid(false)
    } else {
      setInvalid(true)
      setInput(draft)
    }
  }

  return (
    <section className="panel picker" aria-labelledby="picker-heading">
      <header className="panel__head">
        <h2 id="picker-heading" className="panel__title">
          Color Picker
        </h2>
        <button
          type="button"
          className="icon-btn"
          onClick={() => onDraftChange(randomColor())}
          title="Random color"
          aria-label="Pick a random color"
        >
          <DiceIcon />
        </button>
      </header>

      <div className="picker__stage">
        <ColorWheel color={draft} onChange={onDraftChange} />
        <ValueSlider color={draft} onChange={onDraftChange} />
      </div>

      <div className="picker__readout">
        <div className="picker__chip-wrap">
          <span className="picker__chip" style={{ background: draft }} aria-hidden="true" />
          {/* the native input gives users the OS eyedropper for free */}
          <input
            type="color"
            className="picker__native"
            value={draft}
            onChange={(event) => onDraftChange(event.target.value)}
            aria-label="Open the system color picker"
            title="Open the system color picker"
          />
        </div>

        <div className="picker__values">
          <span className="picker__label">Current color</span>
          <div className="picker__hex-row">
            <input
              className={`picker__hex${invalid ? ' is-invalid' : ''}`}
              value={input}
              spellCheck="false"
              autoComplete="off"
              aria-label="Hex color value"
              aria-invalid={invalid}
              onChange={(event) => setInput(event.target.value)}
              onBlur={(event) => commitInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  commitInput(event.currentTarget.value)
                  event.currentTarget.blur()
                }
                if (event.key === 'Escape') {
                  setInput(draft)
                  setInvalid(false)
                  event.currentTarget.blur()
                }
              }}
            />
            <button
              type="button"
              className="icon-btn icon-btn--sm"
              onClick={() => onCopy(normalizeHex(input) || draft, 'picker-hex')}
              aria-label="Copy hex value"
              title="Copy hex"
            >
              {copied === 'picker-hex' ? <CheckIcon /> : <CopyIcon />}
            </button>
          </div>
          <p className="picker__meta">
            HSL {hsl}
            <span aria-hidden="true"> · </span>
            RGB {rgb}
          </p>
        </div>
      </div>

      <div className="picker__swatches" role="group" aria-label="Preset colors">
        {PRESETS.map((preset) => (
          <button
            key={preset.hex}
            type="button"
            className={`swatch${draft === preset.hex ? ' is-active' : ''}`}
            style={{ '--swatch': preset.hex }}
            onClick={() => onDraftChange(preset.hex)}
            title={`${preset.name} · ${preset.hex}`}
            aria-label={`${preset.name}, ${preset.hex}`}
            aria-pressed={draft === preset.hex}
          />
        ))}
      </div>

      {recents.length > 0 && (
        <div className="picker__recents">
          <span className="picker__label">Recent</span>
          <div className="picker__swatches" role="group" aria-label="Recently applied colors">
            {recents.map((hex) => (
              <button
                key={hex}
                type="button"
                className={`swatch swatch--sm${draft === hex ? ' is-active' : ''}`}
                style={{ '--swatch': hex }}
                onClick={() => onDraftChange(hex)}
                title={hex}
                aria-label={`Recent color ${hex}`}
              />
            ))}
          </div>
        </div>
      )}

      <div className="picker__actions">
        <button
          type="button"
          className="btn btn--primary btn--block"
          onClick={() => onApply()}
        >
          {isDirty ? 'Apply theme' : 'Theme applied'}
        </button>
        <button type="button" className="btn btn--ghost btn--block" onClick={onReset}>
          Reset theme
          <ResetIcon />
        </button>
      </div>
    </section>
  )
}
