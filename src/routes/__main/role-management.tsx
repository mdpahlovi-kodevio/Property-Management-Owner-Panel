import { useAppForm } from '@/components/form/form-context'
import { Button } from '@/components/ui/button'
import { DataTable, type DataTableColumn } from '@/components/ui/data-table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { PageHeader } from '@/components/ui/page-header'
import { SearchInput } from '@/components/ui/search-input'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { TrashConfirm } from '@/components/ui/trash-confirm'
import { createFileRoute } from '@tanstack/react-router'
import { ChevronDown, Edit, Plus, Shield, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import * as z from 'zod'

export const Route = createFileRoute('/__main/role-management')({
    component: RouteComponent,
})

const roleSchema = z.object({
    roleName: z.string().min(1, 'Role name is required'),
    employees: z.string().min(1, 'Assigned employees required'),
    modules: z.array(z.any()),
})

const INITIAL_ROLES = [
    {
        id: 1,
        roleName: 'Manager',
        employees: 'Jane Cooper',
        modules: [
            { moduleName: 'Dashboard', enabled: true, permissions: ['StatCards', 'Revenue Overview'] },
            { moduleName: 'Users', enabled: true, permissions: ['Create', 'View'] },
            { moduleName: 'Properties', enabled: true, permissions: ['Create', 'Update', 'View'] },
            { moduleName: 'Reports', enabled: true, permissions: ['View', 'Export'] },
            { moduleName: 'Support', enabled: true, permissions: ['Create', 'Update', 'View'] },
            { moduleName: 'Settings', enabled: true, permissions: ['Create', 'Update', 'View'] },
        ],
    },
    {
        id: 2,
        roleName: 'Super Admin',
        employees: 'Wade Warren',
        modules: [
            { moduleName: 'Dashboard', enabled: true, permissions: ['StatCards', 'Revenue Overview'] },
            { moduleName: 'Users', enabled: true, permissions: ['Create', 'Update', 'View'] },
            { moduleName: 'Property Owners', enabled: true, permissions: ['Create', 'Update', 'View'] },
            { moduleName: 'Properties', enabled: true, permissions: ['Create', 'Update', 'View'] },
            { moduleName: 'Reservations', enabled: true, permissions: ['Create', 'Update', 'View'] },
        ],
    },
    {
        id: 3,
        roleName: 'Maintenance Staff',
        employees: 'Dianne Russell',
        modules: [
            { moduleName: 'Dashboard', enabled: true, permissions: ['StatCards'] },
            { moduleName: 'Users', enabled: true, permissions: ['View'] },
            { moduleName: 'Properties', enabled: true, permissions: ['Create', 'Update', 'View'] },
        ],
    },
    {
        id: 4,
        roleName: 'Accountant',
        employees: 'Eleanor Pena',
        modules: [
            { moduleName: 'Dashboard', enabled: true, permissions: ['StatCards', 'Revenue Overview'] },
            { moduleName: 'Employee', enabled: true, permissions: ['View'] },
            { moduleName: 'Reports', enabled: true, permissions: ['View', 'Export'] },
            { moduleName: 'Support', enabled: true, permissions: ['Create', 'Update', 'View'] },
            { moduleName: 'Settings', enabled: true, permissions: ['Create', 'Update', 'View'] },
        ],
    },
]

type RoleItem = (typeof INITIAL_ROLES)[number]

function RouteComponent() {
    const [roles, setRoles] = useState<RoleItem[]>(INITIAL_ROLES)
    const [searchQuery, setSearchQuery] = useState('')
    const [isOpen, setIsOpen] = useState(false)
    const [editingRole, setEditingRole] = useState<RoleItem | null>(null)

    const isEditMode = editingRole !== null

    const openAdd = () => {
        setEditingRole(null)
        setIsOpen(true)
    }

    const openEdit = (role: RoleItem) => {
        setEditingRole(role)
        setIsOpen(true)
    }

    const closeDialog = () => {
        setIsOpen(false)
        setEditingRole(null)
    }

    const handleSave = (values: z.infer<typeof roleSchema>) => {
        if (isEditMode && editingRole) {
            setRoles((prev) => prev.map((r) => (r.id === editingRole.id ? { ...r, ...values } : r)))
        } else {
            const newRole: RoleItem = {
                id: Date.now(),
                ...values,
            }
            setRoles((prev) => [...prev, newRole])
        }
        closeDialog()
    }

    const filteredRoles = useMemo(() => {
        if (!searchQuery.trim()) return roles
        const query = searchQuery.toLowerCase()
        return roles.filter((r) => r.roleName.toLowerCase().includes(query) || r.employees.toLowerCase().includes(query))
    }, [roles, searchQuery])

    const handleDeleteRole = (id: number) => {
        setRoles((prev) => prev.filter((r) => r.id !== id))
    }

    const columns: DataTableColumn<RoleItem>[] = useMemo(
        () => [
            { key: 'roleName', header: 'Role', render: (r) => <span className="font-medium text-foreground">{r.roleName}</span> },
            { key: 'employees', header: 'Assigned Employees', render: (r) => <span className="text-muted-foreground">{r.employees}</span> },
            {
                key: 'modules',
                header: 'Module Mapped',
                render: (r) => (
                    <div className="flex flex-wrap gap-2">
                        {r.modules
                            .filter((m: any) => m.enabled)
                            .map((mod: any) => (
                                <Tooltip key={mod.moduleName}>
                                    <TooltipTrigger asChild>
                                        <span className="text-[10px] sm:text-xs font-semibold text-green-600 bg-green-500/10 px-2 py-1 rounded-sm cursor-help">
                                            {mod.moduleName}
                                        </span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="text-xs font-medium">
                                            {mod.permissions && mod.permissions.length > 0 ? mod.permissions.join(', ') : 'No permissions'}
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            ))}
                    </div>
                ),
            },
            {
                key: 'action',
                header: 'Action',
                render: (r) => (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="sm">
                                Action <ChevronDown className="h-3.5 w-3.5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white">
                            <DropdownMenuItem onClick={() => openEdit(r)}>
                                <Edit className="size-3.5" /> Edit Details
                            </DropdownMenuItem>
                            <TrashConfirm name={r.roleName} onConfirm={() => handleDeleteRole(r.id)}>
                                <DropdownMenuItem variant="destructive" onSelect={(e) => e.preventDefault()}>
                                    <Trash2 className="size-3.5" /> Delete Role
                                </DropdownMenuItem>
                            </TrashConfirm>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ),
            },
        ],
        [],
    )

    return (
        <>
            <PageHeader title="Role Management" description="Manage your reports" />

            <div className="flex items-center justify-between gap-4">
                <SearchInput value={searchQuery} onValueChange={setSearchQuery} placeholder="Search" className="sm:w-80" />
                <Button onClick={openAdd}>
                    <Plus className="h-4 w-4" />
                    Add Role
                </Button>
            </div>

            <DataTable
                columns={columns}
                data={filteredRoles}
                noun="roles"
                emptyIcon={<Shield className="h-6 w-6" />}
                onReset={() => setSearchQuery('')}
            />

            <Dialog
                open={isOpen}
                onOpenChange={(open) => {
                    if (!open) closeDialog()
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-lg font-semibold">{isEditMode ? 'Edit Role' : 'Add Role'}</DialogTitle>
                        <DialogDescription className="text-sm text-slate-500">
                            {isEditMode
                                ? `Modify details for ${editingRole?.roleName || 'Role'}.`
                                : 'Enter the details to create a new role and assign permissions.'}
                        </DialogDescription>
                    </DialogHeader>

                    <RoleForm
                        key={editingRole?.id ?? 'add'}
                        defaultValues={
                            editingRole
                                ? {
                                      roleName: editingRole.roleName,
                                      employees: editingRole.employees,
                                      modules: editingRole.modules,
                                  }
                                : { roleName: '', employees: '', modules: [] }
                        }
                        onSubmit={handleSave}
                        onCancel={closeDialog}
                        submitLabel={isEditMode ? 'Save Changes' : 'Create Role'}
                    />
                </DialogContent>
            </Dialog>
        </>
    )
}

function RoleForm({
    defaultValues,
    onSubmit,
    onCancel,
    submitLabel,
}: {
    defaultValues: { roleName: string; employees: string; modules: any[] }
    onSubmit: (values: z.infer<typeof roleSchema>) => void
    onCancel: () => void
    submitLabel: string
}) {
    const form = useAppForm({
        defaultValues,
        validators: { onChange: roleSchema },
        onSubmit: async ({ value }) => onSubmit(value),
    })

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault()
                form.handleSubmit()
            }}
            className="space-y-4"
        >
            <form.AppField name="roleName">
                {(field) => <field.FormInput label="Role Name" placeholder="e.g. Content Editor" />}
            </form.AppField>

            <form.AppField name="employees">
                {(field) => <field.FormInput label="Assigned Employees" placeholder="e.g. John Doe, Jane Smith" />}
            </form.AppField>

            <form.AppField name="modules">{(field) => <field.FormModuleMap label="Module Mapped" />}</form.AppField>

            <DialogFooter>
                <Button type="button" variant="outline" onClick={onCancel} className="px-4 py-2 text-sm cursor-pointer">
                    Cancel
                </Button>
                <form.AppForm>
                    <form.FormSubmit label={submitLabel} />
                </form.AppForm>
            </DialogFooter>
        </form>
    )
}
