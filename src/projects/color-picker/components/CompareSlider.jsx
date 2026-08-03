import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * CompareSlider — the split "before / after" wipe from the reference image.
 *
 * Renders two copies of the same children (a neutral baseline theme on the
 * left, the live theme on the right) and clips the top layer to the handle
 * position so dragging reveals the themed version.
 */
export default function CompareSlider({ before, after, initial = 50, label = 'Theme comparison' }) {
  const [position, setPosition] = useState(initial)
  const [dragging, setDragging] = useState(false)
  const frameRef = useRef(null)

  const updateFromClientX = useCallback((clientX) => {
    const node = frameRef.current
    if (!node) return
    const rect = node.getBoundingClientRect()
    if (!rect.width) return
    const next = ((clientX - rect.left) / rect.width) * 100
    setPosition(Math.min(100, Math.max(0, next)))
  }, [])

  useEffect(() => {
    if (!dragging) return undefined
    const onMove = (event) => {
      const clientX = event.touches?.[0]?.clientX ?? event.clientX
      if (clientX != null) updateFromClientX(clientX)
    }
    const onUp = () => setDragging(false)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [dragging, updateFromClientX])

  const onKeyDown = (event) => {
    const step = event.shiftKey ? 10 : 3
    if (event.key === 'ArrowLeft') setPosition((p) => Math.max(0, p - step))
    else if (event.key === 'ArrowRight') setPosition((p) => Math.min(100, p + step))
    else if (event.key === 'Home') setPosition(0)
    else if (event.key === 'End') setPosition(100)
    else return
    event.preventDefault()
  }

  return (
    <div
      ref={frameRef}
      className={`compare${dragging ? ' is-dragging' : ''}`}
      onPointerDown={(event) => {
        setDragging(true)
        updateFromClientX(event.clientX)
      }}
    >
      {/* base layer: the themed version */}
      <div className="compare__layer">{after}</div>

      {/* clipped layer: the neutral "before" */}
      <div
        className="compare__layer compare__layer--top"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        aria-hidden="true"
      >
        {before}
      </div>

      <div className="compare__divider" style={{ left: `${position}%` }} aria-hidden="true" />

      <button
        type="button"
        className="compare__handle"
        style={{ left: `${position}%` }}
        role="slider"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(position)}
        aria-valuetext={`${Math.round(position)}% original theme shown`}
        onKeyDown={onKeyDown}
        onPointerDown={(event) => {
          event.stopPropagation()
          setDragging(true)
        }}
      >
        <span className="compare__grip" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 6-5 6 5 6M15 6l5 6-5 6" />
          </svg>
        </span>
      </button>

      <span className="compare__tag compare__tag--left" aria-hidden="true">
        Before
      </span>
      <span className="compare__tag compare__tag--right" aria-hidden="true">
        After
      </span>
    </div>
  )
}
