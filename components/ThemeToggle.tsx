'use client'

import { useSyncExternalStore } from 'react'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '@/hooks/use-theme'
import { Button } from '@/components/ui/button'

const noopSubscribe = () => () => {}

// The theme hook only knows the real (system/stored) preference once
// mounted in the browser — the server always assumes 'light'. Reporting
// "not yet mounted" for the server snapshot keeps the client's first render
// identical to the server's, then swaps to the correct icon right after,
// avoiding a hydration mismatch without setState-in-effect.
function useMounted() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  )
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const mounted = useMounted()
  const isDark = mounted && resolvedTheme === 'dark'

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      aria-label="Toggle theme"
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  )
}
