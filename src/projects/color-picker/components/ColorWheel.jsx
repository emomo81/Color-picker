import { useCallback, useEffect, useMemo, useRef } from 'react'
import { hexToHsv, hsvToHex, wrapHue } from '../lib/color.js'
import { usePointerDrag } from '../hooks/usePointerDrag.js'

/**
 * ColorWheel — an HSV wheel painted to a canvas.
 *
 * Angle = hue, distance from centre = saturation. The `value` (brightness)
 * component is controlled by the slider next to it, and dims the wheel so the
 * canvas always reflects the color you will actually get.
 */

const SIZE = 190 // css pixels — keep in sync with --wheel-size

function paintWheel(canvas, dpr) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const size = SIZE * dpr
  canvas.width = size
  canvas.height = size

  const radius = size / 2
  const image = ctx.createImageData(size, size)
  const { data } = image

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const dx = x - radius
      const dy = y - radius
      const distance = Math.sqrt(dx * dx + dy * dy)
      const index = (y * size + x) * 4

      if (distance > radius) {
        data[index + 3] = 0
        continue
      }

      // hue from the angle, saturation from the radius
      const hue = wrapHue((Math.atan2(dy, dx) * 180) / Math.PI + 90)
      const saturation = Math.min(1, distance / radius)

      // inline HSV(h, s, 1) → RGB for speed
      const h = hue / 60
      const i = Math.floor(h)
      const f = h - i
      const p = 1 - saturation
      const q = 1 - saturation * f
      const t = 1 - saturation * (1 - f)
      let r
      let g
      let b
      switch (i % 6) {
        case 0: r = 1; g = t; b = p; break
        case 1: r = q; g = 1; b = p; break
        case 2: r = p; g = 1; b = t; break
        case 3: r = p; g = q; b = 1; break
        case 4: r = t; g = p; b = 1; break
        default: r = 1; g = p; b = q
      }

      data[index] = r * 255
      data[index + 1] = g * 255
      data[index + 2] = b * 255
      // feather the outer edge for a clean anti-aliased circle
      data[index + 3] = 255 * Math.min(1, (radius - distance) / (1.2 * dpr))
    }
  }

  ctx.putImageData(image, 0, 0)
}

export default function ColorWheel({ color, onChange, onCommit, label = 'Color wheel' }) {
  const canvasRef = useRef(null)
  const hsv = useMemo(() => hexToHsv(color), [color])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = Math.min(2, Math.max(1, window.devicePixelRatio || 1))
    paintWheel(canvas, dpr)
  }, [])

  const handleMove = useCallback(
    ({ x, y }) => {
      // normalise to a -1..1 space centred on the wheel
      const dx = x * 2 - 1
      const dy = y * 2 - 1
      const distance = Math.min(1, Math.sqrt(dx * dx + dy * dy))
      const hue = wrapHue((Math.atan2(dy, dx) * 180) / Math.PI + 90)
      onChange(hsvToHex({ h: hue, s: distance * 100, v: hsv.v }))
    },
    [hsv.v, onChange],
  )

  const { ref, dragging, handlers } = usePointerDrag(handleMove)

  useEffect(() => {
    if (!dragging) return undefined
    return () => onCommit?.()
  }, [dragging, onCommit])

  const handleKeyDown = useCallback(
    (event) => {
      const step = event.shiftKey ? 10 : 2
      let { h, s } = hsv
      switch (event.key) {
        case 'ArrowLeft': h = wrapHue(h - step); break
        case 'ArrowRight': h = wrapHue(h + step); break
        case 'ArrowUp': s = Math.min(100, s + step); break
        case 'ArrowDown': s = Math.max(0, s - step); break
        default: return
      }
      event.preventDefault()
      onChange(hsvToHex({ h, s, v: hsv.v }))
    },
    [hsv, onChange],
  )

  // position the thumb: hue → angle, saturation → radius
  const angle = ((hsv.h - 90) * Math.PI) / 180
  const distance = (hsv.s / 100) * 50
  const thumbX = 50 + Math.cos(angle) * distance
  const thumbY = 50 + Math.sin(angle) * distance

  return (
    <div
      ref={ref}
      className={`wheel${dragging ? ' is-dragging' : ''}`}
      role="application"
      aria-label={`${label}. Arrow keys adjust hue and saturation.`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      {...handlers}
    >
      <canvas
        ref={canvasRef}
        className="wheel__canvas"
        style={{ width: '100%', height: '100%' }}
        aria-hidden="true"
      />
      {/* darkening veil that mirrors the brightness slider */}
      <div
        className="wheel__shade"
        style={{ opacity: 1 - hsv.v / 100 }}
        aria-hidden="true"
      />
      <div className="wheel__ring" aria-hidden="true" />
      <div
        className="wheel__thumb"
        style={{ left: `${thumbX}%`, top: `${thumbY}%`, '--thumb-color': color }}
        aria-hidden="true"
      />
    </div>
  )
}
