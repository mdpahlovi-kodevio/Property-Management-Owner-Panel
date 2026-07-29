import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { DataTableFooter } from '@/components/ui/data-table'
import { Input } from '@/components/ui/input'
import { PageHeader } from '@/components/ui/page-header'
import { Spinner } from '@/components/ui/spinner'
import { StatCard } from '@/components/ui/stat-card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { supportApi } from '@/lib/api'
import type { SupportTicketCategory, SupportTicketPriority } from '@/lib/api'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckCheck, CircleCheckBig, Clock, MessageSquare, Plus, Search, SearchX, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

export const Route = createFileRoute('/__main/support/')({
    component: RouteComponent,
})

const TABS = ['All', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as const

type Tab = (typeof TABS)[number]

const CATEGORIES: { value: SupportTicketCategory; label: string }[] = [
    { value: 'GENERAL', label: 'General' },
    { value: 'ACCOUNT', label: 'Account' },
    { value: 'BILLING', label: 'Billing' },
    { value: 'SUBSCRIPTION', label: 'Subscription' },
    { value: 'PROPERTY_MANAGEMENT', label: 'Property Management' },
    { value: 'WEBSITE_BUILDER', label: 'Website Builder' },
    { value: 'BOOKING_SYSTEM', label: 'Booking System' },
    { value: 'PAYMENT_GATEWAY', label: 'Payment Gateway' },
    { value: 'TECHNICAL', label: 'Technical' },
    { value: 'BUG_REPORT', label: 'Bug Report' },
    { value: 'FEATURE_REQUEST', label: 'Feature Request' },
]

const PRIORITIES: { value: SupportTicketPriority; label: string }[] = [
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
    { value: 'URGENT', label: 'Urgent' },
]

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
    const queryClient = useQueryClient()
    const [activeTab, setActiveTab] = useState<Tab>('All')
    const [searchQuery, setSearchQuery] = useState('')
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(10)
    const [isNewRequestOpen, setIsNewRequestOpen] = useState(false)

    // New ticket form state
    const [newTitle, setNewTitle] = useState('')
    const [newCategory, setNewCategory] = useState<SupportTicketCategory>('GENERAL')
    const [newPriority, setNewPriority] = useState<SupportTicketPriority>('MEDIUM')
    const [newDescription, setNewDescription] = useState('')

    const queryParams = useMemo(() => {
        const params: Record<string, string | number | boolean | undefined> = {
            page,
            limit,
        }
        if (activeTab !== 'All') params.status = activeTab
        if (searchQuery.trim()) params.search = searchQuery.trim()
        return params
    }, [page, limit, activeTab, searchQuery])

    const { data, isLoading } = useQuery({
        queryKey: ['support-tickets', queryParams],
        queryFn: () => supportApi.listTickets(queryParams),
    })

    const tickets = data?.data ?? []
    const meta = data?.meta

    // Reset page when filters change
    useEffect(() => {
        setPage(1)
    }, [activeTab, searchQuery])

    const { data: openCount } = useQuery({
        queryKey: ['support-tickets-count', 'OPEN'],
        queryFn: () => supportApi.listTickets({ limit: 1, page: 1, status: 'OPEN' }).then((r) => r.meta.total),
    })

    const { data: inProgressCount } = useQuery({
        queryKey: ['support-tickets-count', 'IN_PROGRESS'],
        queryFn: () => supportApi.listTickets({ limit: 1, page: 1, status: 'IN_PROGRESS' }).then((r) => r.meta.total),
    })

    const { data: resolvedCount } = useQuery({
        queryKey: ['support-tickets-count', 'RESOLVED'],
        queryFn: () => supportApi.listTickets({ limit: 1, page: 1, status: 'RESOLVED' }).then((r) => r.meta.total),
    })

    const { data: closedCount } = useQuery({
        queryKey: ['support-tickets-count', 'CLOSED'],
        queryFn: () => supportApi.listTickets({ limit: 1, page: 1, status: 'CLOSED' }).then((r) => r.meta.total),
    })

    const createMutation = useMutation({
        mutationFn: () =>
            supportApi.createTicket({
                title: newTitle,
                description: newDescription,
                category: newCategory,
                priority: newPriority,
            }),
        onSuccess: () => {
            toast.success('Support ticket created successfully')
            setIsNewRequestOpen(false)
            setNewTitle('')
            setNewDescription('')
            setNewCategory('GENERAL')
            setNewPriority('MEDIUM')
            queryClient.invalidateQueries({ queryKey: ['support-tickets'] })
            queryClient.invalidateQueries({ queryKey: ['support-tickets-count'] })
        },
        onError: (err: Error) => {
            toast.error(err.message || 'Failed to create support ticket')
        },
    })

    const total = meta?.total ?? 0

    return (
        <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <PageHeader title="Support Requests" description="Manage your Support requests to Admin" className="mb-0" />
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/75" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search tickets..."
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

            {/* Stat Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Open" value={openCount ?? '-'} icon={MessageSquare} color="blue" />
                <StatCard label="In Progress" value={inProgressCount ?? '-'} icon={Clock} color="orange" />
                <StatCard label="Resolved" value={resolvedCount ?? '-'} icon={CheckCheck} color="emerald" />
                <StatCard label="Closed" value={closedCount ?? '-'} icon={CircleCheckBig} color="slate" />
            </div>

            {/* Navigation and search control row */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <ButtonGroup>
                    {TABS.map((tab) => (
                        <Button key={tab} variant={activeTab === tab ? 'default' : 'outline'} onClick={() => setActiveTab(tab)}>
                            {STATUS_LABELS[tab] ?? tab}
                        </Button>
                    ))}
                </ButtonGroup>

                <Button onClick={() => setIsNewRequestOpen(true)}>
                    <Plus className="h-4 w-4" />
                    New Request
                </Button>
            </div>

            {/* List of Support Requests */}
            {isLoading ? (
                <div className="flex items-center justify-center py-16">
                    <Spinner className="h-8 w-8" />
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {tickets.map((ticket, index) => (
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
                                <h3 className="font-semibold text-foreground">No support requests found</h3>
                                <p className="text-sm text-muted-foreground">
                                    No records matched your search query or active filters. Try clearing your parameters!
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setSearchQuery('')
                                    setActiveTab('All')
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
                    noun="support requests"
                />
            )}

            {/* New Support Request Dialog */}
            <Dialog open={isNewRequestOpen} onOpenChange={setIsNewRequestOpen}>
                <DialogContent className="w-[95%] sm:max-w-150 bg-white p-8 rounded-lg gap-6">
                    <DialogHeader className="text-left mb-2">
                        <DialogTitle className="text-[22px] font-bold text-slate-900 mb-2">Submit Support Request</DialogTitle>
                        <DialogDescription className="text-[15px] text-slate-600 font-medium">
                            Describe your issue and we'll get back to you shortly
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col gap-6">
                        <div className="space-y-2.5">
                            <Label className="text-base font-semibold text-slate-900">Subject</Label>
                            <Input
                                placeholder="Enter subject"
                                className="h-12 rounded-lg border-slate-200 text-[15px]"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2.5">
                                <Label className="text-base font-semibold text-slate-900">Category</Label>
                                <Select value={newCategory} onValueChange={(v) => setNewCategory(v as SupportTicketCategory)}>
                                    <SelectTrigger className="h-12 rounded-lg border-slate-200 text-[15px]">
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CATEGORIES.map((cat) => (
                                            <SelectItem key={cat.value} value={cat.value}>
                                                {cat.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2.5">
                                <Label className="text-base font-semibold text-slate-900">Priority</Label>
                                <Select value={newPriority} onValueChange={(v) => setNewPriority(v as SupportTicketPriority)}>
                                    <SelectTrigger className="h-12 rounded-lg border-slate-200 text-[15px]">
                                        <SelectValue placeholder="Select priority" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PRIORITIES.map((p) => (
                                            <SelectItem key={p.value} value={p.value}>
                                                {p.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2.5">
                            <Label className="text-base font-semibold text-slate-900">Description</Label>
                            <Textarea
                                placeholder="Describe your issue in detail..."
                                className="min-h-35 rounded-lg border-slate-200 text-[15px] resize-none"
                                value={newDescription}
                                onChange={(e) => setNewDescription(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <Button
                                variant="outline"
                                onClick={() => setIsNewRequestOpen(false)}
                                className="h-12 rounded-lg font-semibold text-[15px] border-slate-200 text-slate-600 hover:bg-slate-50"
                            >
                                Cancel
                            </Button>
                            <Button
                                className="h-12 rounded-lg font-semibold text-[15px] bg-[#243E8B] hover:bg-[#1D3270] text-white"
                                disabled={!newTitle.trim() || !newDescription.trim() || createMutation.isPending}
                                onClick={() => createMutation.mutate()}
                            >
                                {createMutation.isPending ? 'Submitting...' : 'Submit Request'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
