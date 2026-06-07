import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { cn } from '@/lib/utils'
import { Check, ChevronDown, Search, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useFieldContext } from './form-context'

type FormSearchableSelectProps = {
    label: string
    options: { label: string; value: string }[]
    placeholder?: string
    searchPlaceholder?: string
    disabled?: boolean
}

export function FormSearchableSelect({
    label,
    options,
    placeholder = 'Select an option',
    searchPlaceholder = 'Search...',
    disabled,
}: FormSearchableSelectProps) {
    const field = useFieldContext<string>()
    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState('')
    const containerRef = useRef<HTMLDivElement>(null)
    const searchRef = useRef<HTMLInputElement>(null)

    const selectedOption = options.find((o) => o.value === field.state.value)

    const filtered = search.trim()
        ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
        : options

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false)
                setSearch('')
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    // Focus search input when opened
    useEffect(() => {
        if (open) {
            setTimeout(() => searchRef.current?.focus(), 10)
        }
    }, [open])

    const handleSelect = (value: string) => {
        field.handleChange(value)
        field.handleBlur()
        setOpen(false)
        setSearch('')
    }

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation()
        field.handleChange('')
        field.handleBlur()
        setSearch('')
    }

    return (
        <Field data-invalid={isInvalid}>
            <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
            <div ref={containerRef} className="relative w-full">
                {/* Trigger button */}
                <button
                    id={field.name}
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                        if (!disabled) setOpen((prev) => !prev)
                    }}
                    onBlur={() => {
                        // Only mark as touched if dropdown is closing
                        if (!open) field.handleBlur()
                    }}
                    className={cn(
                        'flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background',
                        'hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                        'transition-colors duration-150',
                        disabled && 'cursor-not-allowed opacity-50',
                        isInvalid && 'border-destructive focus:ring-destructive',
                        open && 'ring-2 ring-ring ring-offset-2 border-primary/50',
                    )}
                >
                    <span className={cn('truncate', !selectedOption && 'text-muted-foreground')}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                    <span className="flex items-center gap-1 shrink-0 ml-2">
                        {selectedOption && (
                            <span
                                role="button"
                                tabIndex={-1}
                                onClick={handleClear}
                                className="rounded-full p-0.5 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <X className="h-3 w-3" />
                            </span>
                        )}
                        <ChevronDown
                            className={cn('h-4 w-4 text-muted-foreground transition-transform duration-200', open && 'rotate-180')}
                        />
                    </span>
                </button>

                {/* Dropdown panel */}
                {open && (
                    <div
                        className={cn(
                            'absolute z-50 mt-1 w-full rounded-md border border-border bg-popover shadow-lg',
                            'animate-in fade-in-0 zoom-in-95 duration-100',
                        )}
                    >
                        {/* Search input */}
                        <div className="flex items-center gap-2 border-b border-border px-3 py-2">
                            <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                            <input
                                ref={searchRef}
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={searchPlaceholder}
                                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                            />
                            {search && (
                                <button type="button" onClick={() => setSearch('')} className="text-muted-foreground hover:text-foreground">
                                    <X className="h-3 w-3" />
                                </button>
                            )}
                        </div>

                        {/* Options list */}
                        <div className="max-h-52 overflow-y-auto py-1">
                            {filtered.length === 0 ? (
                                <div className="px-3 py-6 text-center text-sm text-muted-foreground">No results found.</div>
                            ) : (
                                filtered.map((option) => {
                                    const isSelected = option.value === field.state.value
                                    return (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => handleSelect(option.value)}
                                            className={cn(
                                                'flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors',
                                                'hover:bg-accent hover:text-accent-foreground',
                                                isSelected && 'bg-primary/5 text-primary font-medium',
                                            )}
                                        >
                                            <span className="flex-1 text-left truncate">{option.label}</span>
                                            {isSelected && <Check className="h-3.5 w-3.5 shrink-0 text-primary" />}
                                        </button>
                                    )
                                })
                            )}
                        </div>
                    </div>
                )}
            </div>
            {isInvalid && <FieldError errors={field.state.meta.errors} />}
        </Field>
    )
}
