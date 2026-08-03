import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * useClipboard — copy text with a transient "copied" flag, plus a
 * `document.execCommand` fallback for non-secure contexts.
 */
export function useClipboard(timeout = 1400) {
  const [copied, setCopied] = useState(null)
  const timer = useRef(null)

  useEffect(() => () => clearTimeout(timer.current), [])

  const copy = useCallback(
    async (text, key = text) => {
      const value = String(text)
      let ok = false

      try {
        if (navigator?.clipboard?.writeText) {
          await navigator.clipboard.writeText(value)
          ok = true
        }
      } catch {
        ok = false
      }

      if (!ok && typeof document !== 'undefined') {
        try {
          const el = document.createElement('textarea')
          el.value = value
          el.setAttribute('readonly', '')
          el.style.position = 'fixed'
          el.style.opacity = '0'
          document.body.appendChild(el)
          el.select()
          ok = document.execCommand('copy')
          document.body.removeChild(el)
        } catch {
          ok = false
        }
      }

      if (ok) {
        setCopied(key)
        clearTimeout(timer.current)
        timer.current = setTimeout(() => setCopied(null), timeout)
      }
      return ok
    },
    [timeout],
  )

  return { copy, copied }
}
