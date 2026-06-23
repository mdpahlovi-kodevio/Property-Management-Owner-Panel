import { useAppForm } from '@/components/form/form-context'
import { Button } from '@/components/ui/button'
import type { DataTableColumn } from '@/components/ui/data-table'
import { DataTable } from '@/components/ui/data-table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { PageHeader } from '@/components/ui/page-header'
import { SearchInput } from '@/components/ui/search-input'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { TrashConfirm } from '@/components/ui/trash-confirm'
import { useSearchParams } from '@/hooks/use-search-params'
import type { CreateRolePayload, Role, UpdateRolePayload } from '@/lib/api/role'
import { roleApi } from '@/lib/api/role'
import { formatPermission } from '@/lib/permission'
import { useMutation, useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { ChevronDown, Edit, Plus, Shield, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { z } from 'zod'

const searchSchema = z.object({
    page: z.number().default(1),
    limit: z.number().default(10),
    search: z.string().optional(),
})

export const Route = createFileRoute('/__main/role-management')({
    validateSearch: searchSchema,
    component: RouteComponent,
})

const modulePermissionSchema = z.object({
    module: z.string().min(2).max(64),
    permissions: z.array(z.string().min(1)),
})

const roleSchema = z.object({
    name: z.string().min(2, 'Enter role name'),
    description: z.string(),
    permissions: z.array(modulePermissionSchema).min(1, 'Select permissions for role'),
})

function RouteComponent() {
    const { t } = useTranslation()
    const query = Route.useSearch()
    const mergeSearch = useSearchParams()
    const [isOpen, setIsOpen] = useState(false)
    const [editingRole, setEditingRole] = useState<Role | null>(null)

    const isEditMode = editingRole !== null

    // Queries
    const { data, isLoading, refetch } = useQuery({
        queryKey: ['roles', query],
        queryFn: () => roleApi.list(query),
    })

    // Mutations
    const createMutation = useMutation({
        mutationFn: (payload: CreateRolePayload) => roleApi.create(payload),
        onSuccess: () => {
            refetch()
            toast.success(t('role-management.createdSuccess', 'Role created successfully'))
            closeDialog()
        },
        onError: (error) => toast.error(error.message),
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdateRolePayload }) => roleApi.update(id, payload),
        onSuccess: () => {
            refetch()
            toast.success(t('role-management.updatedSuccess', 'Role updated successfully'))
            closeDialog()
        },
        onError: (error) => toast.error(error.message),
    })

    const deleteMutation = useMutation({
        mutationFn: (id: string) => roleApi.delete(id),
        onSuccess: () => {
            refetch()
            toast.success(t('role-management.deletedSuccess', 'Role deleted successfully'))
        },
        onError: (error) => toast.error(error.message),
    })

    const openAdd = () => {
        setEditingRole(null)
        setIsOpen(true)
    }

    const openEdit = (role: Role) => {
        setEditingRole(role)
        setIsOpen(true)
    }

    const closeDialog = () => {
        setIsOpen(false)
        setEditingRole(null)
    }

    const handleSave = async (values: z.infer<typeof roleSchema>) => {
        const payload = {
            name: values.name,
            description: values.description,
            permissions: values.permissions,
        }

        if (isEditMode) {
            await updateMutation.mutateAsync({
                id: editingRole.id,
                payload,
            })
        } else {
            await createMutation.mutateAsync(payload)
        }
    }

    const columns: DataTableColumn<Role>[] = useMemo(
        () => [
            {
                key: 'roleName',
                header: t('role-management.role', 'Role'),
                render: (r) => <span className="font-medium text-foreground">{r.name}</span>,
            },
            {
                key: 'employees',
                header: t('role-management.assignedEmployees', 'Assigned Employees'),
                render: (r) => {
                    const employees = r.employees ?? []

                    if (employees.length === 0) {
                        return (
                            <span className="text-muted-foreground text-xs italic">
                                {t('role-management.noEmployees', 'No employees assigned')}
                            </span>
                        )
                    }

                    const maxVisible = 2
                    const visible = employees.slice(0, maxVisible)
                    const remaining = employees.length - visible.length
                    const visibleText = visible.map((e) => e.user.name).join(', ')
                    const fullText = employees.map((e) => e.user.name).join(', ')

                    return (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span className="text-muted-foreground cursor-help">
                                    {visibleText}
                                    {remaining > 0 && (
                                        <span className="text-foreground/70">
                                            {' '}
                                            +{remaining} {t('role-management.more', 'more')}
                                        </span>
                                    )}
                                </span>
                            </TooltipTrigger>
                            {employees.length > maxVisible && (
                                <TooltipContent>
                                    <p className="text-xs font-medium">{fullText}</p>
                                </TooltipContent>
                            )}
                        </Tooltip>
                    )
                },
            },
            {
                key: 'modules',
                header: t('role-management.moduleMapped', 'Module Mapped'),
                render: (r) => {
                    return (
                        <div className="flex flex-wrap gap-2">
                            {r.permissions.map((entry) => (
                                <Tooltip key={entry.module}>
                                    <TooltipTrigger asChild>
                                        <span className="text-[10px] sm:text-xs font-semibold text-green-600 bg-green-500/10 px-2 py-1 rounded-sm cursor-help">
                                            {formatPermission(entry.module)}
                                        </span>
                                    </TooltipTrigger>
                                    {entry.permissions.length ? (
                                        <TooltipContent>
                                            <p className="text-xs font-medium">{entry.permissions.map(formatPermission).join(', ')}</p>
                                        </TooltipContent>
                                    ) : null}
                                </Tooltip>
                            ))}
                        </div>
                    )
                },
            },
            {
                key: 'action',
                header: t('role-management.action', 'Action'),
                render: (r) => (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="sm">
                                {t('role-management.actionBtn', 'Action')} <ChevronDown className="h-3.5 w-3.5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white">
                            <DropdownMenuItem onClick={() => openEdit(r)}>
                                <Edit className="size-3.5" /> {t('role-management.editDetails', 'Edit Details')}
                            </DropdownMenuItem>
                            <TrashConfirm name={r.name} onConfirm={() => deleteMutation.mutate(r.id)}>
                                <DropdownMenuItem variant="destructive" onSelect={(e) => e.preventDefault()}>
                                    <Trash2 className="size-3.5" /> {t('role-management.deleteRole', 'Delete Role')}
                                </DropdownMenuItem>
                            </TrashConfirm>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ),
            },
        ],
        [t],
    )

    return (
        <>
            <PageHeader
                title={t('role-management.title', 'Role Management')}
                description={t('role-management.description', 'Define roles and control what your team can see and do.')}
            />

            <div className="flex items-center justify-between gap-4">
                <SearchInput
                    value={query.search ?? ''}
                    placeholder={t('role-management.searchPlaceholder', 'Search')}
                    className="sm:w-80"
                />
                <Button onClick={openAdd}>
                    <Plus className="h-4 w-4" />
                    {t('role-management.addRole', 'Add Role')}
                </Button>
            </div>

            <DataTable
                loading={isLoading}
                columns={columns}
                data={data?.data ?? []}
                noun={t('role-management.noun', 'roles')}
                emptyIcon={<Shield className="h-6 w-6" />}
                page={query.page}
                limit={query.limit}
                total={data?.meta.total ?? 0}
                onReset={() => mergeSearch({ search: '', page: 1, limit: 10 })}
            />

            <Dialog
                open={isOpen}
                onOpenChange={(open) => {
                    if (!open) closeDialog()
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {isEditMode ? t('role-management.editRole', 'Edit Role') : t('role-management.addRole', 'Add Role')}
                        </DialogTitle>
                        <DialogDescription>
                            {isEditMode
                                ? t('role-management.editRoleDesc', 'Modify details for {{roleName}}.', {
                                      roleName: editingRole.name || 'Role',
                                  })
                                : t('role-management.addRoleDesc', 'Enter the details to create a new role and assign permissions.')}
                        </DialogDescription>
                    </DialogHeader>

                    <RoleForm
                        key={editingRole?.id ?? 'add'}
                        defaultValues={
                            editingRole
                                ? {
                                      name: editingRole.name,
                                      description: editingRole.description || '',
                                      permissions: editingRole.permissions,
                                  }
                                : { name: '', description: '', permissions: [] }
                        }
                        onSubmit={handleSave}
                        onCancel={closeDialog}
                        submitLabel={
                            createMutation.isPending || updateMutation.isPending
                                ? t('role-management.saving', 'Saving...')
                                : isEditMode
                                  ? t('role-management.saveChanges', 'Save Changes')
                                  : t('role-management.createRole', 'Create Role')
                        }
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
    defaultValues: { name: string; description: string; permissions: any }
    onSubmit: (values: z.infer<typeof roleSchema>) => Promise<void>
    onCancel: () => void
    submitLabel: string
}) {
    const { t } = useTranslation()
    const form = useAppForm({
        defaultValues,
        validators: { onChange: roleSchema },
        onSubmit: async ({ value }) => await onSubmit(value),
    })

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault()
                form.handleSubmit()
            }}
            className="space-y-4"
        >
            <form.AppField name="name">
                {(field) => <field.FormInput label={t('role-management.roleName', 'Role Name')} placeholder="e.g. Content Editor" />}
            </form.AppField>

            <form.AppField name="description">
                {(field) => (
                    <field.FormInput
                        label={t('role-management.roleDescription', 'Role Description')}
                        placeholder="e.g. Manage blog content and properties"
                    />
                )}
            </form.AppField>

            <form.AppField name="permissions">
                {(field) => <field.FormModuleMap label={t('role-management.moduleMapped', 'Module Mapped')} />}
            </form.AppField>

            <DialogFooter>
                <Button type="button" variant="outline" onClick={onCancel} className="px-4 py-2 text-sm cursor-pointer">
                    {t('role-management.cancel', 'Cancel')}
                </Button>
                <form.AppForm>
                    <form.FormSubmit label={submitLabel} />
                </form.AppForm>
            </DialogFooter>
        </form>
    )
}
