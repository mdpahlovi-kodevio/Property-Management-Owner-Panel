import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { cn } from '@/lib/utils'
import { Check, ChevronDown, Search, UserPlus, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import * as z from 'zod'
import { useAppForm, useFieldContext } from './form-context'

type Option = { label: string; value: string }

const newGuestSchema = z.object({
    name: z.string().min(1, 'Enter guest full name.'),
    email: z.email('Enter a valid email address.').toLowerCase(),
})

type FormSearchableSelectProps = {
    label: string
    options: Option[]
    placeholder?: string
    searchPlaceholder?: string
    disabled?: boolean
    /** Allow adding a new guest inline */
    allowAddNew?: boolean
    addNewLabel?: string
}

export function FormSearchableSelect({
    label,
    options: initialOptions,
    placeholder = 'Select an option',
    searchPlaceholder = 'Search...',
    disabled,
    allowAddNew = false,
    addNewLabel = 'Add new guest',
}: FormSearchableSelectProps) {
    const field = useFieldContext<string>()
    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState('')
    const [options, setOptions] = useState<Option[]>(initialOptions)
    const [showAddNew, setShowAddNew] = useState(false)

    const containerRef = useRef<HTMLDivElement>(null)
    const searchRef = useRef<HTMLInputElement>(null)

    // Sub-form for adding a new guest (mirrors the guest form pattern in user-management.tsx)
    // Lives outside a <form> wrapper because we're already nested inside the parent's form.
    const newGuestForm = useAppForm({
        defaultValues: { name: '', email: '' },
        validators: { onChange: newGuestSchema },
        onSubmit: async ({ value }) => {
            const { name, email } = value

            if (options.some((o) => o.value === email)) {
                newGuestForm.setFieldMeta('email', (prev) => ({
                    ...prev,
                    isValid: false,
                    errors: ['This guest already exists.'],
                }))
                return
            }

            setOptions((prev) => [...prev, { value: email, label: `${name} (${email})` }])
            field.handleChange(email)
            field.handleBlur()
            setOpen(false)
            setSearch('')
            setShowAddNew(false)
            newGuestForm.reset()
        },
    })

    const closeAddNewPanel = () => {
        setShowAddNew(false)
        newGuestForm.reset()
    }

    const selectedOption = options.find((o) => o.value === field.state.value)

    const filtered = search.trim() ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase())) : options

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false)
                setSearch('')
                setShowAddNew(false)
                newGuestForm.reset()
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [newGuestForm])

    // Focus search when opened
    useEffect(() => {
        if (open && !showAddNew) {
            setTimeout(() => searchRef.current?.focus(), 10)
        }
    }, [open, showAddNew])

    const handleSelect = (value: string) => {
        field.handleChange(value)
        field.handleBlur()
        setOpen(false)
        setSearch('')
        setShowAddNew(false)
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
                        if (!open) field.handleBlur()
                    }}
                    className={cn(
                        'flex h-10 w-full items-center justify-between rounded-lg border border-input bg-background px-3 py-2 text-sm',
                        'hover:border-primary/50 focus:outline-none',
                        'transition-colors duration-150',
                        disabled && 'cursor-not-allowed opacity-50',
                        isInvalid && 'border-destructive',
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
                            'absolute z-50 mt-1 w-full rounded-md border border-border bg-popover shadow-lg overflow-hidden',
                            'animate-in fade-in-0 zoom-in-95 duration-100',
                        )}
                    >
                        {!showAddNew ? (
                            <>
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
                                        <button
                                            type="button"
                                            onClick={() => setSearch('')}
                                            className="text-muted-foreground hover:text-foreground"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    )}
                                </div>

                                {/* Options list */}
                                <div className="max-h-48 overflow-y-auto py-1">
                                    {filtered.length === 0 ? (
                                        <div className="px-3 py-5 text-center text-sm text-muted-foreground">No results found.</div>
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

                                {/* Add new guest footer */}
                                {allowAddNew && (
                                    <div className="border-t border-border">
                                        <button
                                            type="button"
                                            onClick={() => setShowAddNew(true)}
                                            className="flex w-full items-center gap-2 px-3 py-2.5 text-sm font-medium text-primary hover:bg-primary/5 transition-colors"
                                        >
                                            <UserPlus className="h-3.5 w-3.5 shrink-0" />
                                            {addNewLabel}
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            /* ── Add New Guest Panel ── */
                            <div className="p-4 space-y-3">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                                        <UserPlus className="h-4 w-4 text-primary" />
                                        New Guest
                                    </span>
                                    <button
                                        type="button"
                                        onClick={closeAddNewPanel}
                                        className="text-muted-foreground hover:text-foreground rounded-md p-0.5 transition-colors"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>

                                <newGuestForm.AppField name="name">
                                    {(subField) => <subField.FormInput size="sm" label="Full Name" placeholder="e.g. John Smith" />}
                                </newGuestForm.AppField>

                                <newGuestForm.AppField name="email">
                                    {(subField) => (
                                        <subField.FormInput
                                            size="sm"
                                            type="email"
                                            label="Email Address"
                                            placeholder="e.g. john@example.com"
                                        />
                                    )}
                                </newGuestForm.AppField>

                                <div className="flex gap-2 pt-1">
                                    <Button size="sm" type="button" variant="outline" onClick={closeAddNewPanel}>
                                        Cancel
                                    </Button>
                                    <newGuestForm.Subscribe selector={(state) => state.canSubmit}>
                                        {(canSubmit) => (
                                            <Button
                                                size="sm"
                                                type="button"
                                                onClick={() => newGuestForm.handleSubmit()}
                                                disabled={!canSubmit}
                                            >
                                                Add Guest
                                            </Button>
                                        )}
                                    </newGuestForm.Subscribe>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
            {isInvalid && <FieldError errors={field.state.meta.errors} />}
        </Field>
    )
}
