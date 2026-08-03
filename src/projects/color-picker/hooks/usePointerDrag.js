import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * usePointerDrag — pointer-events drag handling for custom controls
 * (the color wheel and the vertical sliders).
 *
 * Reports normalised coordinates relative to the element's bounding box and
 * keeps tracking even when the pointer leaves the element, which is what makes
 * the wheel feel like a native control.
 *
 * @param {(point: {x: number, y: number, rect: DOMRect, event: PointerEvent}) => void} onMove
 */
export function usePointerDrag(onMove) {
  const ref = useRef(null)
  const [dragging, setDragging] = useState(false)
  const activePointer = useRef(null)
  const callback = useRef(onMove)

  useEffect(() => {
    callback.current = onMove
  }, [onMove])

  const emit = useCallback((event) => {
    const node = ref.current
    if (!node) return
    const rect = node.getBoundingClientRect()
    if (!rect.width || !rect.height) return
    callback.current?.({
      x: (event.clientX - rect.left) / rect.width,
      y: (event.clientY - rect.top) / rect.height,
      rect,
      event,
    })
  }, [])

  const handlePointerDown = useCallback(
    (event) => {
      // primary button / touch / pen only
      if (event.button != null && event.button !== 0) return
      const node = ref.current
      if (!node) return
      activePointer.current = event.pointerId
      try {
        node.setPointerCapture(event.pointerId)
      } catch {
        /* capture is best-effort */
      }
      setDragging(true)
      emit(event)
      event.preventDefault()
    },
    [emit],
  )

  const handlePointerMove = useCallback(
    (event) => {
      if (!dragging || event.pointerId !== activePointer.current) return
      emit(event)
      event.preventDefault()
    },
    [dragging, emit],
  )

  const stop = useCallback((event) => {
    if (event && event.pointerId !== activePointer.current) return
    const node = ref.current
    if (node && event) {
      try {
        if (node.hasPointerCapture?.(event.pointerId)) {
          node.releasePointerCapture(event.pointerId)
        }
      } catch {
        /* ignore */
      }
    }
    activePointer.current = null
    setDragging(false)
  }, [])

  return {
    ref,
    dragging,
    handlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: stop,
      onPointerCancel: stop,
    },
  }
}
