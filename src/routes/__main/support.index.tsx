import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { DataTableFooter } from '@/components/ui/data-table'
import { PageHeader } from '@/components/ui/page-header'
import { SearchInput } from '@/components/ui/search-input'
import { StatCard } from '@/components/ui/stat-card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { createFileRoute, Link } from '@tanstack/react-router'
import { CheckCheck, CircleCheckBig, Clock, MessageSquare, Plus, SearchX } from 'lucide-react'
import { useMemo, useState } from 'react'

export const Route = createFileRoute('/__main/support/')({
    component: RouteComponent,
})

const INITIAL_REQUESTS = [
    {
        id: '#123',
        title: 'Payment issue',
        property: 'Sunrise Apartments — Maintenance',
        status: 'Open',
        timeAgo: '2h ago',
    },
    {
        id: '#124',
        title: 'Unable to access dashboard',
        property: 'Sunrise Apartments — Maintenance',
        status: 'In Progress',
        timeAgo: '2h ago',
    },
    {
        id: '#125',
        title: 'Late payment complaint',
        property: 'Sunrise Apartments — Maintenance',
        status: 'Close',
        timeAgo: '2h ago',
    },
    {
        id: '#126',
        title: 'System notification problem',
        property: 'Sunrise Apartments — Maintenance',
        status: 'Open',
        timeAgo: '2h ago',
    },
]

const TABS = ['All', 'Open', 'In Progress', 'Resolved', 'Close'] as const

type Tab = (typeof TABS)[number]

const getStatusClasses = (status: string) => {
    switch (status) {
        case 'Open':
            return 'text-blue-600 bg-blue-500/10'
        case 'In Progress':
            return 'text-orange-600 bg-orange-500/10'
        case 'Resolved':
            return 'text-slate-600 bg-slate-500/10'
        case 'Close':
            return 'text-green-600 bg-green-500/10'
        case 'Urgent':
            return 'text-red-600 bg-red-500/10'
        default:
            return 'text-slate-600 bg-slate-500/10'
    }
}

function RouteComponent() {
    const [requests] = useState(INITIAL_REQUESTS)
    const [activeTab, setActiveTab] = useState<Tab>('All')
    const [searchQuery, setSearchQuery] = useState('')
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(10)
    const [isNewRequestOpen, setIsNewRequestOpen] = useState(false)

    const filteredRequests = useMemo(() => {
        let result = [...requests]

        if (activeTab !== 'All') {
            result = result.filter((r) => r.status === activeTab)
        }

        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase()
            result = result.filter(
                (r) =>
                    r.title.toLowerCase().includes(query) || r.property.toLowerCase().includes(query) || r.id.toLowerCase().includes(query),
            )
        }

        return result
    }, [requests, activeTab, searchQuery])

    // Reset to page 1 when filters change
    useMemo(() => {
        setPage(1)
    }, [filteredRequests.length])

    const paginatedRequests = useMemo(() => {
        const start = (page - 1) * limit
        return filteredRequests.slice(start, start + limit)
    }, [filteredRequests, page, limit])

    const total = filteredRequests.length

    // List View
    return (
        <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <PageHeader title="Support" description="Manage your Support" className="mb-0" />
                <SearchInput value={searchQuery} onValueChange={setSearchQuery} placeholder="Search" className="sm:w-80" />
            </div>

            {/* Stat Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Open" value="12" icon={MessageSquare} color="blue" />
                <StatCard label="In Progress" value="8" icon={Clock} color="orange" />
                <StatCard label="Resolved" value="100" icon={CheckCheck} color="emerald" />
                <StatCard label="Closed" value="142" icon={CircleCheckBig} color="slate" />
            </div>

            {/* Navigation and search control row */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <ButtonGroup>
                    {TABS.map((tab) => (
                        <Button key={tab} variant={activeTab === tab ? 'default' : 'outline'} onClick={() => setActiveTab(tab)}>
                            {tab}
                        </Button>
                    ))}
                </ButtonGroup>

                <Button onClick={() => setIsNewRequestOpen(true)}>
                    <Plus className="h-4 w-4" />
                    New Request
                </Button>
            </div>

            {/* List of Support Requests */}
            <div className="flex flex-col gap-4">
                {paginatedRequests.map((req, index) => (
                    <Link
                        key={req.id}
                        to="/support/$id"
                        params={{ id: req.id }}
                        className="flex flex-col border rounded-lg gap-2 p-4 animate-support-card-in transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:shadow-sm"
                        style={{ animationDelay: `${index * 80}ms` }}
                    >
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-primary">{req.id}</span>
                                <span className="font-semibold text-foreground text-lg">{req.title}</span>
                            </div>
                            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusClasses(req.status)}`}>
                                {req.status}
                            </span>
                        </div>

                        <div className="flex items-center justify-between gap-4">
                            <div className="text-sm text-muted-foreground">{req.property}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {req.timeAgo}
                            </div>
                        </div>
                    </Link>
                ))}

                {filteredRequests.length === 0 && (
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
                        <Button variant="outline" size="sm" onClick={() => setSearchQuery('')}>
                            Reset Filters
                        </Button>
                    </div>
                )}
            </div>

            <DataTableFooter
                page={page}
                limit={limit}
                total={total}
                onPageChange={setPage}
                onLimitChange={setLimit}
                noun="support requests"
            />

            {/* New Support Request Dialog */}
            <Dialog open={isNewRequestOpen} onOpenChange={setIsNewRequestOpen}>
                <DialogContent className="w-[95%] sm:max-w-[600px] bg-white p-8 rounded-2xl gap-6">
                    <DialogHeader className="text-left mb-2">
                        <DialogTitle className="text-[22px] font-bold text-slate-900 mb-2">Submit Support Request</DialogTitle>
                        <DialogDescription className="text-[15px] text-slate-600 font-medium">Drag and drop your files here</DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col gap-6">
                        <div className="space-y-2.5">
                            <Label className="text-base font-semibold text-slate-900">Subject</Label>
                            <Input placeholder="Enter subject" className="h-12 rounded-lg border-slate-200 text-[15px]" />
                        </div>

                        <div className="space-y-2.5">
                            <Label className="text-base font-semibold text-slate-900">Priority</Label>
                            <Select>
                                <SelectTrigger className="h-12 rounded-lg border-slate-200 text-[15px] text-slate-500">
                                    <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="urgent">Urgent</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2.5">
                            <Label className="text-base font-semibold text-slate-900">Employee</Label>
                            <Select>
                                <SelectTrigger className="h-12 rounded-lg border-slate-200 text-[15px] text-slate-500">
                                    <SelectValue placeholder="Select employee name" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="john">John Doe</SelectItem>
                                    <SelectItem value="jane">Jane Smith</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2.5">
                            <Label className="text-base font-semibold text-slate-900">Description</Label>
                            <Textarea placeholder="Typing" className="min-h-[140px] rounded-lg border-slate-200 text-[15px] resize-none" />
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <Button variant="outline" onClick={() => setIsNewRequestOpen(false)} className="h-12 rounded-lg font-semibold text-[15px] border-slate-200 text-slate-600 hover:bg-slate-50">
                                Cancel
                            </Button>
                            <Button className="h-12 rounded-lg font-semibold text-[15px] bg-[#243E8B] hover:bg-[#1D3270] text-white">
                                Submit Request
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
