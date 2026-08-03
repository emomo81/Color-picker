/**
 * ColorPickerApp — Project 1.
 *
 * A live theme customizer: pick a color on the wheel, watch an entire product
 * UI re-theme itself in real time, and verify the result against WCAG 2.1.
 */

import { useCallback, useEffect, useMemo } from 'react'
import CompareSlider from './components/CompareSlider.jsx'
import ExportPanel from './components/ExportPanel.jsx'
import PickerPanel from './components/PickerPanel.jsx'
import ScalePanel from './components/ScalePanel.jsx'
import ShowcaseCards from './components/ShowcaseCards.jsx'
import SiteHeader from './components/SiteHeader.jsx'
import Toast from './components/Toast.jsx'
import UiPalette from './components/UiPalette.jsx'
import WcagPanel from './components/WcagPanel.jsx'
import { CheckIcon, CopyIcon, ResetIcon, SparkIcon } from './components/icons.jsx'
import { useClipboard } from './hooks/useClipboard.js'
import { useTheme } from './hooks/useTheme.js'
import { formatHsl, formatRgb } from './lib/color.js'
import { themeToCssVars } from './lib/theme.js'
import './styles/color-picker.css'

const FEATURES = [
  {
    title: 'Real component preview',
    text: 'Buttons, switches, inputs and charts re-theme instantly so you judge a color on real UI — not a swatch.',
  },
  {
    title: 'WCAG 2.1 built in',
    text: 'Every pairing is scored against AA and AAA as you drag, with the exact contrast ratio shown.',
  },
  {
    title: 'Ship the tokens',
    text: 'Export CSS variables, a Tailwind scale or JSON design tokens in one click.',
  },
]

