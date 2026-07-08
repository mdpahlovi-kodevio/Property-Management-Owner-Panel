import { useAppForm } from '@/components/form/form-context'
import { Button } from '@/components/ui/button'
import type { DataTableColumn } from '@/components/ui/data-table'
import { DataTable } from '@/components/ui/data-table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import { PageHeader } from '@/components/ui/page-header'
import { SearchInput } from '@/components/ui/search-input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useSearchParams } from '@/hooks/use-search-params'
import type { CreateGuestPayload, Guest, UpdateGuestPayload } from '@/lib/api'
import { guestApi, resolveImage } from '@/lib/api'
import { GetWebsites } from '@/lib/utils'
import { useMutation, useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { ChevronDown, CircleCheck, CircleX, Edit, Plus, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { z } from 'zod'

const searchSchema = z.object({
    page: z.number().default(1),
    limit: z.number().default(10),
    search: z.string().optional(),
    websiteId: z.string().optional(),
})

export const Route = createFileRoute('/__main/user-management')({
    validateSearch: searchSchema,
    component: RouteComponent,
})

const guestSchema = z.object({
    name: z.string().min(2, 'Enter guest full name'),
    email: z.email('Enter a valid email address'),
    image: z.string(),
    phone: z.string(),
    websiteId: z.string().min(1, 'Select a website'),
    status: z.enum(['active', 'banned']),
    password: z.string().optional(),
})

function RouteComponent() {
    const { t } = useTranslation()
    const query = Route.useSearch()
    const mergeSearch = useSearchParams()
    const websites = GetWebsites()
    const [isOpen, setIsOpen] = useState(false)
    const [editingGuest, setEditingGuest] = useState<Guest | null>(null)

    const isEditMode = editingGuest !== null

    // Queries
    const { data, isLoading, refetch } = useQuery({
        queryKey: ['guests', query],
        queryFn: () => guestApi.list(query),
    })

    // Mutations
    const createMutation = useMutation({
        mutationFn: (payload: CreateGuestPayload) => guestApi.create(payload),
        onSuccess: () => {
            refetch()
            toast.success(t('user-management.createdSuccess', 'Guest registered successfully'))
            closeDialog()
        },
        onError: (error) => toast.error(error.message),
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdateGuestPayload }) => guestApi.update(id, payload),
        onSuccess: () => {
            refetch()
            toast.success(t('user-management.updatedSuccess', 'Guest updated successfully'))
            closeDialog()
        },
        onError: (error) => toast.error(error.message),
    })

    const toggleStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: 'active' | 'banned' }) => guestApi.update(id, { status }),
        onSuccess: () => {
            refetch()
            toast.success(t('user-management.statusUpdated', 'Guest status updated successfully'))
        },
        onError: (error) => toast.error(error.message),
    })

    const openAdd = () => {
        setEditingGuest(null)
        setIsOpen(true)
    }

    const openEdit = (guest: Guest) => {
        setEditingGuest(guest)
        setIsOpen(true)
    }

    const closeDialog = () => {
        setIsOpen(false)
        setEditingGuest(null)
    }

    const handleSave = async (values: z.infer<typeof guestSchema>) => {
        if (isEditMode) {
            await updateMutation.mutateAsync({
                id: editingGuest.id,
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
                websiteId: values.websiteId,
                password: values.password ?? '12345678',
            })
        }
    }

    const formatDate = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

    const columns: DataTableColumn<Guest>[] = useMemo(
        () => [
            {
                key: 'name',
                header: t('user-management.name', 'Name'),
                className: 'flex items-center gap-3 font-medium',
                render: (guest) => (
                    <>
                        <div className="size-8 rounded-full overflow-hidden shrink-0 bg-slate-100">
                            <img src={resolveImage(guest.user.image)} alt={guest.user.name} className="size-full object-cover" />
                        </div>
                        <span className="text-foreground">{guest.user.name}</span>
                    </>
                ),
            },
            {
                key: 'phone',
                header: t('user-management.phone', 'Phone Number'),
                render: (guest) => <span className="text-muted-foreground">{guest.user.phone || '-'}</span>,
            },
            {
                key: 'email',
                header: t('user-management.email', 'Email'),
                render: (guest) => <span className="text-muted-foreground">{guest.user.email}</span>,
            },
            {
                key: 'website',
                header: t('user-management.website', 'Website'),
                render: (guest) => <span className="text-muted-foreground">{guest.website.name || '-'}</span>,
            },
            {
                key: 'date',
                header: t('user-management.joiningDate', 'Joining Date'),
                render: (guest) => <span className="text-muted-foreground">{formatDate(guest.createdAt)}</span>,
            },
            {
                key: 'status',
                header: t('user-management.status', 'Status'),
                render: (guest) =>
                    guest.user.banned ? (
                        <span className="text-xs font-semibold text-red-600 bg-red-500/10 px-2.5 py-1 rounded-full">
                            {t('user-management.blocked', 'Blocked')}
                        </span>
                    ) : (
                        <span className="text-xs font-semibold text-green-600 bg-green-500/10 px-2.5 py-1 rounded-full">
                            {t('user-management.active', 'Active')}
                        </span>
                    ),
            },
            {
                key: 'action',
                header: t('user-management.action', 'Action'),
                render: (guest) => (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="sm">
                                {t('user-management.actionBtn', 'Action')} <ChevronDown className="h-3.5 w-3.5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white">
                            <DropdownMenuItem onClick={() => openEdit(guest)}>
                                <Edit className="size-3.5" /> {t('user-management.editDetails', 'Edit Details')}
                            </DropdownMenuItem>
                            {guest.user.banned ? (
                                <DropdownMenuItem
                                    variant="success"
                                    onClick={() => toggleStatusMutation.mutate({ id: guest.id, status: 'active' })}
                                >
                                    <CircleCheck className="size-3.5" /> {t('user-management.activate', 'Activate')}
                                </DropdownMenuItem>
                            ) : (
                                <DropdownMenuItem
                                    variant="destructive"
                                    onClick={() => toggleStatusMutation.mutate({ id: guest.id, status: 'banned' })}
                                >
                                    <CircleX className="size-3.5" /> {t('user-management.deactivate', 'Deactivate')}
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                ),
            },
        ],
        [t, toggleStatusMutation],
    )

    return (
        <>
            <PageHeader
                title={t('user-management.title', 'Users Management')}
                description={t('user-management.description', 'Manage your guest users across all websites.')}
            />

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <SearchInput
                        value={query.search ?? ''}
                        placeholder={t('user-management.searchPlaceholder', 'Search by name, email')}
                        className="sm:w-80"
                    />
                    <Select
                        value={query.websiteId ?? 'all'}
                        onValueChange={(value) => mergeSearch({ websiteId: value === 'all' ? undefined : value, page: 1 })}
                    >
                        <SelectTrigger className="sm:w-64 bg-white">
                            <SelectValue placeholder={t('user-management.filterByWebsite', 'Filter by website')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('user-management.allWebsites', 'All websites')}</SelectItem>
                            {websites.map((w) => (
                                <SelectItem key={w.id} value={w.id}>
                                    {w.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <Button onClick={openAdd}>
                    <Plus className="h-4 w-4" />
                    {t('user-management.addGuestBtn', 'Add Guest')}
                </Button>
            </div>

            <DataTable
                loading={isLoading}
                columns={columns}
                data={data?.data ?? []}
                noun={t('user-management.noun', 'guests')}
                emptyIcon={<Users className="h-6 w-6" />}
                page={query.page}
                limit={query.limit}
                total={data?.meta.total ?? 0}
                onReset={() => mergeSearch({ search: '', websiteId: '', page: 1, limit: 10 })}
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
                            {isEditMode ? t('user-management.editTitle', 'Edit Guest') : t('user-management.addTitle', 'Add Guest')}
                        </DialogTitle>
                        <DialogDescription>
                            {isEditMode
                                ? t('user-management.editDesc', 'Modify details for {{name}}.', {
                                      name: editingGuest?.user.name || 'Guest',
                                  })
                                : t('user-management.addDesc', 'Enter the details of the new guest to register them on your website.')}
                        </DialogDescription>
                    </DialogHeader>

                    <GuestForm
                        key={editingGuest?.id ?? 'add'}
                        defaultValues={
                            editingGuest
                                ? {
                                      name: editingGuest.user.name,
                                      email: editingGuest.user.email,
                                      phone: editingGuest.user.phone || '',
                                      image: editingGuest.user.image || '',
                                      websiteId: editingGuest.websiteId,
                                      status: editingGuest.user.banned ? 'banned' : 'active',
                                  }
                                : { name: '', email: '', phone: '', image: '', websiteId: '', status: 'active', password: '12345678' }
                        }
                        onSubmit={handleSave}
                        onCancel={closeDialog}
                        isEditMode={isEditMode}
                    />
                </DialogContent>
            </Dialog>
        </>
    )
}

function GuestForm({
    defaultValues,
    onSubmit,
    onCancel,
    isEditMode,
}: {
    defaultValues: {
        name: string
        email: string
        phone: string
        image: string
        websiteId: string
        status: 'active' | 'banned'
        password?: string
    }
    onSubmit: (values: z.infer<typeof guestSchema>) => Promise<void>
    onCancel: () => void
    isEditMode: boolean
}) {
    const { t } = useTranslation()
    const websites = GetWebsites()

    const form = useAppForm({
        defaultValues,
        validators: { onChange: guestSchema },
        onSubmit: async ({ value }) => await onSubmit(value),
    })

    const websiteOptions = useMemo(() => {
        return websites.map((w) => ({
            value: w.id,
            label: w.name,
        }))
    }, [websites])

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault()
                form.handleSubmit()
            }}
            className="space-y-4"
        >
            <form.AppField name="image">{(field) => <field.FormAvatar folder="guest" />}</form.AppField>

            <form.AppField name="name">
                {(field) => <field.FormInput label={t('user-management.fullName', 'Full Name')} placeholder="e.g. Jane Cooper" />}
            </form.AppField>

            <form.AppField name="email">
                {(field) => (
                    <field.FormInput
                        type="email"
                        label={t('user-management.emailLabel', 'Email Address')}
                        placeholder="e.g. janecoper@gmail.com"
                        disabled={isEditMode}
                    />
                )}
            </form.AppField>

            <form.AppField name="phone">
                {(field) => <field.FormInput label={t('user-management.phoneLabel', 'Phone Number')} placeholder="e.g. +1 416 555 0192" />}
            </form.AppField>

            {!isEditMode && (
                <form.AppField name="password">
                    {(field) => (
                        <field.FormInput type="password" label={t('auth.password', 'Password')} placeholder="e.g. at least 8 characters" />
                    )}
                </form.AppField>
            )}

            <form.AppField name="websiteId">
                {(field) => (
                    <field.FormSelect
                        label={t('user-management.website', 'Website')}
                        placeholder={t('user-management.selectWebsite', 'Select a website')}
                        options={websiteOptions}
                        disabled={isEditMode}
                    />
                )}
            </form.AppField>

            {isEditMode && (
                <form.AppField name="status">
                    {(field) => (
                        <div className="space-y-1.5">
                            <Label>{t('user-management.status', 'Status')}</Label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 text-sm cursor-pointer">
                                    <input
                                        type="radio"
                                        checked={field.state.value === 'active'}
                                        onChange={() => field.handleChange('active')}
                                        className="h-4 w-4 accent-primary"
                                    />
                                    {t('user-management.active', 'Active')}
                                </label>
                                <label className="flex items-center gap-2 text-sm cursor-pointer">
                                    <input
                                        type="radio"
                                        checked={field.state.value === 'banned'}
                                        onChange={() => field.handleChange('banned')}
                                        className="h-4 w-4 accent-primary"
                                    />
                                    {t('user-management.blocked', 'Blocked')}
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
                    <form.FormSubmit
                        label={
                            isEditMode
                                ? t('user-management.saveChanges', 'Save Changes')
                                : t('user-management.registerGuest', 'Register Guest')
                        }
                    />
                </form.AppForm>
            </DialogFooter>
        </form>
    )
}
