import { useAppForm } from '@/components/form/form-context'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { DataTableFooter } from '@/components/ui/data-table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { PageHeader } from '@/components/ui/page-header'
import { SearchInput } from '@/components/ui/search-input'
import { Spinner } from '@/components/ui/spinner'
import { StatCard } from '@/components/ui/stat-card'
import { useSearchParams } from '@/hooks/use-search-params'
import type { CreateTicketPayload, SupportTicket, SupportTicketCategory, SupportTicketPriority } from '@/lib/api'
import { supportApi, SupportTicketCategoryOptions, SupportTicketPriorityOptions } from '@/lib/api'
import { capitalize } from '@/lib/utils'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { CheckCheck, CircleCheckBig, Clock, MessageSquare, Plus, SearchX } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { z } from 'zod'

const TABS = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as const

const searchSchema = z.object({
    page: z.number().default(1),
    limit: z.number().default(10),
    search: z.string().optional(),
    status: z.enum(TABS).optional(),
})

export const Route = createFileRoute('/__main/support/')({
    validateSearch: searchSchema,
    component: RouteComponent,
})

const ticketSchema = z.object({
    title: z.string().min(2, 'Enter a subject'),
    description: z.string().min(10, 'Please describe your issue in at least 10 characters'),
    category: z.enum(SupportTicketCategoryOptions),
    priority: z.enum(SupportTicketPriorityOptions),
})

const STATUS_LABELS: Record<string, string> = {
    OPEN: 'Open',
    IN_PROGRESS: 'In Progress',
    RESOLVED: 'Resolved',
    CLOSED: 'Closed',
    REJECTED: 'Rejected',
}

const getStatusClasses = (status: string) => {
    switch (status) {
        case 'OPEN':
            return 'text-blue-600 bg-blue-500/10'
        case 'IN_PROGRESS':
            return 'text-orange-600 bg-orange-500/10'
        case 'RESOLVED':
            return 'text-slate-600 bg-slate-500/10'
        case 'CLOSED':
            return 'text-green-600 bg-green-500/10'
        case 'REJECTED':
            return 'text-red-600 bg-red-500/10'
        default:
            return 'text-slate-600 bg-slate-500/10'
    }
}

const getPriorityClasses = (priority: string) => {
    switch (priority) {
        case 'URGENT':
            return 'text-red-600 bg-red-500/10'
        case 'HIGH':
            return 'text-orange-600 bg-orange-500/10'
        case 'MEDIUM':
            return 'text-blue-600 bg-blue-500/10'
        case 'LOW':
            return 'text-slate-600 bg-slate-500/10'
        default:
            return 'text-slate-600 bg-slate-500/10'
    }
}

function formatTimeAgo(dateString: string): string {
    const now = new Date()
    const date = new Date(dateString)
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
}