export default function ColorPickerApp() {
  const {
    accent,
    draft,
    mode,
    radius,
    recents,
    theme,
    previewTheme,
    baselineTheme,
    isDirty,
    canUndo,
    lastAction,
    setDraftColor,
    applyTheme,
    resetTheme,
    undo,
    toggleMode,
    setRadius,
    flash,
  } = useTheme()

  const { copy, copied } = useClipboard()

  const handleCopy = useCallback(
    async (value, key) => {
      const ok = await copy(value, key)
      if (ok) flash(`Copied ${key === 'export' ? 'code' : value}`)
    },
    [copy, flash],
  )

  /* the page itself is painted with the *applied* theme… */
  const pageVars = useMemo(() => themeToCssVars(theme), [theme])
  /* …while the preview panels follow the draft so dragging feels live */
  const previewVars = useMemo(() => themeToCssVars(previewTheme), [previewTheme])
  const baselineVars = useMemo(() => themeToCssVars(baselineTheme), [baselineTheme])

  /* keyboard shortcuts: ⏎ apply · R reset · D dark mode · Space random */
  useEffect(() => {
    const onKey = (event) => {
      const tag = event.target?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || event.target?.isContentEditable) return
      if (event.metaKey || event.ctrlKey || event.altKey) return

      if (event.key === 'Enter') {
        event.preventDefault()
        applyTheme()
      } else if (event.key.toLowerCase() === 'r') {
        event.preventDefault()
        resetTheme()
      } else if (event.key.toLowerCase() === 'd') {
        event.preventDefault()
        toggleMode()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [applyTheme, resetTheme, toggleMode])

  return (
    <div className="app" style={pageVars} data-mode={mode} id="top">
      {/* soft ambient blobs behind everything */}
      <div className="app__aura" aria-hidden="true">
        <span className="app__blob app__blob--a" />
        <span className="app__blob app__blob--b" />
        <span className="app__blob app__blob--c" />
      </div>

      <SiteHeader
        mode={mode}
        accent={theme.accent}
        onToggleMode={toggleMode}
        onUndo={undo}
        canUndo={canUndo}
      />

      <main>
        {/* ---------------- hero ---------------- */}
        <section className="hero" id="features">
          <div className="shell hero__inner">
            <div className="hero__copy">

              <h1 className="hero__title">
                Modern Preview
                <br />
                <span className="hero__title-accent">Color Picker</span>
              </h1>
              <p className="hero__lead">
                Design an entire product theme from one color. Drag the wheel and every
                button, chart and badge updates instantly — with contrast checked
                against WCAG 2.1 as you go.
              </p>

              <div className="hero__actions">
                <button
                  type="button"
                  className="btn btn--primary"
                  onClick={() => applyTheme()}
                >
                  Apply theme
                </button>
                <button type="button" className="btn btn--soft" onClick={resetTheme}>
                  Reset theme
                  <ResetIcon size={15} />
                </button>
              </div>

              <dl className="hero__facts">
                <div>
                  <dt>Hex</dt>
                  <dd>
                    <button
                      type="button"
                      className="hero__fact-btn"
                      onClick={() => handleCopy(accent, 'hero-hex')}
                    >
                      {accent}
                      {copied === 'hero-hex' ? <CheckIcon size={13} /> : <CopyIcon size={13} />}
                    </button>
                  </dd>
                </div>
                <div>
                  <dt>HSL</dt>
                  <dd>{formatHsl(accent)}</dd>
                </div>
                <div>
                  <dt>RGB</dt>
                  <dd>{formatRgb(accent)}</dd>
                </div>
              </dl>
            </div>

            {/* the live preview stack — mirrors the reference layout */}
            <div className="hero__preview" style={previewVars}>
              <div className="preview-card">
                <header className="preview-card__bar">
                  <span className="preview-card__title">Theme preview</span>
                  <span className="preview-card__dot" aria-hidden="true" />
                </header>
                <div className="preview-card__body">
                  <UiPalette theme={previewTheme} compact />
                  <PickerPanel
                    draft={draft}
                    onDraftChange={setDraftColor}
                    onApply={applyTheme}
                    onReset={resetTheme}
                    isDirty={isDirty}
                    recents={recents}
                    onCopy={handleCopy}
                    copied={copied}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- before / after ---------------- */}
        <section className="section" id="showcase">
          <div className="shell">
            <header className="section__head">
              <h2 className="section__title">See the difference</h2>
              <p className="section__lead">
                Drag the handle to wipe between the untouched neutral baseline and your
                applied theme.
              </p>
            </header>

            <CompareSlider
              before={
                <div className="compare__pane" style={baselineVars}>
                  <ShowcaseCards theme={baselineTheme} />
                </div>
              }
              after={
                <div className="compare__pane" style={pageVars}>
                  <ShowcaseCards theme={theme} />
                </div>
              }
            />
          </div>
        </section>

        {/* ---------------- analysis ---------------- */}
        <section className="section section--muted" id="analysis">
          <div className="shell grid-2">
            <WcagPanel theme={theme} accent={accent} />
            <div className="stack">
              <ScalePanel
                accent={accent}
                onPick={setDraftColor}
                onCopy={handleCopy}
                copied={copied}
              />
              <section className="panel tune" aria-labelledby="tune-heading">
                <header className="panel__head">
                  <h2 id="tune-heading" className="panel__title">
                    Shape
                  </h2>
                  <span className="tune__value">{radius}px</span>
                </header>
                <label className="tune__label" htmlFor="radius-range">
                  Corner radius
                </label>
                <input
                  id="radius-range"
                  type="range"
                  className="range"
                  min="0"
                  max="28"
                  value={radius}
                  onChange={(event) => setRadius(Number(event.target.value))}
                  style={{ '--fill': `${(radius / 28) * 100}%` }}
                />
                <div className="tune__previews" aria-hidden="true">
                  <span className="tune__box" />
                  <span className="tune__box tune__box--fill" />
                  <span className="tune__box tune__box--outline" />
                </div>
              </section>
            </div>
          </div>
        </section>

        {/* ---------------- features ---------------- */}
        <section className="section">
          <div className="shell">
            <div className="features">
              {FEATURES.map((feature, index) => (
                <article className="feature" key={feature.title}>
                  <span className="feature__num">{String(index + 1).padStart(2, '0')}</span>
                  <h3 className="feature__title">{feature.title}</h3>
                  <p className="feature__text">{feature.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- export ---------------- */}
        <section className="section section--muted" id="export">
          <div className="shell grid-2 grid-2--wide">
            <div className="export__intro">
              <h2 className="section__title">Ship it as code</h2>
              <p className="section__lead">
                ThemeFlex generates the full token set — accent states, tinted neutrals,
                surfaces and status colors — ready to paste into your project.
              </p>
              <ul className="export__points">
                <li>CSS custom properties for any framework</li>
                <li>Tailwind 50–900 brand scale</li>
                <li>JSON tokens for design systems</li>
              </ul>
            </div>
            <ExportPanel
              theme={theme}
              accent={accent}
              onCopy={handleCopy}
              copied={copied}
            />
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="shell site-footer__inner">
          <span>
            Theme<b>Flex</b> — Project 1 · React + Vite
          </span>
          <span className="site-footer__hint">
            Shortcuts: <kbd>Enter</kbd> apply · <kbd>R</kbd> reset · <kbd>D</kbd> dark mode
          </span>
        </div>
      </footer>

      <Toast message={lastAction} />
    </div>
  )
}
