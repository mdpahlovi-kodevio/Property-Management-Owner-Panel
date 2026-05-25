import { data } from '@/components/main/app-sidebar'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useFieldContext } from './form-context'

export type ModulePermissionMap = {
    moduleName: string
    enabled: boolean
    permissions: string[]
}

const DEFAULT_SUB_PERMISSIONS = ['Create', 'Update', 'View']
const DASHBOARD_SUB_PERMISSIONS = ['StatCards', 'Revenue Overview', 'Recent Bookings']

function getSubPermissions(moduleTitle: string) {
    if (moduleTitle === 'Dashboard') return DASHBOARD_SUB_PERMISSIONS
    if (moduleTitle === 'Reports') return ['View', 'Export']
    return DEFAULT_SUB_PERMISSIONS
}

function createEmptyModules(): ModulePermissionMap[] {
    return data.navMain.map((item) => ({
        moduleName: item.title,
        enabled: false,
        permissions: [],
    }))
}

export function FormModuleMap({ label = 'Module Mapped' }: { label?: string }) {
    const field = useFieldContext<ModulePermissionMap[]>()
    const [modules, setModules] = useState<ModulePermissionMap[]>(
        field.state.value && field.state.value.length > 0 ? field.state.value : createEmptyModules(),
    )
    const [expanded, setExpanded] = useState<Record<string, boolean>>({})

    useEffect(() => {
        if (field.state.value && field.state.value.length > 0) {
            const merged = data.navMain.map((item) => {
                const existing = field.state.value?.find((v) => v.moduleName === item.title)
                return existing || { moduleName: item.title, enabled: false, permissions: [] }
            })
            setModules(merged)
        }
    }, [field.state.value])

    const toggleModule = (moduleName: string, enabled: boolean) => {
        const updated = modules.map((m) => {
            if (m.moduleName === moduleName) {
                return { ...m, enabled, permissions: enabled ? m.permissions : [] }
            }
            return m
        })
        setModules(updated)
        field.handleChange(updated)
        if (enabled) {
            setExpanded((prev) => ({ ...prev, [moduleName]: true }))
        } else {
            // Optional: collapse it when disabled
            setExpanded((prev) => ({ ...prev, [moduleName]: false }))
        }
    }

    const togglePermission = (moduleName: string, permission: string, checked: boolean) => {
        const updated = modules.map((m) => {
            if (m.moduleName !== moduleName) return m
            let newPerms = [...m.permissions]
            if (checked) {
                newPerms.push(permission)
            } else {
                newPerms = newPerms.filter((p) => p !== permission)
            }
            return { ...m, permissions: newPerms }
        })
        setModules(updated)
        field.handleChange(updated)
    }

    const toggleExpand = (moduleName: string) => {
        setExpanded((prev) => ({ ...prev, [moduleName]: !prev[moduleName] }))
    }

    return (
        <div className="space-y-4">
            <div className="font-semibold text-base text-foreground">{label}</div>
            <div className="space-y-3">
                {data.navMain.map((item) => {
                    const moduleData = modules.find((m) => m.moduleName === item.title)
                    const isEnabled = moduleData?.enabled ?? false
                    const isExpanded = expanded[item.title] ?? false
                    const subPerms = getSubPermissions(item.title)

                    return (
                        <div
                            key={item.title}
                            className={cn('flex flex-col rounded-md border bg-card transition-colors', isEnabled && 'border-green-500/30')}
                        >
                            {/* Header */}
                            <div 
                                className="flex items-center justify-between p-3 cursor-pointer select-none transition-colors hover:bg-muted/30"
                                onClick={() => toggleExpand(item.title)}
                            >
                                <div className="flex items-center gap-3">
                                    <div onClick={(e) => e.stopPropagation()}>
                                        <Switch
                                            checked={isEnabled}
                                            onCheckedChange={(checked) => toggleModule(item.title, checked)}
                                            className="data-[state=checked]:bg-green-500"
                                        />
                                    </div>
                                    <span className={cn('font-medium text-sm', !isEnabled && 'text-muted-foreground')}>{item.title}</span>
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
                                    <div className="border-t p-3 pl-12 space-y-3">
                                        {subPerms.map((perm) => {
                                            const hasPerm = moduleData?.permissions.includes(perm) ?? false
                                            return (
                                                <label
                                                    key={perm}
                                                    className={cn(
                                                        'flex items-center gap-3 cursor-pointer text-sm transition-opacity',
                                                        !isEnabled && 'opacity-50 cursor-not-allowed',
                                                    )}
                                                >
                                                    <Checkbox
                                                        className="rounded-full h-4 w-4"
                                                        checked={hasPerm}
                                                        onCheckedChange={(checked) =>
                                                            togglePermission(item.title, perm, checked as boolean)
                                                        }
                                                        disabled={!isEnabled}
                                                    />
                                                    <span className="text-muted-foreground">{perm}</span>
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
        </div>
    )
}
