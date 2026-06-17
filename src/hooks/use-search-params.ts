import { useNavigate } from '@tanstack/react-router'
import { useCallback } from 'react'

export function useSearchParams() {
    const navigate = useNavigate()

    return useCallback(
        (updates: Record<string, unknown>, opts?: { replace?: boolean }) => {
            navigate({
                to: '.',
                search: (prev) => ({ ...((prev ?? {}) as Record<string, unknown>), ...updates }),
                replace: opts?.replace ?? true,
            })
        },
        [navigate],
    )
}
