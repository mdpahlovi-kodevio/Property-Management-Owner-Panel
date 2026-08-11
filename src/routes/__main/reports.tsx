import { defaultReportRange, ReportFilterBar } from '@/components/reports/report-filter-bar'
import type { DataTableColumn } from '@/components/ui/data-table'
import { DataTable } from '@/components/ui/data-table'
import { PageHeader } from '@/components/ui/page-header'
import { StatCardsGrid } from '@/components/ui/stat-card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useSearchParams } from '@/hooks/use-search-params'
import type { ArrivalRow, OccupancyRow, RevenueSourceRow } from '@/lib/api'
import { reportsApi } from '@/lib/api'
import { formatCurrency, formatPercent, formatReportDate, formatReportDateTime, formatSource, formatStatus, getArrivalsStatsCards, getOccupancyStatsCards, getRevenueStatsCards } from '@/lib/reports'
import { GetProperties, cn } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { BarChart3, BedDouble, CalendarDays } from 'lucide-react'
import { useMemo, useState } from 'react'
import * as z from 'zod'

const searchSchema = z.object({
    from: z.string().optional(),
    to: z.string().optional(),
    propertyId: z.string().optional(),
})

export const Route = createFileRoute('/__main/reports')({
    validateSearch: searchSchema,
    component: RouteComponent,
})

type ReportTab = 'occupancy' | 'revenue' | 'arrivals'

const REPORT_TABS: ReportTab[] = ['occupancy', 'revenue', 'arrivals']

const TAB_LABELS: Record<ReportTab, string> = {
    occupancy: 'Occupancy',
    revenue: 'Revenue by Source',
    arrivals: 'Arrivals / Departures',
}

const STATUS_BADGE: Record<string, string> = {
    PENDING: 'text-amber-600 bg-amber-500/10',
    CONFIRMED: 'text-emerald-600 bg-emerald-500/10',
    CHECKED_IN: 'text-blue-600 bg-blue-500/10',
    CHECKED_OUT: 'text-slate-600 bg-slate-500/10',
    NO_SHOW: 'text-rose-600 bg-rose-500/10',
}

