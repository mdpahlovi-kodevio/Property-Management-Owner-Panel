import { useAppForm } from '@/components/form/form-context'
import { Button } from '@/components/ui/button'
import type { DataTableColumn } from '@/components/ui/data-table'
import { DataTable } from '@/components/ui/data-table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import { PageHeader } from '@/components/ui/page-header'
import { SearchInput } from '@/components/ui/search-input'
import { useSearchParams } from '@/hooks/use-search-params'
import type { CreateManagerPayload, Manager, UpdateManagerPayload } from '@/lib/api'
import { managerApi, resolveImage } from '@/lib/api'
import { useMutation, useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { ChevronDown, Edit, Plus, UserCog } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { z } from 'zod'

const searchSchema = z.object({
    page: z.number().default(1),
    limit: z.number().default(10),
    search: z.string().optional(),
})

export const Route = createFileRoute('/__main/manager')({
    validateSearch: searchSchema,
    component: RouteComponent,
})

const managerSchema = z.object({
    name: z.string().min(2, 'Enter manager full name'),
    email: z.email('Enter a valid email address'),
    image: z.string(),
    phone: z.string(),
    status: z.enum(['active', 'banned']),
    password: z.string().optional(),
})

function RouteComponent() {
    const { t } = useTranslation()
    const query = Route.useSearch()
    const mergeSearch = useSearchParams()
    const [isOpen, setIsOpen] = useState(false)
    const [editingManager, setEditingManager] = useState<Manager | null>(null)

    const isEditMode = editingManager !== null

    // Queries
    const { data, isLoading, refetch } = useQuery({
        queryKey: ['managers', query],
        queryFn: () => managerApi.list(query),
    })

    // Mutations
    const createMutation = useMutation({
        mutationFn: (payload: CreateManagerPayload) => managerApi.create(payload),
        onSuccess: () => {
            refetch()
            toast.success(t('managers.createdSuccess', 'Manager registered successfully'))
            closeDialog()
        },
        onError: (error) => toast.error(error.message),
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdateManagerPayload }) => managerApi.update(id, payload),
        onSuccess: () => {
            refetch()
            toast.success(t('managers.updatedSuccess', 'Manager updated successfully'))
            closeDialog()
        },
        onError: (error) => toast.error(error.message),
    })

    const openAdd = () => {
        setEditingManager(null)
        setIsOpen(true)
    }

    const openEdit = (manager: Manager) => {
        setEditingManager(manager)
        setIsOpen(true)
    }

    const closeDialog = () => {
        setIsOpen(false)
        setEditingManager(null)
    }

    const handleSave = async (values: z.infer<typeof managerSchema>) => {
        if (isEditMode) {
            await updateMutation.mutateAsync({
                id: editingManager.id,
                payload: {
                    name: values.name,
                    image: values.image,
                    phone: values.phone,
                    status: values.status,
                },
            })
        } else {
            await createMutation.mutateAsync({
                name: values.name,
                email: values.email,
                image: values.image,
                phone: values.phone,
                password: values.password ?? '12345678',
            })
        }
    }

    const columns: DataTableColumn<Manager>[] = useMemo(
        () => [
            {
                key: 'name',
                header: t('managers.manager', 'Manager'),
                className: 'flex items-center gap-3',
                render: (m) => (
                    <>
                        <div className="size-8 rounded-full overflow-hidden">
                            <img
                                src={resolveImage(m.user.image)}
                                alt={m.user.name}
                                crossOrigin="anonymous"
                                className="size-full object-cover"
                            />
                        </div>
                        {m.user.name}
                    </>
                ),
            },
            {
                key: 'email',
                header: t('managers.email', 'Email'),
                render: (m) => <span className="text-muted-foreground">{m.user.email}</span>,
            },
            {
                key: 'phone',
                header: t('managers.phone', 'Phone Number'),
                render: (m) => <span className="text-muted-foreground">{m.user.phone || '-'}</span>,
            },
            {
                key: 'status',
                header: t('managers.status', 'Status'),
                render: (m) => {
                    if (!m.user.banned) {
                        return (
                            <span className="text-xs font-semibold text-green-600 bg-green-500/10 px-2.5 py-1 rounded-full">
                                {t('managers.active', 'Active')}
                            </span>
                        )
                    } else {
                        return (
                            <span className="text-xs font-semibold text-red-600 bg-red-500/10 px-2.5 py-1 rounded-full">
                                {t('managers.blocked', 'Blocked')}
                            </span>
                        )
                    }
                },
            },
            {
                key: 'action',
                header: t('managers.action', 'Action'),
                render: (m) => (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="sm">
                                {t('managers.action', 'Action')} <ChevronDown className="h-3.5 w-3.5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white">
                            <DropdownMenuItem onClick={() => openEdit(m)}>
                                <Edit className="size-3.5" /> {t('managers.editDetails', 'Edit Details')}
                            </DropdownMenuItem>
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
                title={t('managers.title', 'Property Managers')}
                description={t('managers.description', 'Manage property managers and their details.')}
            />

            <div className="flex items-center justify-between gap-4">
                <SearchInput value={query.search ?? ''} placeholder={t('managers.searchPlaceholder', 'Search')} className="sm:w-80" />
                <Button onClick={openAdd}>
                    <Plus className="h-4 w-4" />
                    {t('managers.add', 'Add Manager')}
                </Button>
            </div>

            <DataTable
                loading={isLoading}
                columns={columns}
                data={data?.data ?? []}
                noun={t('managers.noun', 'managers')}
                emptyIcon={<UserCog className="h-6 w-6" />}
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
                        <DialogTitle>{isEditMode ? t('managers.edit', 'Edit Manager') : t('managers.add', 'Add Manager')}</DialogTitle>
                        <DialogDescription>
                            {isEditMode
                                ? t('managers.editDesc', `Modify details for {{name}}.`, {
                                      name: editingManager.user.name || 'Manager',
                                  })
                                : t('managers.addDesc', 'Enter the details of the new manager to register them in the management panel.')}
                        </DialogDescription>
                    </DialogHeader>

                    <ManagerForm
                        key={editingManager?.id ?? 'add'}
                        isEditMode={isEditMode}
                        defaultValues={
                            editingManager
                                ? {
                                      name: editingManager.user.name,
                                      email: editingManager.user.email,
                                      phone: editingManager.user.phone || '',
                                      image: editingManager.user.image || '',
                                      status: editingManager.user.banned ? 'banned' : 'active',
                                  }
                                : { name: '', email: '', phone: '', image: '', status: 'active', password: '12345678' }
                        }
                        onSubmit={handleSave}
                        onCancel={closeDialog}
                        submitLabel={
                            createMutation.isPending || updateMutation.isPending
                                ? t('managers.saving', 'Saving...')
                                : isEditMode
                                  ? t('managers.save', 'Save Changes')
                                  : t('managers.register', 'Register Manager')
                        }
                    />
                </DialogContent>
            </Dialog>
        </>
    )
}

function ManagerForm({
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
        status: 'active' | 'banned'
        password?: string
    }
    onSubmit: (values: z.infer<typeof managerSchema>) => Promise<void>
    onCancel: () => void
    submitLabel: string
    isEditMode: boolean
}) {
    const { t } = useTranslation()
    const form = useAppForm({
        defaultValues,
        validators: { onChange: managerSchema },
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
            <form.AppField name="image">{(field) => <field.FormAvatar folder="owner-manager" />}</form.AppField>

            <form.AppField name="name">
                {(field) => (
                    <field.FormInput label={t('managers.name', 'Full Name')} placeholder="e.g. Jane Cooper" disabled={isEditMode} />
                )}
            </form.AppField>

            <form.AppField name="email">
                {(field) => (
                    <field.FormInput
                        type="email"
                        label={t('managers.email', 'Email Address')}
                        placeholder="e.g. janecoper@gmail.com"
                        disabled={isEditMode}
                    />
                )}
            </form.AppField>

            <form.AppField name="phone">
                {(field) => <field.FormInput label={t('managers.phone', 'Phone Number')} placeholder="e.g. +1 416 555 0192" />}
            </form.AppField>

            {!isEditMode && (
                <form.AppField name="password">
                    {(field) => (
                        <field.FormInput type="password" label={t('auth.password', 'Password')} placeholder="e.g. at least 8 characters" />
                    )}
                </form.AppField>
            )}

            {isEditMode && (
                <form.AppField name="status">
                    {(field) => (
                        <div className="space-y-1.5">
                            <Label>{t('managers.status', 'Status')}</Label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 text-sm cursor-pointer">
                                    <input
                                        type="radio"
                                        checked={field.state.value === 'active'}
                                        onChange={() => field.handleChange('active')}
                                        className="h-4 w-4 accent-primary"
                                    />
                                    {t('managers.active', 'Active')}
                                </label>
                                <label className="flex items-center gap-2 text-sm cursor-pointer">
                                    <input
                                        type="radio"
                                        checked={field.state.value === 'banned'}
                                        onChange={() => field.handleChange('banned')}
                                        className="h-4 w-4 accent-primary"
                                    />
                                    {t('managers.blocked', 'Blocked')}
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
