import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { DataTableFooter } from '@/components/ui/data-table'
import { Input } from '@/components/ui/input'
import { PageHeader } from '@/components/ui/page-header'
import { Spinner } from '@/components/ui/spinner'
import { StatCard } from '@/components/ui/stat-card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { guestSupportApi } from '@/lib/api'
import type { GuestSupportTicketCategory, GuestSupportTicketPriority } from '@/lib/api'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { CheckCheck, CircleCheckBig, Clock, MessageSquare, Search, SearchX, User, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

export const Route = createFileRoute('/__main/guest-support/')({
    component: RouteComponent,
})

const TABS = ['All', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as const
type Tab = (typeof TABS)[number]

const STATUS_LABELS: Record<string, string> = {
    OPEN: 'Open',
    IN_PROGRESS: 'In Progress',
    RESOLVED: 'Resolved',
    CLOSED: 'Closed',
}

const CATEGORIES: { value: GuestSupportTicketCategory; label: string }[] = [
    { value: 'GENERAL', label: 'General' },
    { value: 'BOOKING_ISSUE', label: 'Booking Issue' },
    { value: 'CHECK_IN_CHECK_OUT', label: 'Check-in / Check-out' },
    { value: 'CLEANLINESS', label: 'Cleanliness' },
    { value: 'AMENITIES', label: 'Amenities' },
    { value: 'BILLING', label: 'Billing' },
    { value: 'MAINTENANCE', label: 'Maintenance' },
    { value: 'COMPLAINT', label: 'Complaint' },
    { value: 'SPECIAL_REQUEST', label: 'Special Request' },
    { value: 'OTHER', label: 'Other' },
]

const PRIORITIES: { value: GuestSupportTicketPriority; label: string }[] = [
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
    { value: 'URGENT', label: 'Urgent' },
]

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
    const [activeTab, setActiveTab] = useState<Tab>('All')
    const [searchQuery, setSearchQuery] = useState('')
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(10)
    const [selectedCategory, setSelectedCategory] = useState<string>('all')
    const [selectedPriority, setSelectedPriority] = useState<string>('all')

    const queryParams = useMemo(() => {
        const params: Record<string, string | number | boolean | undefined> = { page, limit }
        if (activeTab !== 'All') params.status = activeTab
        if (searchQuery.trim()) params.search = searchQuery.trim()
        if (selectedCategory !== 'all') params.category = selectedCategory
        if (selectedPriority !== 'all') params.priority = selectedPriority
        return params
    }, [page, limit, activeTab, searchQuery, selectedCategory, selectedPriority])

    const { data, isLoading } = useQuery({
        queryKey: ['guest-support-tickets', queryParams],
        queryFn: () => guestSupportApi.listTickets(queryParams),
    })

    const tickets = data?.data ?? []
    const meta = data?.meta

    useEffect(() => {
        setPage(1)
    }, [activeTab, searchQuery, selectedCategory, selectedPriority])

    const { data: openCount } = useQuery({
        queryKey: ['guest-support-count', 'OPEN'],
        queryFn: () => guestSupportApi.listTickets({ limit: 1, page: 1, status: 'OPEN' }).then((r) => r.meta.total),
    })
    const { data: inProgressCount } = useQuery({
        queryKey: ['guest-support-count', 'IN_PROGRESS'],
        queryFn: () => guestSupportApi.listTickets({ limit: 1, page: 1, status: 'IN_PROGRESS' }).then((r) => r.meta.total),
    })
    const { data: resolvedCount } = useQuery({
        queryKey: ['guest-support-count', 'RESOLVED'],
        queryFn: () => guestSupportApi.listTickets({ limit: 1, page: 1, status: 'RESOLVED' }).then((r) => r.meta.total),
    })
    const { data: closedCount } = useQuery({
        queryKey: ['guest-support-count', 'CLOSED'],
        queryFn: () => guestSupportApi.listTickets({ limit: 1, page: 1, status: 'CLOSED' }).then((r) => r.meta.total),
    })

    const total = meta?.total ?? 0
    const hasActiveFilters = selectedCategory !== 'all' || selectedPriority !== 'all'

    return (
        <>
            {/* Header + Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <PageHeader title="Guest Support" description="Manage support requests from your guests" className="mb-0" />
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/75" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by guest, property, booking..."
                        className="pl-9 pr-8"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    )}
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Open" value={openCount ?? '-'} icon={MessageSquare} color="blue" />
                <StatCard label="In Progress" value={inProgressCount ?? '-'} icon={Clock} color="orange" />
                <StatCard label="Resolved" value={resolvedCount ?? '-'} icon={CheckCheck} color="emerald" />
                <StatCard label="Closed" value={closedCount ?? '-'} icon={CircleCheckBig} color="slate" />
            </div>

            {/* Tabs + Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <ButtonGroup>
                    {TABS.map((tab) => (
                        <Button key={tab} variant={activeTab === tab ? 'default' : 'outline'} onClick={() => setActiveTab(tab)}>
                            {STATUS_LABELS[tab] ?? tab}
                        </Button>
                    ))}
                </ButtonGroup>

                <div className="flex items-center gap-3">
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-44">
                            <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {CATEGORIES.map((cat) => (
                                <SelectItem key={cat.value} value={cat.value}>
                                    {cat.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                        <SelectTrigger className="w-36">
                            <SelectValue placeholder="All Priorities" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Priorities</SelectItem>
                            {PRIORITIES.map((p) => (
                                <SelectItem key={p.value} value={p.value}>
                                    {p.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {hasActiveFilters && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs text-muted-foreground"
                            onClick={() => {
                                setSelectedCategory('all')
                                setSelectedPriority('all')
                            }}
                        >
                            <X className="h-3 w-3 mr-1" />
                            Clear
                        </Button>
                    )}
                </div>
            </div>

            {/* Ticket Cards */}
            {isLoading ? (
                <div className="flex items-center justify-center py-16">
                    <Spinner className="h-8 w-8" />
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {tickets.map((ticket, index) => (
                        <Link
                            key={ticket.id}
                            to="/guest-support/$id"
                            params={{ id: ticket.id }}
                            className="group flex flex-col border rounded-xl gap-3 p-4 transition-all duration-200 hover:shadow-md hover:border-primary/20 hover:-translate-y-px"
                            style={{ animationDelay: `${index * 60}ms` }}
                        >
                            {/* Top row: reference + title + badges */}
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

                            {/* Bottom row: guest + property + category + time */}
                            <div className="flex items-center justify-between gap-4 text-xs text-muted-foreground">
                                <div className="flex items-center gap-3 min-w-0">
                                    <span className="flex items-center gap-1 truncate">
                                        <User className="w-3 h-3" />
                                        {ticket.guestName}
                                    </span>
                                    <span className="text-border">|</span>
                                    <span className="truncate">{ticket.propertyName}</span>
                                    {ticket.category && (
                                        <>
                                            <span className="text-border">|</span>
                                            <span className="truncate">{ticket.category.replace(/_/g, ' ')}</span>
                                        </>
                                    )}
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
                                <h3 className="font-semibold text-foreground text-base">No guest support tickets found</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    No records matched your search or filters. Try adjusting your criteria.
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setSearchQuery('')
                                    setActiveTab('All')
                                    setSelectedCategory('all')
                                    setSelectedPriority('all')
                                }}
                            >
                                Reset Filters
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {total > 0 && (
                <DataTableFooter
                    page={page}
                    limit={limit}
                    total={total}
                    onPageChange={setPage}
                    onLimitChange={setLimit}
                    noun="guest support tickets"
                />
            )}
        </>
    )
}
