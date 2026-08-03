import { CheckIcon, ContrastIcon, SparkIcon } from './icons.jsx'

/**
 * ShowcaseCards — realistic product UI (stat card, pricing card, alerts,
 * avatars, progress) rendered with the live theme. This is the "does my color
 * actually work?" proof section.
 */
export default function ShowcaseCards({ theme }) {
  return (
    <div className="showcase">
      <article className="showcase__card">
        <header className="showcase__card-head">
          <span className="showcase__eyebrow">Monthly revenue</span>
          <span className="pill pill--soft">+12.4%</span>
        </header>
        <p className="showcase__stat">$48,290</p>
        <div className="spark" aria-hidden="true">
          {[38, 52, 44, 66, 58, 78, 71, 92].map((height, index) => (
            <span key={index} className="spark__bar" style={{ height: `${height}%` }} />
          ))}
        </div>
        <p className="showcase__note">Compared to $42,940 last month</p>
      </article>

      <article className="showcase__card showcase__card--pricing">
        <span className="pill pill--solid">Most popular</span>
        <h3 className="showcase__title">Studio</h3>
        <p className="showcase__price">
          $29<span>/mo</span>
        </p>
        <ul className="showcase__list">
          {['Unlimited themes', 'WCAG audit exports', 'Team design tokens'].map((item) => (
            <li key={item}>
              <span className="showcase__tick" aria-hidden="true">
                <CheckIcon size={12} />
              </span>
              {item}
            </li>
          ))}
        </ul>
        <button type="button" className="btn btn--primary btn--block">
          Start free trial
        </button>
      </article>

      <article className="showcase__card showcase__card--stack">
        <div className="alert alert--accent">
          <span className="alert__icon" aria-hidden="true">
            <SparkIcon size={15} />
          </span>
          <div>
            <p className="alert__title">Theme applied</p>
            <p className="alert__text">Every token updated across {theme.mode} mode.</p>
          </div>
        </div>

        <div className="alert alert--success">
          <span className="alert__icon" aria-hidden="true">
            <CheckIcon size={15} />
          </span>
          <div>
            <p className="alert__title">Contrast verified</p>
            <p className="alert__text">Text pairings pass AA at 4.5:1.</p>
          </div>
        </div>

        <div className="showcase__people">
          <div className="avatars" aria-hidden="true">
            {['AK', 'MJ', 'RT', 'YB'].map((initials, index) => (
              <span key={initials} className="avatar" style={{ zIndex: 4 - index }}>
                {initials}
              </span>
            ))}
          </div>
          <span className="showcase__note">14 teammates use this palette</span>
        </div>

        <div className="progress-block">
          <div className="progress-block__row">
            <span className="showcase__eyebrow">
              <ContrastIcon size={13} /> Accessibility score
            </span>
            <b>92%</b>
          </div>
          <div className="progress">
            <span className="progress__fill" style={{ width: '92%' }} />
          </div>
        </div>
      </article>
    </div>
  )
}
