import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { DataTableFooter } from '@/components/ui/data-table'
import { PageHeader } from '@/components/ui/page-header'
import { SearchInput } from '@/components/ui/search-input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { StatCard } from '@/components/ui/stat-card'
import { useSearchParams } from '@/hooks/use-search-params'
import type { GuestSupportTicket } from '@/lib/api'
import {
    guestSupportApi,
    GuestSupportTicketCategoryOptions,
    GuestSupportTicketPriorityOptions,
    GuestSupportTicketStatusOptions,
} from '@/lib/api'
import { capitalize } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { CheckCheck, CircleCheckBig, Clock, MessageSquare, SearchX, User, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

const TABS = ['All', ...GuestSupportTicketStatusOptions] as const

const searchSchema = z.object({
    page: z.number().default(1),
    limit: z.number().default(10),
    search: z.string().optional(),
    status: z.enum(GuestSupportTicketStatusOptions).optional(),
    category: z.enum(GuestSupportTicketCategoryOptions).optional(),
    priority: z.enum(GuestSupportTicketPriorityOptions).optional(),
})

export const Route = createFileRoute('/__main/guest-support/')({
    validateSearch: searchSchema,
    component: RouteComponent,
})

const STATUS_LABELS: Record<string, string> = {
    OPEN: 'Open',
    IN_PROGRESS: 'In Progress',
    RESOLVED: 'Resolved',
    CLOSED: 'Closed',
    SPAM: 'Spam',
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
        case 'SPAM':
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
    const query = Route.useSearch()
    const mergeSearch = useSearchParams()

    const { data, isLoading } = useQuery({
        queryKey: ['guest-support-tickets', query],
        queryFn: () => guestSupportApi.listTickets(query),
    })

    const tickets = data?.data ?? []
    const total = data?.meta.total ?? 0

    // Cache-shared with the list query (same page/limit/status); `search`,
    // `category` and `priority` are omitted so stat cards always reflect the
    // true status totals.
    const { data: openTickets } = useQuery({
        queryKey: ['guest-support-tickets', { page: 1, limit: 10, status: 'OPEN' }],
        queryFn: () => guestSupportApi.listTickets({ page: 1, limit: 10, status: 'OPEN' }),
    })

    const { data: inProgressTickets } = useQuery({
        queryKey: ['guest-support-tickets', { page: 1, limit: 10, status: 'IN_PROGRESS' }],
        queryFn: () => guestSupportApi.listTickets({ page: 1, limit: 10, status: 'IN_PROGRESS' }),
    })

    const { data: resolvedTickets } = useQuery({
        queryKey: ['guest-support-tickets', { page: 1, limit: 10, status: 'RESOLVED' }],
        queryFn: () => guestSupportApi.listTickets({ page: 1, limit: 10, status: 'RESOLVED' }),
    })

    const { data: closedTickets } = useQuery({
        queryKey: ['guest-support-tickets', { page: 1, limit: 10, status: 'CLOSED' }],
        queryFn: () => guestSupportApi.listTickets({ page: 1, limit: 10, status: 'CLOSED' }),
    })

    const hasActiveFilters = query.category !== undefined || query.priority !== undefined

    return (
        <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <PageHeader
                    title={t('guestSupport.title', 'Guest Support')}
                    description={t('guestSupport.description', 'Manage support requests from your guests')}
                    className="mb-0"
                />
                <SearchInput
                    value={query.search ?? ''}
                    placeholder={t('guestSupport.searchPlaceholder', 'Search guest, property, or subject...')}
                    className="w-full sm:w-80"
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label={t('guestSupport.statOpen', 'Open')}
                    value={openTickets?.meta.total ?? '-'}
                    icon={MessageSquare}
                    color="blue"
                />
                <StatCard
                    label={t('guestSupport.statInProgress', 'In Progress')}
                    value={inProgressTickets?.meta.total ?? '-'}
                    icon={Clock}
                    color="orange"
                />
                <StatCard
                    label={t('guestSupport.statResolved', 'Resolved')}
                    value={resolvedTickets?.meta.total ?? '-'}
                    icon={CheckCheck}
                    color="emerald"
                />
                <StatCard
                    label={t('guestSupport.statClosed', 'Closed')}
                    value={closedTickets?.meta.total ?? '-'}
                    icon={CircleCheckBig}
                    color="slate"
                />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <ButtonGroup>
                    {TABS.map((tab) => (
                        <Button
                            key={tab}
                            variant={tab === 'All' ? (!query.status ? 'default' : 'outline') : query.status === tab ? 'default' : 'outline'}
                            onClick={() => mergeSearch({ status: tab === 'All' ? undefined : tab, page: 1 })}
                        >
                            {STATUS_LABELS[tab] ?? tab}
                        </Button>
                    ))}
                </ButtonGroup>

                <div className="flex items-center gap-3">
                    <Select
                        value={query.category ?? 'all'}
                        onValueChange={(value) =>
                            mergeSearch({
                                category: value === 'all' ? undefined : value,
                                page: 1,
                            })
                        }
                    >
                        <SelectTrigger className="w-44">
                            <SelectValue placeholder={t('guestSupport.allCategories', 'All Categories')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('guestSupport.allCategories', 'All Categories')}</SelectItem>
                            {GuestSupportTicketCategoryOptions.map((c) => (
                                <SelectItem key={c} value={c}>
                                    {capitalize(c)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={query.priority ?? 'all'}
                        onValueChange={(value) =>
                            mergeSearch({
                                priority: value === 'all' ? undefined : value,
                                page: 1,
                            })
                        }
                    >
                        <SelectTrigger className="w-36">
                            <SelectValue placeholder={t('guestSupport.allPriorities', 'All Priorities')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">{t('guestSupport.allPriorities', 'All Priorities')}</SelectItem>
                            {GuestSupportTicketPriorityOptions.map((p) => (
                                <SelectItem key={p} value={p}>
                                    {capitalize(p)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {hasActiveFilters && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs text-muted-foreground"
                            onClick={() => mergeSearch({ category: undefined, priority: undefined, page: 1 })}
                        >
                            <X className="h-3 w-3 mr-1" />
                            {t('guestSupport.clear', 'Clear')}
                        </Button>
                    )}
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-16">
                    <Spinner className="h-8 w-8" />
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {tickets.map((ticket: GuestSupportTicket, index) => (
                        <Link
                            key={ticket.id}
                            to="/guest-support/$id"
                            params={{ id: ticket.id }}
                            className="group flex flex-col border rounded-xl gap-3 p-4 transition-all duration-200 hover:shadow-md hover:border-primary/20 hover:-translate-y-px"
                            style={{ animationDelay: `${index * 60}ms` }}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex flex-col gap-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-mono font-semibold text-primary">{ticket.reference}</span>
                                        <span
                                            className={`inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-md border ${getStatusClasses(ticket.status)}`}
                                        >
                                            {STATUS_LABELS[ticket.status] ?? ticket.status}
                                        </span>
                                        <span
                                            className={`inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-md border ${getPriorityClasses(ticket.priority)}`}
                                        >
                                            {ticket.priority}
                                        </span>
                                    </div>
                                    <h3 className="font-semibold text-foreground text-base group-hover:text-primary transition-colors truncate">
                                        {ticket.title}
                                    </h3>
                                </div>
                            </div>

                            <div className="flex items-center justify-between gap-4 text-xs text-muted-foreground">
                                <div className="flex items-center gap-3 min-w-0">
                                    <span className="flex items-center gap-1 truncate">
                                        <User className="w-3 h-3" />
                                        {ticket.guestName}
                                    </span>
                                    <span className="text-border">|</span>
                                    <span className="truncate">{ticket.propertyName ?? ticket.websiteName}</span>
                                    <span className="text-border">|</span>
                                    <span className="truncate">{ticket.category.replace(/_/g, ' ')}</span>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                    <Clock className="w-3 h-3" />
                                    <span>{formatTimeAgo(ticket.lastActivityAt)}</span>
                                </div>
                            </div>
                        </Link>
                    ))}

                    {tickets.length === 0 && (
                        <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
                            <div className="p-4 bg-muted rounded-2xl text-muted-foreground">
                                <SearchX className="h-8 w-8" />
                            </div>
                            <div className="max-w-xs">
                                <h3 className="font-semibold text-foreground text-base">
                                    {t('guestSupport.emptyTitle', 'No guest support tickets found')}
                                </h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {t('guestSupport.emptyDesc', 'No records matched your search or filters. Try adjusting your criteria.')}
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    mergeSearch({
                                        search: '',
                                        status: undefined,
                                        category: undefined,
                                        priority: undefined,
                                        page: 1,
                                        limit: 10,
                                    })
                                }
                            >
                                {t('guestSupport.resetFilters', 'Reset Filters')}
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
                    noun={t('guestSupport.noun', 'guest support tickets')}
                />
            )}
        </>
    )
}
