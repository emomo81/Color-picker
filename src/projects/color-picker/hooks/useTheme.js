/**
 * useTheme — owns the theme state machine for the color picker.
 *
 * Holds a *draft* color (what the picker is currently showing) separately from
 * the *applied* theme (what the page is painted with), which is what makes the
 * "Apply theme" / "Reset theme" buttons in the reference design meaningful.
 * Also keeps a recents list and undo history, and persists to localStorage.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { normalizeHex } from '../lib/color.js'
import {
  BASELINE_THEME,
  DEFAULT_ACCENT,
  DEFAULT_MODE,
  DEFAULT_RADIUS,
  createTheme,
} from '../lib/theme.js'

const STORAGE_KEY = 'themeflex:v1'
const MAX_RECENTS = 12
const MAX_HISTORY = 30

function readStorage() {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    return null
  }
}

function initialState() {
  const saved = readStorage()
  const accent = normalizeHex(saved?.accent) || DEFAULT_ACCENT
  return {
    accent,
    mode: saved?.mode === 'dark' ? 'dark' : DEFAULT_MODE,
    radius:
      typeof saved?.radius === 'number'
        ? Math.min(28, Math.max(0, saved.radius))
        : DEFAULT_RADIUS,
    recents: Array.isArray(saved?.recents)
      ? saved.recents.map(normalizeHex).filter(Boolean).slice(0, MAX_RECENTS)
      : [],
  }
}

export function useTheme() {
  const [state, setState] = useState(initialState)
  /** the color currently being edited in the picker (not yet applied) */
  const [draft, setDraft] = useState(state.accent)
  const [history, setHistory] = useState([])
  const [lastAction, setLastAction] = useState(null)
  const actionTimer = useRef(null)

  /* ---------------- persistence ---------------- */
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          accent: state.accent,
          mode: state.mode,
          radius: state.radius,
          recents: state.recents,
        }),
      )
    } catch {
      /* storage can be unavailable (private mode) — non-fatal */
    }
  }, [state])

  /* keep <html> in sync so the scrollbar + browser UI match the theme */
  useEffect(() => {
    if (typeof document === 'undefined') return
    document.documentElement.dataset.mode = state.mode
    document.documentElement.style.colorScheme = state.mode
  }, [state.mode])

  useEffect(() => () => clearTimeout(actionTimer.current), [])

  /* ---------------- derived themes ---------------- */
  const theme = useMemo(
    () => createTheme({ accent: state.accent, mode: state.mode, radius: state.radius }),
    [state.accent, state.mode, state.radius],
  )

  /** live preview theme — follows the draft color as the user drags */
  const previewTheme = useMemo(
    () => createTheme({ accent: draft, mode: state.mode, radius: state.radius }),
    [draft, state.mode, state.radius],
  )

  /** the untouched "before" theme used by the split comparison */
  const baselineTheme = useMemo(
    () => createTheme({ ...BASELINE_THEME, mode: state.mode, radius: state.radius }),
    [state.mode, state.radius],
  )

  const isDirty = normalizeHex(draft) !== state.accent
  const isDefault =
    state.accent === DEFAULT_ACCENT &&
    state.mode === DEFAULT_MODE &&
    state.radius === DEFAULT_RADIUS

  /* ---------------- actions ---------------- */
  const flash = useCallback((message) => {
    setLastAction(message)
    clearTimeout(actionTimer.current)
    actionTimer.current = setTimeout(() => setLastAction(null), 2200)
  }, [])

  const setDraftColor = useCallback((next) => {
    const hex = normalizeHex(next)
    if (hex) setDraft(hex)
  }, [])

  const applyTheme = useCallback(
    (colorOverride) => {
      const hex = normalizeHex(colorOverride ?? draft)
      if (!hex) return
      setState((prev) => {
        if (prev.accent === hex) return prev
        setHistory((h) => [prev.accent, ...h].slice(0, MAX_HISTORY))
        return {
          ...prev,
          accent: hex,
          recents: [hex, ...prev.recents.filter((c) => c !== hex)].slice(0, MAX_RECENTS),
        }
      })
      setDraft(hex)
      flash(`Applied ${hex}`)
    },
    [draft, flash],
  )

  const resetTheme = useCallback(() => {
    setState((prev) => {
      if (prev.accent !== DEFAULT_ACCENT) {
        setHistory((h) => [prev.accent, ...h].slice(0, MAX_HISTORY))
      }
      return {
        ...prev,
        accent: DEFAULT_ACCENT,
        mode: DEFAULT_MODE,
        radius: DEFAULT_RADIUS,
      }
    })
    setDraft(DEFAULT_ACCENT)
    flash('Theme reset to default')
  }, [flash])

  const undo = useCallback(() => {
    setHistory((h) => {
      if (!h.length) return h
      const [previous, ...rest] = h
      setState((prev) => ({ ...prev, accent: previous }))
      setDraft(previous)
      flash(`Reverted to ${previous}`)
      return rest
    })
  }, [flash])

  const toggleMode = useCallback(() => {
    setState((prev) => ({ ...prev, mode: prev.mode === 'dark' ? 'light' : 'dark' }))
  }, [])

  const setRadius = useCallback((radius) => {
    setState((prev) => ({ ...prev, radius: Math.min(28, Math.max(0, Math.round(radius))) }))
  }, [])

  const clearRecents = useCallback(() => {
    setState((prev) => ({ ...prev, recents: [] }))
  }, [])

  return {
    /* state */
    accent: state.accent,
    draft,
    mode: state.mode,
    radius: state.radius,
    recents: state.recents,
    /* themes */
    theme,
    previewTheme,
    baselineTheme,
    /* flags */
    isDirty,
    isDefault,
    canUndo: history.length > 0,
    lastAction,
    /* actions */
    setDraftColor,
    applyTheme,
    resetTheme,
    undo,
    toggleMode,
    setRadius,
    clearRecents,
    flash,
  }
}
