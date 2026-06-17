import { Input } from '@/components/ui/input'
import { useSearchParams } from '@/hooks/use-search-params'
import { cn } from '@/lib/utils'
import { Search, X } from 'lucide-react'
import * as React from 'react'

const DEFAULT_DEBOUNCE_MS = 300

export type SearchInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'onChange' | 'value'> & {
    /** Controlled value driven by the URL search param. */
    value?: string
    /** How long to wait after the last keystroke before writing to the URL. Defaults to 300ms. */
    debounceMs?: number
}

/**
 * URL-driven search input.
 *
 * The input is controlled by local state so the user sees every keystroke immediately,
 * and a trailing-edge debounce writes the value to the URL after `debounceMs` of
 * inactivity. This keeps the URL as the source of truth (deep-linkable, browser
 * back/forward works) without firing a server request on every character.
 *
 * The clear button bypasses the debounce — clearing is a discrete user action and
 * should reflect in the URL (and the table) immediately.
 */
export function SearchInput({ className, placeholder = 'Search...', value, debounceMs = DEFAULT_DEBOUNCE_MS, ...props }: SearchInputProps) {
    const mergeSearch = useSearchParams()

    // What the user sees in the input — updated on every keystroke.
    const [localValue, setLocalValue] = React.useState(value ?? '')

    // Sync external (URL) changes back into local state. Handles initial mount,
    // browser back/forward, and external resets (e.g. DataTable's "Reset Filters").
    React.useEffect(() => {
        setLocalValue(value ?? '')
    }, [value])

    // Trailing-edge debounce: write the local value to the URL only after the user
    // has stopped typing for `debounceMs`. We compare against the current `value`
    // to avoid a no-op navigation when the local state is already in sync with the URL.
    React.useEffect(() => {
        const id = window.setTimeout(() => {
            if (localValue !== (value ?? '')) {
                mergeSearch({ search: localValue })
            }
        }, debounceMs)
        return () => window.clearTimeout(id)
    }, [localValue, value, debounceMs, mergeSearch])

    const handleClear = () => {
        setLocalValue('')
        mergeSearch({ search: '' })
    }

    return (
        <div className={cn('relative w-full', className)}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/75" />
            <Input
                placeholder={placeholder}
                value={localValue}
                onChange={(e) => setLocalValue(e.target.value)}
                className="px-9 pr-8 bg-white border-slate-200"
                {...props}
            />
            {localValue && (
                <button
                    type="button"
                    onClick={handleClear}
                    aria-label="Clear search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                    <X className="h-3 w-3" />
                </button>
            )}
        </div>
    )
}
