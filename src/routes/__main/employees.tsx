import { useAppForm } from '@/components/form/form-context'
import { Button } from '@/components/ui/button'
import type { DataTableColumn } from '@/components/ui/data-table'
import { DataTable } from '@/components/ui/data-table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import { PageHeader } from '@/components/ui/page-header'
import { SearchInput } from '@/components/ui/search-input'
import { TrashConfirm } from '@/components/ui/trash-confirm'
import { useSearchParams } from '@/hooks/use-search-params'
import type { CreateEmployeePayload, Employee, UpdateEmployeePayload } from '@/lib/api'
import { employeeApi, resolveImage, roleApi } from '@/lib/api'
import { useMutation, useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { ChevronDown, CircleCheck, CircleX, Edit, Plus, Trash2, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { z } from 'zod'

const searchSchema = z.object({
    page: z.number().default(1),
    limit: z.number().default(10),
    search: z.string().optional(),
})

export const Route = createFileRoute('/__main/employees')({
    validateSearch: searchSchema,
    component: RouteComponent,
})

const employeeSchema = z.object({
    name: z.string().min(2, 'Enter employee full name'),
    email: z.email('Enter a valid email address'),
    image: z.string(),
    phone: z.string(),
    roleId: z.string().min(1, 'Select employee role'),
    status: z.enum(['active', 'banned']),
    password: z.string().optional(),
})

function RouteComponent() {
    const { t } = useTranslation()
    const query = Route.useSearch()
    const mergeSearch = useSearchParams()
    const [isOpen, setIsOpen] = useState(false)
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)

    const isEditMode = editingEmployee !== null

    // Queries
    const { data, isLoading, refetch } = useQuery({
        queryKey: ['employees', query],
        queryFn: () => employeeApi.list(query),
    })

    // Mutations
    const createMutation = useMutation({
        mutationFn: (payload: CreateEmployeePayload) => employeeApi.create(payload),
        onSuccess: () => {
            refetch()
            toast.success(t('employees.createdSuccess', 'Employee registered successfully'))
            closeDialog()
        },
        onError: (error) => toast.error(error.message),
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdateEmployeePayload }) => employeeApi.update(id, payload),
        onSuccess: () => {
            refetch()
            toast.success(t('employees.updatedSuccess', 'Employee updated successfully'))
            closeDialog()
        },
        onError: (error) => toast.error(error.message),
    })

    const toggleStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: 'active' | 'banned' }) => employeeApi.update(id, { status }),
        onSuccess: () => {
            refetch()
            toast.success(t('employees.statusUpdated', 'Employee status updated successfully'))
        },
        onError: (error) => toast.error(error.message),
    })

    const deleteMutation = useMutation({
        mutationFn: (id: string) => employeeApi.delete(id),
        onSuccess: () => {
            refetch()
            toast.success(t('employees.deletedSuccess', 'Employee deleted successfully'))
        },
        onError: (error) => toast.error(error.message),
    })

    const openAdd = () => {
        setEditingEmployee(null)
        setIsOpen(true)
    }

    const openEdit = (employee: Employee) => {
        setEditingEmployee(employee)
        setIsOpen(true)
    }

    const closeDialog = () => {
        setIsOpen(false)
        setEditingEmployee(null)
    }

    const handleSave = async (values: z.infer<typeof employeeSchema>) => {
        if (isEditMode) {
            await updateMutation.mutateAsync({
                id: editingEmployee.id,
                payload: {
                    name: values.name,
                    image: values.image,
                    phone: values.phone,
                    roleId: values.roleId,
                    status: values.status,
                },
            })
        } else {
            await createMutation.mutateAsync({
                name: values.name,
                email: values.email,
                image: values.image,
                phone: values.phone,
                roleId: values.roleId,
                password: values.password ?? '12345678',
            })
        }
    }

    const columns: DataTableColumn<Employee>[] = useMemo(
        () => [
            {
                key: 'name',
                header: t('employees.employee', 'Employee'),
                className: 'flex items-center gap-3',
                render: (emp) => (
                    <>
                        <div className="size-8 rounded-full overflow-hidden">
                            <img
                                src={resolveImage(emp.user.image)}
                                alt={emp.user.name}
                                crossOrigin="anonymous"
                                className="size-full object-cover"
                            />
                        </div>
                        {emp.user.name}
                    </>
                ),
            },
            {
                key: 'email',
                header: t('employees.email', 'Email'),
                render: (emp) => <span className="text-muted-foreground">{emp.user.email}</span>,
            },
            {
                key: 'phone',
                header: t('employees.phone', 'Phone Number'),
                render: (emp) => <span className="text-muted-foreground">{emp.user.phone || '-'}</span>,
            },
            {
                key: 'role',
                header: t('employees.role', 'Role'),
                render: (emp) => <span className="text-muted-foreground">{emp.role.name || '-'}</span>,
            },
            {
                key: 'status',
                header: t('employees.status', 'Status'),
                render: (emp) => {
                    if (!emp.user.banned) {
                        return (
                            <span className="text-xs font-semibold text-green-600 bg-green-500/10 px-2.5 py-1 rounded-full">
                                {t('employees.active', 'Active')}
                            </span>
                        )
                    } else {
                        return (
                            <span className="text-xs font-semibold text-red-600 bg-red-500/10 px-2.5 py-1 rounded-full">
                                {t('employees.blocked', 'Blocked')}
                            </span>
                        )
                    }
                },
            },
            {
                key: 'action',
                header: t('employees.action', 'Action'),
                render: (emp) => (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="sm">
                                {t('employees.action', 'Action')} <ChevronDown className="h-3.5 w-3.5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white">
                            <DropdownMenuItem onClick={() => openEdit(emp)}>
                                <Edit className="size-3.5" /> {t('employees.editDetails', 'Edit Details')}
                            </DropdownMenuItem>
                            {emp.user.banned ? (
                                <DropdownMenuItem
                                    variant="success"
                                    onClick={() => toggleStatusMutation.mutate({ id: emp.id, status: 'active' })}
                                >
                                    <CircleCheck className="size-3.5" /> {t('employees.activate', 'Activate')}
                                </DropdownMenuItem>
                            ) : (
                                <DropdownMenuItem
                                    variant="destructive"
                                    onClick={() => toggleStatusMutation.mutate({ id: emp.id, status: 'banned' })}
                                >
                                    <CircleX className="size-3.5" /> {t('employees.deactivate', 'Deactivate')}
                                </DropdownMenuItem>
                            )}
                            <TrashConfirm name={emp.user.name} onConfirm={() => deleteMutation.mutate(emp.id)}>
                                <DropdownMenuItem variant="destructive" onSelect={(e) => e.preventDefault()}>
                                    <Trash2 className="size-3.5" /> {t('employees.deleteEmployee', 'Delete Employee')}
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
                title={t('employees.title', 'Employees')}
                description={t('employees.description', 'Manage your employees and their details.')}
            />

            <div className="flex items-center justify-between gap-4">
                <SearchInput value={query.search ?? ''} placeholder={t('employees.searchPlaceholder', 'Search')} className="sm:w-80" />
                <Button onClick={openAdd}>
                    <Plus className="h-4 w-4" />
                    {t('employees.add', 'Add Employee')}
                </Button>
            </div>

            <DataTable
                loading={isLoading}
                columns={columns}
                data={data?.data ?? []}
                noun={t('employees.noun', 'employees')}
                emptyIcon={<Users className="h-6 w-6" />}
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
                        <DialogTitle> {isEditMode ? t('employees.edit', 'Edit Employee') : t('employees.add', 'Add Employee')}</DialogTitle>
                        <DialogDescription>
                            {isEditMode
                                ? t('employees.editDesc', `Modify details for {{name}}.`, {
                                      name: editingEmployee.user.name || 'Employee',
                                  })
                                : t('employees.addDesc', 'Enter the details of the new employee to register them in the management panel.')}
                        </DialogDescription>
                    </DialogHeader>

                    <EmployeeForm
                        key={editingEmployee?.id ?? 'add'}
                        isEditMode={isEditMode}
                        defaultValues={
                            editingEmployee
                                ? {
                                      name: editingEmployee.user.name,
                                      email: editingEmployee.user.email,
                                      phone: editingEmployee.user.phone || '',
                                      image: editingEmployee.user.image || '',
                                      roleId: editingEmployee.roleId,
                                      status: editingEmployee.user.banned ? 'banned' : 'active',
                                  }
                                : { name: '', email: '', phone: '', image: '', roleId: '', status: 'active', password: '12345678' }
                        }
                        onSubmit={handleSave}
                        onCancel={closeDialog}
                        submitLabel={
                            createMutation.isPending || updateMutation.isPending
                                ? t('employees.saving', 'Saving...')
                                : isEditMode
                                  ? t('employees.save', 'Save Changes')
                                  : t('employees.register', 'Register Employee')
                        }
                    />
                </DialogContent>
            </Dialog>
        </>
    )
}

function EmployeeForm({
    defaultValues,
    onSubmit,
    onCancel,
    submitLabel,
    isEditMode,
}: {
    defaultValues: {
        name: string
        email: string
        phone: string
        image: string
        roleId: string
        status: 'active' | 'banned'
        password?: string
    }
    onSubmit: (values: z.infer<typeof employeeSchema>) => Promise<void>
    onCancel: () => void
    submitLabel: string
    isEditMode: boolean
}) {
    const { t } = useTranslation()
    const form = useAppForm({
        defaultValues,
        validators: { onChange: employeeSchema },
        onSubmit: async ({ value }) => await onSubmit(value),
    })

    const { data } = useQuery({
        queryKey: ['roles'],
        queryFn: () => roleApi.list({ limit: 100 }),
    })

    const roleOptions = useMemo(() => {
        return (
            data?.data.map((r) => ({
                value: r.id,
                label: r.name,
            })) ?? []
        )
    }, [data?.data])

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault()
                form.handleSubmit()
            }}
            className="space-y-4"
        >
            <form.AppField name="image">{(field) => <field.FormAvatar folder="owner-employee" />}</form.AppField>

            <form.AppField name="name">
                {(field) => (
                    <field.FormInput label={t('employees.name', 'Full Name')} placeholder="e.g. Jane Cooper" disabled={isEditMode} />
                )}
            </form.AppField>

            <form.AppField name="email">
                {(field) => (
                    <field.FormInput
                        type="email"
                        label={t('employees.email', 'Email Address')}
                        placeholder="e.g. janecoper@gmail.com"
                        disabled={isEditMode}
                    />
                )}
            </form.AppField>

            <form.AppField name="phone">
                {(field) => <field.FormInput label={t('employees.phone', 'Phone Number')} placeholder="e.g. +1 416 555 0192" />}
            </form.AppField>

            {!isEditMode && (
                <form.AppField name="password">
                    {(field) => (
                        <field.FormInput type="password" label={t('auth.password', 'Password')} placeholder="e.g. at least 8 characters" />
                    )}
                </form.AppField>
            )}

            <form.AppField name="roleId">
                {(field) => (
                    <field.FormSelect
                        label={t('employees.role', 'Role')}
                        placeholder={t('employees.selectRole', 'Select a role')}
                        options={roleOptions}
                    />
                )}
            </form.AppField>

            {isEditMode && (
                <form.AppField name="status">
                    {(field) => (
                        <div className="space-y-1.5">
                            <Label>{t('employees.status', 'Status')}</Label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 text-sm cursor-pointer">
                                    <input
                                        type="radio"
                                        checked={field.state.value === 'active'}
                                        onChange={() => field.handleChange('active')}
                                        className="h-4 w-4 accent-primary"
                                    />
                                    {t('employees.active', 'Active')}
                                </label>
                                <label className="flex items-center gap-2 text-sm cursor-pointer">
                                    <input
                                        type="radio"
                                        checked={field.state.value === 'banned'}
                                        onChange={() => field.handleChange('banned')}
                                        className="h-4 w-4 accent-primary"
                                    />
                                    {t('employees.blocked', 'Blocked')}
                                </label>
                            </div>
                        </div>
                    )}
                </form.AppField>
            )}

            <DialogFooter>
                <Button type="button" variant="outline" onClick={onCancel} className="px-4 py-2 text-sm cursor-pointer">
                    {t('nav.cancel', 'Cancel')}
                </Button>
                <form.AppForm>
                    <form.FormSubmit label={submitLabel} />
                </form.AppForm>
            </DialogFooter>
        </form>
    )
}
