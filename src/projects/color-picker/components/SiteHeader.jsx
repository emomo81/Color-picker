import { useEffect, useState } from 'react'
import { MoonIcon, SparkIcon, SunIcon, UndoIcon } from './icons.jsx'

const NAV = [
  { id: 'features', label: 'Features' },
  { id: 'showcase', label: 'Showcase' },
  { id: 'analysis', label: 'Analysis' },
  { id: 'export', label: 'Export' },
]

/**
 * SiteHeader — sticky product bar with the brand mark, section nav,
 * light/dark switch and undo.
 */
export default function SiteHeader({ mode, onToggleMode, onUndo, canUndo, accent }) {
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('features')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // highlight the nav item for whichever section is in view
  useEffect(() => {
    const sections = NAV.map((item) => document.getElementById(item.id)).filter(Boolean)
    if (!sections.length) return undefined
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) setActive(visible.target.id)
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.25, 0.5, 1] },
    )
    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  const scrollTo = (id) => (event) => {
    event.preventDefault()
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <header className={`site-header${scrolled ? ' is-scrolled' : ''}`}>
      <div className="shell site-header__inner">
        <a className="brand" href="#top" onClick={scrollTo('top')}>
          <span className="brand__mark" aria-hidden="true">
            <span className="brand__dot" style={{ background: accent }} />
            <span className="brand__dot brand__dot--b" />
            <span className="brand__dot brand__dot--c" />
            <span className="brand__dot brand__dot--d" style={{ background: accent }} />
          </span>
          <span className="brand__name">
            Theme<span className="brand__name-accent">Flex</span>
          </span>
        </a>

        <nav className="site-nav" aria-label="Sections">
          {NAV.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={scrollTo(item.id)}
              className={`site-nav__link${active === item.id ? ' is-active' : ''}`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="site-header__actions">
          <button
            type="button"
            className="icon-btn"
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo last theme"
            aria-label="Undo last applied theme"
          >
            <UndoIcon />
          </button>
          <button
            type="button"
            className="icon-btn"
            onClick={onToggleMode}
            title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-pressed={mode === 'dark'}
          >
            {mode === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>

        </div>
      </div>
    </header>
  )
}