function RouteComponent() {
    const { t } = useTranslation()
    const queryClient = useQueryClient()
    const query = Route.useSearch()
    const mergeSearch = useSearchParams()
    const [isNewRequestOpen, setIsNewRequestOpen] = useState(false)

    const { data, isLoading } = useQuery({
        queryKey: ['support-tickets', query],
        queryFn: () => supportApi.listTickets(query),
    })

    const tickets = data?.data ?? []
    const total = data?.meta.total ?? 0

    // Cache-shared with the list query (same page/limit/status); `search` is
    // omitted so the stat card always reflects the true status total.
    const { data: openTickets } = useQuery({
        queryKey: ['support-tickets', { page: 1, limit: 10, status: 'OPEN' }],
        queryFn: () => supportApi.listTickets({ page: 1, limit: 10, status: 'OPEN' }),
    })

    const { data: inProgressTickets } = useQuery({
        queryKey: ['support-tickets', { page: 1, limit: 10, status: 'IN_PROGRESS' }],
        queryFn: () => supportApi.listTickets({ page: 1, limit: 10, status: 'IN_PROGRESS' }),
    })

    const { data: resolvedTickets } = useQuery({
        queryKey: ['support-tickets', { page: 1, limit: 10, status: 'RESOLVED' }],
        queryFn: () => supportApi.listTickets({ page: 1, limit: 10, status: 'RESOLVED' }),
    })

    const { data: closedTickets } = useQuery({
        queryKey: ['support-tickets', { page: 1, limit: 10, status: 'CLOSED' }],
        queryFn: () => supportApi.listTickets({ page: 1, limit: 10, status: 'CLOSED' }),
    })

    const createMutation = useMutation({
        mutationFn: (payload: CreateTicketPayload) => supportApi.createTicket(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['support-tickets'] })
            toast.success(t('support.createdSuccess', 'Support ticket created successfully'))
            setIsNewRequestOpen(false)
        },
        onError: (err: Error) => {
            toast.error(err.message || t('support.createError', 'Failed to create support ticket'))
        },
    })

    const handleCreate = async (values: z.infer<typeof ticketSchema>) => {
        await createMutation.mutateAsync({
            title: values.title,
            description: values.description,
            category: values.category,
            priority: values.priority,
        })
    }

    return (
        <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <PageHeader
                    title={t('support.title', 'Support Requests')}
                    description={t('support.description', 'Manage your Support requests to Admin')}
                    className="mb-0"
                />
                <SearchInput
                    value={query.search ?? ''}
                    placeholder={t('support.searchPlaceholder', 'Search tickets...')}
                    className="w-full sm:w-80"
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label={t('support.statOpen', 'Open')} value={openTickets?.meta.total ?? '-'} icon={MessageSquare} color="blue" />
                <StatCard
                    label={t('support.statInProgress', 'In Progress')}
                    value={inProgressTickets?.meta.total ?? '-'}
                    icon={Clock}
                    color="orange"
                />
                <StatCard
                    label={t('support.statResolved', 'Resolved')}
                    value={resolvedTickets?.meta.total ?? '-'}
                    icon={CheckCheck}
                    color="emerald"
                />
                <StatCard
                    label={t('support.statClosed', 'Closed')}
                    value={closedTickets?.meta.total ?? '-'}
                    icon={CircleCheckBig}
                    color="slate"
                />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <ButtonGroup>
                    <Button
                        key="all"
                        variant={!query.status ? 'default' : 'outline'}
                        onClick={() => mergeSearch({ status: undefined, page: 1 })}
                    >
                        All
                    </Button>
                    {TABS.map((tab) => (
                        <Button
                            key={tab}
                            variant={query.status === tab ? 'default' : 'outline'}
                            onClick={() => mergeSearch({ status: tab, page: 1 })}
                        >
                            {STATUS_LABELS[tab] ?? tab}
                        </Button>
                    ))}
                </ButtonGroup>

                <Button onClick={() => setIsNewRequestOpen(true)}>
                    <Plus className="h-4 w-4" />
                    {t('support.newRequestBtn', 'New Request')}
                </Button>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-16">
                    <Spinner className="h-8 w-8" />
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {tickets.map((ticket: SupportTicket, index) => (
                        <Link
                            key={ticket.id}
                            to="/support/$id"
                            params={{ id: ticket.id }}
                            className="flex flex-col border rounded-lg gap-2 p-4 animate-support-card-in transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:shadow-sm"
                            style={{ animationDelay: `${index * 80}ms` }}
                        >
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-primary">{ticket.reference}</span>
                                    <span className="font-semibold text-foreground text-lg">{ticket.title}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getPriorityClasses(ticket.priority)}`}>
                                        {ticket.priority}
                                    </span>
                                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusClasses(ticket.status)}`}>
                                        {STATUS_LABELS[ticket.status] ?? ticket.status}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between gap-4">
                                <div className="text-sm text-muted-foreground truncate">{ticket.description}</div>
                                <div className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
                                    <Clock className="w-3.5 h-3.5" />
                                    {formatTimeAgo(ticket.lastActivityAt)}
                                </div>
                            </div>
                        </Link>
                    ))}

                    {tickets.length === 0 && (
                        <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
                            <div className="p-3 bg-muted rounded-full text-muted-foreground animate-pulse">
                                <SearchX className="h-6 w-6" />
                            </div>
                            <div className="max-w-xs">
                                <h3 className="font-semibold text-foreground">{t('support.emptyTitle', 'No support requests found')}</h3>
                                <p className="text-sm text-muted-foreground">
                                    {t(
                                        'support.emptyDesc',
                                        'No records matched your search query or active filters. Try clearing your parameters!',
                                    )}
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => mergeSearch({ search: '', status: undefined, page: 1, limit: 10 })}
                            >
                                {t('support.resetFilters', 'Reset Filters')}
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {total > 0 && (
                <DataTableFooter
                    page={query.page}
                    limit={query.limit}
                    total={total}
                    onPageChange={(page) => mergeSearch({ page })}
                    onLimitChange={(limit) => mergeSearch({ page: 1, limit })}
                    noun={t('support.noun', 'support requests')}
                />
            )}

            <Dialog
                open={isNewRequestOpen}
                onOpenChange={(open) => {
                    if (!open) setIsNewRequestOpen(false)
                }}
            >
                <DialogContent className="sm:max-w-150">
                    <DialogHeader>
                        <DialogTitle>{t('support.newRequestTitle', 'Submit Support Request')}</DialogTitle>
                        <DialogDescription>
                            {t('support.newRequestDesc', "Describe your issue and we'll get back to you shortly")}
                        </DialogDescription>
                    </DialogHeader>

                    <NewTicketForm key="new" onSubmit={handleCreate} onCancel={() => setIsNewRequestOpen(false)} />
                </DialogContent>
            </Dialog>
        </>
    )
}

