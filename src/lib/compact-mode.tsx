import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

/**
 * Compact mode ("owner oversight" view).
 *
 * When enabled, the sidebar is reduced to the essential monitoring modules
 * (driven by the `compact` flag in `src/lib/module.ts`). The preference is
 * persisted in localStorage so it survives page reloads.
 */

export const COMPACT_MODE_STORAGE_KEY = 'app-compact-mode'

function readStoredValue(): boolean {
    if (typeof window === 'undefined') return false
    return window.localStorage.getItem(COMPACT_MODE_STORAGE_KEY) === '1'
}

interface CompactModeContextValue {
    compactMode: boolean
    setCompactMode: (value: boolean) => void
}

const CompactModeContext = createContext<CompactModeContextValue | null>(null)

export function CompactModeProvider({ children }: { children: ReactNode }) {
    const [compactMode, setCompactModeState] = useState<boolean>(readStoredValue)

    const setCompactMode = useCallback((value: boolean) => {
        setCompactModeState(value)
        try {
            window.localStorage.setItem(COMPACT_MODE_STORAGE_KEY, value ? '1' : '0')
        } catch {
            // localStorage can be unavailable (private mode / quota) — the in-memory preference still applies.
        }
    }, [])

    const value = useMemo(() => ({ compactMode, setCompactMode }), [compactMode, setCompactMode])

    return <CompactModeContext.Provider value={value}>{children}</CompactModeContext.Provider>
}

export function useCompactMode(): CompactModeContextValue {
    const context = useContext(CompactModeContext)
    if (!context) {
        throw new Error('useCompactMode must be used within a CompactModeProvider')
    }
    return context
}
