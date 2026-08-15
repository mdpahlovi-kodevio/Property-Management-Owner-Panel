import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Switch } from '@/components/ui/switch'
import type { Session } from '@/lib/api'
import type { ModuleKey } from '@/lib/module'
import { isModuleHidden, MODULE_KEYS, MODULES } from '@/lib/module'
import { formatPermission } from '@/lib/permission'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { useFieldContext } from './form-context'

/* ──────────────────────────────────────────────────────────────────────────
 * 1. TYPES
 * ──────────────────────────────────────────────────────────────────────── */

/** The payload shape this field produces and the form consumes. */
export type PermissionPayload = {
    module: string
    permissions: string[]
}[]

/* ──────────────────────────────────────────────────────────────────────────
 * 2. NORMALIZATION — accept any legacy shape, emit PermissionPayload
 * ──────────────────────────────────────────────────────────────────────── */

/**
 * Convert whatever arrives from the form's `defaultValues` into
 * a clean `PermissionPayload`.
 *
 * Accepted inputs:
 *  - `PermissionPayload`    → [{ module, permissions }]
 *  - `UserPermissionsMap`   → { 'property-owners': ['create'] }
 *  - `null | undefined`     → []
 */
function normalize(raw: unknown): PermissionPayload {
    if (!raw) return []

    // Already in target shape
    if (Array.isArray(raw)) {
        return raw.filter(
            (entry): entry is { module: string; permissions: string[] } =>
                entry &&
                typeof entry === 'object' &&
                'module' in entry &&
                'permissions' in entry &&
                Array.isArray((entry as { permissions: unknown }).permissions),
        )
    }

    // Flat-map shape: { dashboard: ['stat-cards'], users: ['create'] }
    if (typeof raw === 'object') {
        const payload: PermissionPayload = []
        for (const [key, perms] of Object.entries(raw as Record<string, unknown>)) {
            if (Array.isArray(perms) && perms.length > 0) {
                payload.push({ module: key, permissions: perms.filter((p): p is string => typeof p === 'string') })
            }
        }
        return payload
    }

    return []
}

/* ──────────────────────────────────────────────────────────────────────────
 * 3. COMPONENT
 * ──────────────────────────────────────────────────────────────────────── */

export function FormModuleMap({ label = 'Module Mapped', user }: { label?: string; user?: Session['user'] }) {
    const field = useFieldContext<PermissionPayload>()
    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

    const [expanded, setExpanded] = useState<Record<string, boolean>>({})

    // Single source of truth — derived from the field value.
    const value: PermissionPayload = normalize(field.state.value)

    // Modules the current user should not be able to grant (e.g. managers module for manager users).
    const visibleModuleKeys = MODULE_KEYS.filter((key) => !user || !isModuleHidden(key, user))

    /* ── helpers ────────────────────────────────────────────────────────── */

    const findEntry = (moduleKey: string) => value.find((e) => e.module === moduleKey)

    const isModuleEnabled = (moduleKey: string) => !!findEntry(moduleKey)

    const hasPermission = (moduleKey: string, perm: string) => findEntry(moduleKey)?.permissions.includes(perm) ?? false

    const emit = (next: PermissionPayload) => field.handleChange(next)

    /* ── toggle module on/off ──────────────────────────────────────────── */

    const toggleModule = (id: ModuleKey, enabled: boolean) => {
        if (enabled) {
            // Add module with empty permissions
            emit([...value, { module: id, permissions: [] }])
            setExpanded((prev) => ({ ...prev, [id]: true }))
        } else {
            // Remove module entirely
            emit(value.filter((e) => e.module !== id))
            setExpanded((prev) => ({ ...prev, [id]: false }))
        }
    }

    /* ── toggle individual permission ──────────────────────────────────── */

    const togglePermission = (id: ModuleKey, permission: string, checked: boolean) => {
        emit(
            value.map((entry) => {
                if (entry.module !== id) return entry
                const nextPerms = checked
                    ? Array.from(new Set([...entry.permissions, permission]))
                    : entry.permissions.filter((p) => p !== permission)
                return { ...entry, permissions: nextPerms }
            }),
        )
    }

    /* ── expand / collapse ─────────────────────────────────────────────── */

    const toggleExpand = (id: string) => {
        setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))
    }

    /* ── render ─────────────────────────────────────────────────────────── */

    return (
        <Field data-invalid={isInvalid}>
            <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
            <div className="space-y-2">
                {visibleModuleKeys.map((id) => {
                    const enabled = isModuleEnabled(id)
                    const isExpanded = expanded[id] ?? false
                    const availablePermissions = MODULES[id].permissions

                    return (
                        <div
                            key={id}
                            className={cn('flex flex-col rounded-lg border bg-card transition-colors', enabled && 'border-green-500/30')}
                        >
                            {/* Header */}
                            <div
                                className="flex items-center justify-between px-3 py-2 cursor-pointer select-none transition-colors hover:bg-muted/30"
                                onClick={() => toggleExpand(id)}
                            >
                                <div className="flex items-center gap-3">
                                    <div onClick={(e) => e.stopPropagation()}>
                                        <Switch
                                            checked={enabled}
                                            onCheckedChange={(checked) => toggleModule(id, checked)}
                                            className="data-[state=checked]:bg-green-500"
                                        />
                                    </div>
                                    <span className={cn('font-medium text-sm', !enabled && 'text-muted-foreground')}>
                                        {formatPermission(id)}
                                    </span>
                                </div>
                                <div className="p-1 text-muted-foreground">
                                    <ChevronDown className={cn('w-4 h-4 transition-transform duration-300', isExpanded && 'rotate-180')} />
                                </div>
                            </div>

                            {/* Sub Permissions */}
                            <div
                                className={cn(
                                    'grid transition-all duration-300 ease-in-out',
                                    isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
                                )}
                            >
                                <div className="overflow-hidden">
                                    <div className="border-t pl-12 pr-3 py-2 space-y-3">
                                        {availablePermissions.map((perm) => {
                                            const hasPerm = hasPermission(id, perm)
                                            return (
                                                <label
                                                    key={perm}
                                                    className={cn(
                                                        'flex items-center gap-3 cursor-pointer text-sm transition-opacity',
                                                        !enabled && 'opacity-50 cursor-not-allowed',
                                                    )}
                                                >
                                                    <Checkbox
                                                        className="rounded-full h-4 w-4"
                                                        checked={hasPerm}
                                                        onCheckedChange={(checked) => togglePermission(id, perm, checked as boolean)}
                                                        disabled={!enabled}
                                                    />
                                                    <span className="text-muted-foreground">{formatPermission(perm)}</span>
                                                </label>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
            {isInvalid && <FieldError errors={field.state.meta.errors} />}
        </Field>
    )
}