function NewTicketForm({
    onSubmit,
    onCancel,
}: {
    onSubmit: (values: z.infer<typeof ticketSchema>) => Promise<void>
    onCancel: () => void
}) {
    const { t } = useTranslation()

    const form = useAppForm({
        defaultValues: {
            title: '',
            description: '',
            category: 'GENERAL' as SupportTicketCategory,
            priority: 'MEDIUM' as SupportTicketPriority,
        },
        validators: { onChange: ticketSchema },
        onSubmit: async ({ value }) => {
            await onSubmit(value)
        },
    })

    const categoryOptions = SupportTicketCategoryOptions.map((c) => ({ value: c, label: capitalize(c) }))
    const priorityOptions = SupportTicketPriorityOptions.map((p) => ({ value: p, label: capitalize(p) }))

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault()
                form.handleSubmit()
            }}
            className="space-y-4"
        >
            <form.AppField name="title">
                {(field) => (
                    <field.FormInput
                        label={t('support.subject', 'Subject')}
                        placeholder={t('support.subjectPlaceholder', 'Enter subject')}
                    />
                )}
            </form.AppField>

            <div className="grid grid-cols-2 gap-4">
                <form.AppField name="category">
                    {(field) => (
                        <field.FormSelect
                            label={t('support.category', 'Category')}
                            placeholder={t('support.selectCategory', 'Select category')}
                            options={categoryOptions}
                        />
                    )}
                </form.AppField>

                <form.AppField name="priority">
                    {(field) => (
                        <field.FormSelect
                            label={t('support.priority', 'Priority')}
                            placeholder={t('support.selectPriority', 'Select priority')}
                            options={priorityOptions}
                        />
                    )}
                </form.AppField>
            </div>

            <form.AppField name="description">
                {(field) => (
                    <field.FormTextarea
                        label={t('support.descriptionLabel', 'Description')}
                        placeholder={t('support.descriptionPlaceholder', 'Describe your issue in detail...')}
                    />
                )}
            </form.AppField>

            <DialogFooter>
                <Button type="button" variant="outline" onClick={onCancel} className="px-4 py-2 text-sm cursor-pointer">
                    {t('nav.cancel', 'Cancel')}
                </Button>
                <form.AppForm>
                    <form.FormSubmit label={t('support.submitRequest', 'Submit Request')} />
                </form.AppForm>
            </DialogFooter>
        </form>
    )
}