function RouteComponent() {
    const query = Route.useSearch()
    const mergeSearch = useSearchParams()
    const properties = GetProperties()

    const [activeTab, setActiveTab] = useState<ReportTab>(() => {
        return (sessionStorage.getItem('reportsTab') as ReportTab) || 'arrivals'
    })

    const handleTabChange = (tab: ReportTab) => {
        setActiveTab(tab)
        sessionStorage.setItem('reportsTab', tab)
    }

    // Currency shown for money columns — the selected property's when narrowed,
    // otherwise the first property's (falling back to USD).
    const currency =
        (query.propertyId ? properties.find((p) => p.id === query.propertyId)?.currency : undefined) ??
        properties[0]?.currency ??
        'USD'

    const defaultRange = defaultReportRange()
    const filterParams = { from: query.from, to: query.to, propertyId: query.propertyId }

    const occupancyQuery = useQuery({
        queryKey: ['reports-occupancy', filterParams],
        queryFn: () => reportsApi.occupancy(filterParams),
        enabled: activeTab === 'occupancy',
    })

    const revenueQuery = useQuery({
        queryKey: ['reports-revenue', filterParams],
        queryFn: () => reportsApi.revenue(filterParams),
        enabled: activeTab === 'revenue',
    })

    const arrivalsQuery = useQuery({
        queryKey: ['reports-arrivals', filterParams],
        queryFn: () => reportsApi.arrivals(filterParams),
        enabled: activeTab === 'arrivals',
    })

    const handleReset = () => mergeSearch({ from: undefined, to: undefined, propertyId: undefined })

    const occupancyColumns = useMemo<DataTableColumn<OccupancyRow>[]>(
        () => [
            { key: 'date', header: 'Date', render: (r) => <span className="text-muted-foreground">{formatReportDate(r.date)}</span> },
            { key: 'availableRooms', header: 'Available Rooms', render: (r) => <span className="text-muted-foreground">{r.availableRooms}</span> },
            { key: 'occupied', header: 'Occupied', render: (r) => <span className="text-muted-foreground">{r.occupied}</span> },
            { key: 'occupancyRate', header: 'Occupancy %', render: (r) => <span className="text-muted-foreground">{formatPercent(r.occupancyRate)}</span> },
            { key: 'adr', header: 'ADR', render: (r) => <span className="text-muted-foreground">{formatCurrency(r.adr, currency)}</span> },
            { key: 'revpar', header: 'REVPAR', render: (r) => <span className="text-muted-foreground">{formatCurrency(r.revpar, currency)}</span> },
            { key: 'revenue', header: 'Revenue', render: (r) => <span className="text-muted-foreground">{formatCurrency(r.revenue, currency)}</span> },
        ],
        [currency],
    )

    const revenueColumns = useMemo<DataTableColumn<RevenueSourceRow>[]>(
        () => [
            { key: 'source', header: 'Booking Source', render: (r) => <span className="text-muted-foreground">{formatSource(r.source)}</span> },
            { key: 'bookings', header: 'Total Bookings', render: (r) => <span className="text-muted-foreground">{r.bookings}</span> },
            { key: 'totalRevenue', header: 'Total Revenue', render: (r) => <span className="text-muted-foreground">{formatCurrency(r.totalRevenue, currency)}</span> },
            { key: 'totalEarnings', header: 'Total Earnings', render: (r) => <span className="text-muted-foreground">{formatCurrency(r.totalEarnings, currency)}</span> },
            { key: 'expectedPayout', header: 'Expected Payout', render: (r) => <span className="text-muted-foreground">{formatCurrency(r.expectedPayout, currency)}</span> },
            {
                key: 'action',
                header: 'Action',
                render: (r) => (
                    <Link
                        to="/reports/$source"
                        params={{ source: r.source }}
                        search={{ from: query.from, to: query.to, propertyId: query.propertyId }}
                        className="inline-flex items-center justify-center whitespace-nowrap bg-[#24357B] hover:bg-[#24357B]/90 text-white rounded-md h-8 px-4 text-xs font-medium"
                    >
                        View
                    </Link>
                ),
            },
        ],
        [currency, query.from, query.to, query.propertyId],
    )

    const arrivalsColumns = useMemo<DataTableColumn<ArrivalRow>[]>(
        () => [
            { key: 'bookingRef', header: 'Booking ID', render: (r) => <span className="text-muted-foreground">#{r.bookingRef}</span> },
            { key: 'guest', header: 'Guest', render: (r) => <span className="text-muted-foreground">{r.guest}</span> },
            { key: 'propertyUnit', header: 'Property / Unit', render: (r) => <span className="text-muted-foreground">{r.propertyUnit}</span> },
            { key: 'checkIn', header: 'Check-in', render: (r) => <span className="text-muted-foreground">{formatReportDateTime(r.checkIn)}</span> },
            { key: 'checkOut', header: 'Check-out', render: (r) => <span className="text-muted-foreground">{formatReportDateTime(r.checkOut)}</span> },
            { key: 'nights', header: 'Nights', render: (r) => <span className="text-muted-foreground">{r.nights}</span> },
            { key: 'source', header: 'Source', render: (r) => <span className="text-muted-foreground">{formatSource(r.source)}</span> },
            {
                key: 'status',
                header: 'Status',
                render: (r) => (
                    <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full capitalize', STATUS_BADGE[r.status] ?? 'text-muted-foreground bg-muted')}>
                        {formatStatus(r.status)}
                    </span>
                ),
            },
        ],
        [],
    )

    const occupancyData = occupancyQuery.data?.data ?? []
    const revenueData = revenueQuery.data?.data ?? []
    const arrivalsData = arrivalsQuery.data?.data ?? []

    return (
        <>
            {/* Title + segmented tab switcher */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <PageHeader title="Reports" description="Track occupancy, revenue, and daily operations" className="mb-0" />

                <Tabs value={activeTab} onValueChange={(v) => handleTabChange(v as ReportTab)}>
                    <TabsList
                        variant="primary"
                        className="h-9 max-w-full overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    >
                        {REPORT_TABS.map((tab) => (
                            <TabsTrigger key={tab} value={tab} className="h-7 shrink-0 px-4 text-sm">
                                {TAB_LABELS[tab]}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
            </div>

            <ReportFilterBar
                initial={{ from: query.from ?? defaultRange.from, to: query.to ?? defaultRange.to, propertyId: query.propertyId }}
                properties={properties}
                onApply={(filters) => mergeSearch({ ...filters })}
                onReset={handleReset}
            />

            {activeTab === 'occupancy' && <StatCardsGrid cards={getOccupancyStatsCards(occupancyQuery.data, currency)} />}
            {activeTab === 'revenue' && <StatCardsGrid cards={getRevenueStatsCards(revenueQuery.data, currency)} />}
            {activeTab === 'arrivals' && <StatCardsGrid cards={getArrivalsStatsCards(arrivalsQuery.data)} />}

            {activeTab === 'occupancy' && (
                <DataTable
                    loading={occupancyQuery.isLoading}
                    columns={occupancyColumns}
                    data={occupancyData}
                    noun="reports"
                    emptyIcon={<BedDouble className="h-6 w-6" />}
                    page={1}
                    limit={occupancyData.length || 1}
                    total={occupancyData.length}
                    limitOptions={[occupancyData.length || 1]}
                    onReset={handleReset}
                />
            )}

            {activeTab === 'revenue' && (
                <DataTable
                    loading={revenueQuery.isLoading}
                    columns={revenueColumns}
                    data={revenueData}
                    noun="revenue sources"
                    emptyIcon={<BarChart3 className="h-6 w-6" />}
                    page={1}
                    limit={revenueData.length || 1}
                    total={revenueData.length}
                    limitOptions={[revenueData.length || 1]}
                    onReset={handleReset}
                />
            )}

            {activeTab === 'arrivals' && (
                <DataTable
                    loading={arrivalsQuery.isLoading}
                    columns={arrivalsColumns}
                    data={arrivalsData}
                    noun="arrivals"
                    emptyIcon={<CalendarDays className="h-6 w-6" />}
                    page={1}
                    limit={arrivalsData.length || 1}
                    total={arrivalsData.length}
                    limitOptions={[arrivalsData.length || 1]}
                    onReset={handleReset}
                />
            )}
        </>
    )
}
