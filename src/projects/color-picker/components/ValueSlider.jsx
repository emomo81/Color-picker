import { useCallback, useMemo } from 'react'
import { hexToHsv, hsvToHex } from '../lib/color.js'
import { usePointerDrag } from '../hooks/usePointerDrag.js'

/**
 * ValueSlider — the vertical brightness rail beside the wheel
 * (the rainbow bar in the reference shot).
 */
export default function ValueSlider({ color, onChange, onCommit }) {
  const hsv = useMemo(() => hexToHsv(color), [color])

  const handleMove = useCallback(
    ({ y }) => {
      const value = (1 - Math.min(1, Math.max(0, y))) * 100
      onChange(hsvToHex({ ...hsv, v: value }))
    },
    [hsv, onChange],
  )

  const { ref, dragging, handlers } = usePointerDrag(handleMove)

  const handleKeyDown = useCallback(
    (event) => {
      const step = event.shiftKey ? 10 : 2
      let v = hsv.v
      if (event.key === 'ArrowUp' || event.key === 'ArrowRight') v += step
      else if (event.key === 'ArrowDown' || event.key === 'ArrowLeft') v -= step
      else if (event.key === 'Home') v = 100
      else if (event.key === 'End') v = 0
      else return
      event.preventDefault()
      onChange(hsvToHex({ ...hsv, v: Math.min(100, Math.max(0, v)) }))
      onCommit?.()
    },
    [hsv, onChange, onCommit],
  )

  const full = hsvToHex({ h: hsv.h, s: hsv.s, v: 100 })

  return (
    <div
      ref={ref}
      className={`vslider${dragging ? ' is-dragging' : ''}`}
      role="slider"
      tabIndex={0}
      aria-label="Brightness"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(hsv.v)}
      aria-valuetext={`${Math.round(hsv.v)}% brightness`}
      onKeyDown={handleKeyDown}
      {...handlers}
    >
      <div
        className="vslider__track"
        style={{ background: `linear-gradient(to top, #000000, ${full})` }}
      />
      <div
        className="vslider__thumb"
        style={{ top: `${100 - hsv.v}%`, '--thumb-color': color }}
        aria-hidden="true"
      />
    </div>
  )
}
