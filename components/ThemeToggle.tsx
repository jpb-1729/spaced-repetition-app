'use client'

import { useSyncExternalStore } from 'react'

export type Theme = 'system' | 'light' | 'dark'

const ORDER: Theme[] = ['system', 'light', 'dark']

/**
 * The theme lives in the DOM (`data-theme` on <html>, set by the boot script in
 * app/layout.tsx before first paint) and in localStorage, not in React state.
 * useSyncExternalStore is how a component reads state it does not own: React
 * renders getServerSnapshot() during hydration, so markup matches the server,
 * then immediately re-renders with the real client value. That avoids both a
 * hydration mismatch and a setState-in-effect cascade.
 */

let listeners: Array<() => void> = []

function subscribe(onChange: () => void) {
  listeners.push(onChange)
  // Keep other tabs in sync.
  window.addEventListener('storage', onChange)
  return () => {
    listeners = listeners.filter((l) => l !== onChange)
    window.removeEventListener('storage', onChange)
  }
}

function getSnapshot(): Theme {
  const attr = document.documentElement.dataset.theme
  return attr === 'light' || attr === 'dark' ? attr : 'system'
}

function getServerSnapshot(): Theme {
  return 'system'
}

/** Mirrors the inline boot script in app/layout.tsx. */
function apply(theme: Theme) {
  const root = document.documentElement
  if (theme === 'system') {
    delete root.dataset.theme
    localStorage.removeItem('theme')
  } else {
    root.dataset.theme = theme
    localStorage.setItem('theme', theme)
  }
  listeners.forEach((l) => l())
}

export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  return (
    <button
      type="button"
      onClick={() => apply(ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length])}
      aria-label={`Colour theme: ${theme}. Activate to switch.`}
      className="label text-ink-mute hover:text-vermillion cursor-pointer transition-colors"
    >
      {theme}
    </button>
  )
}
