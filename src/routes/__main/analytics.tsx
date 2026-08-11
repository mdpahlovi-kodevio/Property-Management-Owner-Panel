import { Button } from '@/components/ui/button'
import { DataTable  } from '@/components/ui/data-table'
import type {DataTableColumn} from '@/components/ui/data-table';
import { PageHeader } from '@/components/ui/page-header'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { StatCardsGrid  } from '@/components/ui/stat-card'
import type {StatCardProps} from '@/components/ui/stat-card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    analyticsApi,
    bookingApi,
    overviewApi,
    reportsApi
} from '@/lib/api'
import type {ArrivalRow, Booking, OccupancyReport, OccupancyRow, OperationsReport, OverviewReport, Paginated, RevenueReport, RevenueSourceRow, TrendGranularity} from '@/lib/api';
import {
    formatCurrency,
    formatPercent,
    formatReportDate,
    formatSource,
    formatStatus,
    getArrivalsStatsCards,
    getOccupancyStatsCards,
    getRevenueStatsCards,
} from '@/lib/reports'
import { useSearchParams } from '@/hooks/use-search-params'
import { GetProperties, cn } from '@/lib/utils'
import { useQuery  } from '@tanstack/react-query'
import type {UseQueryResult} from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router'
import { BedDouble, CalendarDays, CircleDollarSign, Download, Hotel, TrendingUp } from 'lucide-react'
import { useMemo, useState } from 'react'
import * as z from 'zod'
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'

const searchSchema = z.object({
    // .min/.catch guard against hand-edited URLs (?limit=0 or non-numeric).
    page: z.number().min(1).default(1).catch(1),
    limit: z.number().min(1).default(10).catch(10),
})

export const Route = createFileRoute('/__main/analytics')({
    validateSearch: searchSchema,
    component: AnalyticsPage,
})

/** Clamps the requested page to the table's actual page count. */
function safePage(page: number, limit: number, total: number): number {
    const totalPages = Math.max(1, Math.ceil(total / limit))
    return Math.min(Math.max(page, 1), totalPages)
}

/** Client-side slice of a full-array response for the current page. */
function slicePage<T>(rows: T[], page: number, limit: number): T[] {
    const from = (page - 1) * limit
    return rows.slice(from, from + limit)
}

// ── Period / date helpers ────────────────────────────────────

const PERIOD_OPTIONS = [
    { value: '7d', label: 'Last 7 days', days: 7 },
    { value: '30d', label: 'Last 30 days', days: 30 },
    { value: '90d', label: 'Last 90 days', days: 90 },
] as const

type PeriodValue = (typeof PERIOD_OPTIONS)[number]['value']

/** Local-timezone YYYY-MM-DD string (avoids UTC off-by-one). */
function toDateInputValue(d: Date): string {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
}

/** Inclusive [today - days + 1, today] window. */
function periodRange(days: number): { from: string; to: string } {
    const to = new Date()
    const from = new Date()
    from.setDate(to.getDate() - (days - 1))
    return { from: toDateInputValue(from), to: toDateInputValue(to) }
}

/** ISO string → local YYYY-MM-DD (for grouping guest flow by day). */
function toLocalDateStr(iso: string): string {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return iso.slice(0, 10)
    return toDateInputValue(d)
}

/** Download an array of objects as a CSV file. */
function downloadCsv<T extends object>(filename: string, rows: T[]) {
    if (!rows.length) return
    const headers = Object.keys(rows[0])
    const escape = (v: unknown) => {
        const s = String(v ?? '')
        return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
    }
    const csv = [headers.join(','), ...rows.map((r) => headers.map((h) => escape((r as Record<string, unknown>)[h])).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
}

const CHANNEL_COLORS: Record<string, string> = {
    DIRECT: '#6366f1',
    MANUAL: '#20c77a',
    OTA: '#f4a51c',
    API: '#0ea5a5',
}

const STATUS_BADGE: Record<string, string> = {
    PENDING: 'text-amber-600 bg-amber-500/10',
    CONFIRMED: 'text-emerald-600 bg-emerald-500/10',
    CHECKED_IN: 'text-blue-600 bg-blue-500/10',
    CHECKED_OUT: 'text-slate-600 bg-slate-500/10',
    NO_SHOW: 'text-rose-600 bg-rose-500/10',
    CANCELLED: 'text-rose-600 bg-rose-500/10',
    EXPIRED: 'text-slate-600 bg-slate-500/10',
}

// ── Page ─────────────────────────────────────────────────────

function AnalyticsPage() {
    const [period, setPeriod] = useState<PeriodValue>('30d')
    const [propertyId, setPropertyId] = useState('all')
    const [granularity, setGranularity] = useState<TrendGranularity>('daily')
    const [tab, setTab] = useState(() => sessionStorage.getItem('analyticsTab') ?? 'overview')
    const handleTabChange = (nextTab: string) => {
        setTab(nextTab)
        sessionStorage.setItem('analyticsTab', nextTab)
    }

    const properties = GetProperties()
    const search = Route.useSearch()
    const mergeSearch = useSearchParams()
    const currency =
        (propertyId !== 'all' ? properties.find((p) => p.id === propertyId)?.currency : undefined) ??
        properties[0]?.currency ??
        'USD'

    const handlePropertyChange = (value: string) => {
        setPropertyId(value)
        mergeSearch({ page: 1 })
    }
    const handlePeriodChange = (value: PeriodValue) => {
        setPeriod(value)
        mergeSearch({ page: 1 })
    }

    const range = useMemo(() => periodRange(PERIOD_OPTIONS.find((p) => p.value === period)!.days), [period])
    const filterParams = useMemo(
        () => ({ from: range.from, to: range.to, propertyId: propertyId === 'all' ? undefined : propertyId }),
        [range, propertyId],
    )

    const overviewQuery = useQuery({
        queryKey: ['analytics-overview', filterParams, granularity],
        queryFn: () => overviewApi.overview({ ...filterParams, granularity }),
        enabled: tab === 'overview',
    })

    const occupancyQuery = useQuery({
        queryKey: ['analytics-occupancy', filterParams],
        queryFn: () => reportsApi.occupancy(filterParams),
        enabled: tab === 'occupancy',
    })

    const revenueQuery = useQuery({
        queryKey: ['analytics-revenue', filterParams],
        queryFn: () => reportsApi.revenue(filterParams),
        enabled: tab === 'revenue',
    })

    const operationsQuery = useQuery({
        queryKey: ['analytics-operations', filterParams],
        queryFn: () => analyticsApi.operations(filterParams),
        enabled: tab === 'operations',
    })

    const recentQuery = useQuery({
        queryKey: ['analytics-recent', { propertyId: filterParams.propertyId }],
        queryFn: () => bookingApi.list({ page: 1, limit: 6, propertyId: filterParams.propertyId }),
        enabled: tab === 'operations',
    })

    return (
        <main className="space-y-6 text-foreground">
            <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <PageHeader
                    title="Analytics"
                    description="Monitor performance Overview, booking channels, occupancy, and guest operations."
                />
                <div className="flex flex-wrap gap-2">
                    <Select value={propertyId} onValueChange={handlePropertyChange}>
                        <SelectTrigger className="h-9 w-44 text-xs">
                            <Hotel className="mr-2 size-3.5 text-muted-foreground" />
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Properties</SelectItem>
                            {properties.map((p) => (
                                <SelectItem key={p.id} value={p.id}>
                                    {p.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={period} onValueChange={handlePeriodChange}>
                        <SelectTrigger className="h-9 w-36 text-xs">
                            <CalendarDays className="mr-2 size-3.5 text-muted-foreground" />
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {PERIOD_OPTIONS.map((p) => (
                                <SelectItem key={p.value} value={p.value}>
                                    {p.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </header>

            <Tabs value={tab} onValueChange={handleTabChange} className="w-full">
                <div className="overflow-x-auto rounded-xl border bg-card p-1 shadow-sm scrollbar-auto [&::-webkit-scrollbar]:hidden">
                    <TabsList variant="primary" className="h-10 min-w-max gap-1 p-1">
                        <TabsTrigger value="overview" className="h-8 gap-2 px-3 text-xs">
                            <TrendingUp className="size-3.5" />
                            Overview
                        </TabsTrigger>
                        <TabsTrigger value="occupancy" className="h-8 gap-2 px-3 text-xs">
                            <BedDouble className="size-3.5" />
                            Occupancy
                        </TabsTrigger>
                        <TabsTrigger value="revenue" className="h-8 gap-2 px-3 text-xs">
                            <CircleDollarSign className="size-3.5" />
                            <span className="sm:hidden">Revenue</span>
                            <span className="hidden sm:inline">Revenue & channels</span>
                        </TabsTrigger>
                        <TabsTrigger value="operations" className="h-8 gap-2 px-3 text-xs">
                            <CalendarDays className="size-3.5" />
                            <span className="sm:hidden">Operations</span>
                            <span className="hidden sm:inline">Guest operations</span>
                        </TabsTrigger>
                    </TabsList>
                </div>
            </Tabs>

            {tab === 'overview' && <OverviewTab query={overviewQuery} currency={currency} granularity={granularity} setGranularity={setGranularity} />}
            {tab === 'occupancy' && (
                <OccupancyTab query={occupancyQuery} currency={currency} range={range} page={search.page} limit={search.limit} />
            )}
            {tab === 'revenue' && (
                <RevenueTab
                    query={revenueQuery}
                    currency={currency}
                    range={range}
                    filterParams={filterParams}
                    page={search.page}
                    limit={search.limit}
                />
            )}
            {tab === 'operations' && (
                <OperationsTab query={operationsQuery} recentQuery={recentQuery} currency={currency} range={range} page={search.page} limit={search.limit} />
            )}
        </main>
    )
}

// ── Overview tab ─────────────────────────────────────────────

function OverviewTab({
    query,
    currency,
    granularity,
    setGranularity,
}: {
    query: UseQueryResult<OverviewReport, Error>
    currency: string
    granularity: TrendGranularity
    setGranularity: (g: TrendGranularity) => void
}) {
    const data = query.data
    const m = data?.metrics
    const trend = data?.trend ?? []

    const spark = (key: 'revenue' | 'bookings') => trend.slice(-6).map((t) => t[key])

    const metricCards: StatCardProps[] = [
        {
            label: 'Gross booking value',
            value: m ? formatCurrency(m.grossBookingValue, currency) : '—',
            icon: CircleDollarSign,
            color: 'blue',
        },
        {
            label: 'Occupancy Rate',
            value: m ? formatPercent(m.occupancyRate) : '—',
            icon: BedDouble,
            color: 'emerald',
        },
        {
            label: 'ADR (Avg. Daily Rate)',
            value: m ? formatCurrency(m.adr, currency) : '—',
            icon: TrendingUp,
            color: 'amber',
        },
        {
            label: 'Confirmed bookings',
            value: m ? m.confirmedBookings.toLocaleString() : '—',
            icon: CalendarDays,
            color: 'rose',
        },
    ]

    const channelShare = useMemo(() => {
        const total = (data?.channels ?? []).reduce((s, c) => s + c.revenue, 0) || 1
        return (data?.channels ?? []).map((c) => ({
            ...c,
            pct: Math.round((c.revenue / total) * 100),
            color: CHANNEL_COLORS[c.source] ?? '#94a3b8',
        }))
    }, [data])

    const isLoading = query.isLoading
    const isEmpty = !isLoading && (!trend.length || (m && m.grossBookingValue === 0 && m.confirmedBookings === 0))

    if (query.isError) return <ErrorNote message={query.error.message} />

    return (
        <>
            {isLoading ? (
                <Skeleton className="h-24 w-full" />
            ) : (
                <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                    {metricCards.map((card, i) => (
                        <SparkCard key={card.label} card={card} sparkline={spark(i === 3 ? 'bookings' : 'revenue')} />
                    ))}
                </section>
            )}

            {isEmpty && (
                <Panel title="No data in this period" subtitle="Try widening the date range or clearing the property filter.">
                    <p className="text-sm text-muted-foreground">No bookings recorded in the selected window yet.</p>
                </Panel>
            )}

            {!isLoading && !isEmpty && (
                <section className="grid gap-5 xl:grid-cols-[1.65fr_1fr]">
                    <Panel
                        title="Revenue & Booking Pace"
                        subtitle="Daily performance overview"
                        action={
                            <Tabs value={granularity} onValueChange={(v) => setGranularity(v as TrendGranularity)}>
                                <TabsList variant="primary" className="h-7 p-0.5">
                                    <TabsTrigger value="daily" className="h-6 px-2.5 text-[10px]">
                                        Daily
                                    </TabsTrigger>
                                    <TabsTrigger value="weekly" className="h-6 px-2.5 text-[10px]">
                                        Weekly
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>
                        }
                    >
                        <div className="h-64">
                            {trend.length ? (
                                <ResponsiveContainer>
                                    <LineChart data={trend} margin={{ top: 12, right: 12, left: -18, bottom: 0 }}>
                                        <CartesianGrid vertical={false} stroke="#e7eaf3" />
                                        <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={10} />
                                        <YAxis yAxisId="rev" tickLine={false} axisLine={false} fontSize={10} />
                                        <YAxis yAxisId="bk" orientation="right" tickLine={false} axisLine={false} fontSize={10} />
                                        <Tooltip
                                            formatter={(value: unknown, name: unknown) =>
                                                name === 'Revenue' ? formatCurrency(Number(value ?? 0), currency) : String(value ?? '')
                                            }
                                        />
                                        <Line yAxisId="rev" name="Revenue" dataKey="revenue" type="monotone" stroke="#6b6af5" strokeWidth={3} dot={false} />
                                        <Line yAxisId="bk" name="Bookings" dataKey="bookings" type="monotone" stroke="#20c987" strokeWidth={2} dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <ChartEmpty />
                            )}
                        </div>
                    </Panel>
                    <Panel title="Channel Distribution" subtitle="Revenue share by booking source">
                        <div className="flex h-64 flex-col items-center justify-center gap-3 sm:flex-row">
                            {channelShare.length ? (
                                <>
                                    <ResponsiveContainer width={155} height={155}>
                                        <PieChart>
                                            <Pie data={channelShare} dataKey="revenue" nameKey="source" innerRadius={43} outerRadius={64} paddingAngle={5}>
                                                {channelShare.map((item) => (
                                                    <Cell key={item.source} fill={item.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value: unknown) => formatCurrency(Number(value ?? 0), currency)} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="w-44 space-y-2">
                                        {channelShare.map((channel) => (
                                            <div key={channel.source} className="flex items-center justify-between text-[10px]">
                                                <span className="flex items-center gap-1.5 text-muted-foreground">
                                                    <span className="size-2 rounded-full" style={{ backgroundColor: channel.color }} />
                                                    {formatSource(channel.source)}
                                                </span>
                                                <span className="font-bold text-foreground">{channel.pct}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <ChartEmpty />
                            )}
                        </div>
                    </Panel>
                </section>
            )}
        </>
    )
}

// ── Occupancy tab ────────────────────────────────────────────

function OccupancyTab({
    query,
    currency,
    range,
    page,
    limit,
}: {
    query: UseQueryResult<OccupancyReport, Error>
    currency: string
    range: { from: string; to: string }
    page: number
    limit: number
}) {
    const report = query.data
    const rows: OccupancyRow[] = report?.data ?? []
    const currentPage = safePage(page, limit, rows.length)
    const pagedRows = slicePage(rows, currentPage, limit)
    const summary = report?.summary
    const last = rows[rows.length - 1]
    const availableRooms = last.availableRooms
    const peak = rows.reduce<OccupancyRow | null>((a, b) => (b.occupied > (a?.occupied ?? -1) ? b : a), null)
    const low = rows.reduce<OccupancyRow | null>((a, b) => (b.occupied < (a?.occupied ?? Infinity) ? b : a), null)

    const chartData = rows.map((r) => ({ date: formatReportDate(r.date), occupancyRate: r.occupancyRate }))

    const columns = useMemo<DataTableColumn<OccupancyRow>[]>(
        () => [
            { key: 'date', header: 'Date', render: (r) => <span className="text-muted-foreground">{formatReportDate(r.date)}</span> },
            { key: 'availableRooms', header: 'Available Rooms', render: (r) => <span className="text-muted-foreground">{r.availableRooms}</span> },
            { key: 'occupied', header: 'Occupied', render: (r) => <span className="font-semibold text-foreground">{r.occupied}</span> },
            {
                key: 'occupancyRate',
                header: 'Occupancy %',
                render: (r) => (
                    <span className="flex items-center gap-2">
                        <span className="text-muted-foreground">{formatPercent(r.occupancyRate)}</span>
                        <span className="inline-block h-1.5 w-16 rounded-full bg-muted align-middle">
                            <span className="block h-full rounded-full bg-indigo-500" style={{ width: `${r.occupancyRate}%` }} />
                        </span>
                    </span>
                ),
            },
            { key: 'adr', header: 'ADR', render: (r) => <span className="text-muted-foreground">{formatCurrency(r.adr, currency)}</span> },
            { key: 'revpar', header: 'REVPAR', render: (r) => <span className="text-muted-foreground">{formatCurrency(r.revpar, currency)}</span> },
            { key: 'revenue', header: 'Revenue', render: (r) => <span className="text-right font-semibold text-foreground">{formatCurrency(r.revenue, currency)}</span> },
        ],
        [currency],
    )

    if (query.isError) return <ErrorNote message={query.error.message} />

    return (
        <>
            <SectionLabel title="Occupancy Report" badge={range.from !== range.to ? `${range.from} → ${range.to}` : range.from} />
            <StatCardsGrid cards={getOccupancyStatsCards(report, currency)} />
            <section className="grid gap-5 xl:grid-cols-[1.65fr_1fr]">
                <Panel title="Occupancy rate" subtitle="Share of available rooms booked each day">
                    <div className="h-60">
                        {query.isLoading ? (
                            <Skeleton className="h-full w-full" />
                        ) : chartData.length ? (
                            <ResponsiveContainer>
                                <LineChart data={chartData} margin={{ top: 12, right: 12, left: -18 }}>
                                    <CartesianGrid vertical={false} stroke="#e7eaf3" />
                                    <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={10} />
                                    <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tickLine={false} axisLine={false} fontSize={10} />
                                    <Tooltip formatter={(value: unknown) => formatPercent(Number(value ?? 0))} />
                                    <Line name="Occupancy" dataKey="occupancyRate" stroke="#6b6af5" strokeWidth={2.5} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <ChartEmpty />
                        )}
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                            <span className="size-2 rounded-full bg-primary" />
                            Occupancy
                        </span>
                        <span>Period average: {summary ? formatPercent(summary.occupancyRate) : '—'}</span>
                    </div>
                </Panel>
                <Panel title="Occupancy Overview" subtitle="Current period breakdown">
                    <div className="space-y-5 pt-4">
                        <ProgressRow label="Rooms Occupied (today)" value={`${last.occupied } / ${availableRooms}`} percent={ (last.occupied / Math.max(availableRooms, 1)) * 100 } color="#6366f1" />
                        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, @typescript-eslint/no-unnecessary-condition
                        <ProgressRow label="Available tonight" value={`${Math.max(availableRooms - (last.occupied), 0)} / ${availableRooms}`} percent={ ((availableRooms - last.occupied) / Math.max(availableRooms, 1)) * 100 } color="#20c77a" />
                        <ProgressRow label="Peak Occupancy" value={peak ? `${peak.occupied} / ${peak.availableRooms}` : '—'} percent={peak ? (peak.occupied / Math.max(peak.availableRooms, 1)) * 100 : 0} color="#f4a51c" />
                        <ProgressRow label="Low Occupancy Day" value={low ? `${low.occupied} / ${low.availableRooms}` : '—'} percent={low ? (low.occupied / Math.max(low.availableRooms, 1)) * 100 : 0} color="#f44f75" />
                        <div className="grid grid-cols-2 gap-3 pt-1">
                            <MiniValue label="Average nightly rate" value={summary ? formatCurrency(summary.adr, currency) : '—'} tone="violet" />
                            <MiniValue label="REVPAR" value={summary ? formatCurrency(summary.revpar, currency) : '—'} tone="mint" />
                        </div>
                    </div>
                </Panel>
            </section>

            <Panel
                title="Daily Occupancy Breakdown"
                subtitle="Per-day metrics for the current period"
                action={
                    <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => downloadCsv(`occupancy-${range.from}-${range.to}.csv`, rows)}>
                        <Download className="mr-1.5 size-3.5" />
                        Export
                    </Button>
                }
            >
                <DataTable
                    loading={query.isLoading}
                    columns={columns}
                    data={pagedRows}
                    noun="days"
                    emptyIcon={<BedDouble className="h-6 w-6" />}
                    page={currentPage}
                    limit={limit}
                    total={rows.length}
                    limitOptions={[10, 25, 50]}
                />
            </Panel>
        </>
    )
}

// ── Revenue tab ──────────────────────────────────────────────

function RevenueTab({
    query,
    currency,
    range,
    filterParams,
    page,
    limit,
}: {
    query: UseQueryResult<RevenueReport, Error>
    currency: string
    range: { from: string; to: string }
    filterParams: { from: string; to: string; propertyId?: string }
    page: number
    limit: number
}) {
    const report = query.data
    const rows: RevenueSourceRow[] = report?.data ?? []
    const currentPage = safePage(page, limit, rows.length)
    const pagedRows = slicePage(rows, currentPage, limit)

    const barData = rows.map((r) => ({ source: formatSource(r.source), totalRevenue: r.totalRevenue, totalEarnings: r.totalEarnings }))

    const shareData = useMemo(() => {
        const total = rows.reduce((s, r) => s + r.bookings, 0) || 1
        return rows.map((r) => ({ name: formatSource(r.source), value: r.bookings, pct: Math.round((r.bookings / total) * 100), color: CHANNEL_COLORS[r.source] ?? '#94a3b8' }))
    }, [rows])

    const columns = useMemo<DataTableColumn<RevenueSourceRow>[]>(
        () => [
            {
                key: 'source',
                header: 'Booking Source',
                render: (r) => (
                    <span className="flex items-center gap-2 font-medium">
                        <span className="size-1.5 rounded-full" style={{ backgroundColor: CHANNEL_COLORS[r.source] ?? '#94a3b8' }} />
                        {formatSource(r.source)}
                    </span>
                ),
            },
            { key: 'bookings', header: 'Total Bookings', render: (r) => <span className="text-muted-foreground">{r.bookings}</span> },
            { key: 'totalRevenue', header: 'Total Revenue', render: (r) => <span className="font-semibold text-foreground">{formatCurrency(r.totalRevenue, currency)}</span> },
            { key: 'totalEarnings', header: 'Total Earnings', render: (r) => <span className="text-muted-foreground">{formatCurrency(r.totalEarnings, currency)}</span> },
            { key: 'expectedPayout', header: 'Expected Payout', render: (r) => <span className="text-muted-foreground">{formatCurrency(r.expectedPayout, currency)}</span> },
            {
                key: 'action',
                header: 'Action',
                render: (r) => (
                    <Link
                        to="/reports/$source"
                        params={{ source: r.source }}
                        search={{ from: filterParams.from, to: filterParams.to, propertyId: filterParams.propertyId }}
                        className="inline-flex h-8 items-center justify-center whitespace-nowrap rounded-md bg-[#24357B] px-4 text-xs font-medium text-white hover:bg-[#24357B]/90"
                    >
                        View
                    </Link>
                ),
            },
        ],
        [currency, filterParams.from, filterParams.to, filterParams.propertyId],
    )

    if (query.isError) return <ErrorNote message={query.error.message} />

    return (
        <>
            <SectionLabel title="Revenue by Source" badge={range.from !== range.to ? `${range.from} → ${range.to}` : range.from} />
            <StatCardsGrid cards={getRevenueStatsCards(report, currency)} />
            <section className="grid gap-5 xl:grid-cols-[1.65fr_1fr]">
                <Panel title="Revenue by Booking Source" subtitle="Gross value vs. owner earnings per channel">
                    <div className="h-64">
                        {query.isLoading ? (
                            <Skeleton className="h-full w-full" />
                        ) : barData.some((d) => d.totalRevenue > 0) ? (
                            <ResponsiveContainer>
                                <BarChart data={barData} margin={{ top: 12, right: 8, left: -20 }}>
                                    <CartesianGrid vertical={false} stroke="#e7eaf3" />
                                    <XAxis dataKey="source" tickLine={false} axisLine={false} fontSize={10} />
                                    <YAxis tickLine={false} axisLine={false} fontSize={10} />
                                    <Tooltip formatter={(value: unknown) => formatCurrency(Number(value ?? 0), currency)} />
                                    <Bar name="Total Revenue" dataKey="totalRevenue" fill="#6366f1" radius={[3, 3, 0, 0]} />
                                    <Bar name="Owner Earnings" dataKey="totalEarnings" fill="#20c77a" radius={[3, 3, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <ChartEmpty />
                        )}
                    </div>
                </Panel>
                <Panel title="Booking Share" subtitle="Reservations by channel">
                    <div className="flex h-64 flex-col items-center justify-center gap-2 sm:flex-row">
                        {shareData.some((d) => d.value > 0) ? (
                            <>
                                <ResponsiveContainer width={150} height={150}>
                                    <PieChart>
                                        <Pie data={shareData} dataKey="value" nameKey="name" innerRadius={38} outerRadius={62} paddingAngle={4}>
                                            {shareData.map((item) => (
                                                <Cell key={item.name} fill={item.color} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="w-40 space-y-2">
                                    {shareData.map((item) => (
                                        <div key={item.name} className="flex items-center justify-between text-[10px]">
                                            <span className="flex items-center gap-1.5 text-muted-foreground">
                                                <span className="size-2 rounded-full" style={{ backgroundColor: item.color }} />
                                                {item.name}
                                            </span>
                                            <span className="font-bold text-foreground">{item.pct}%</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <ChartEmpty />
                        )}
                    </div>
                </Panel>
            </section>

            <Panel
                title="Booking Source Breakdown"
                subtitle="Revenue and earnings per channel"
                action={
                    <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => downloadCsv(`revenue-${range.from}-${range.to}.csv`, rows)}>
                        <Download className="mr-1.5 size-3.5" />
                        Export
                    </Button>
                }
            >
                <DataTable
                    loading={query.isLoading}
                    columns={columns}
                    data={pagedRows}
                    noun="revenue sources"
                    emptyIcon={<CircleDollarSign className="h-6 w-6" />}
                    page={currentPage}
                    limit={limit}
                    total={rows.length}
                    limitOptions={[10, 25, 50]}
                />
            </Panel>
        </>
    )
}

// ── Operations tab ───────────────────────────────────────────

function OperationsTab({
    query,
    recentQuery,
    currency,
    range,
    page,
    limit,
}: {
    query: UseQueryResult<OperationsReport, Error>
    recentQuery: UseQueryResult<Paginated<Booking>, Error>
    currency: string
    range: { from: string; to: string }
    page: number
    limit: number
}) {
    const report = query.data
    const arrivals: ArrivalRow[] = report?.arrivals ?? []
    const summary = report?.summary
    const addons = report?.addons ?? []
    const heatmap = report?.heatmap ?? []
    const maxAddon = addons.reduce((m, a) => Math.max(m, a.revenue), 0)

    const guestFlow = useMemo(() => {
        const byDay = new Map<string, { arrivals: number; departures: number }>()
        for (const a of arrivals) {
            const ci = toLocalDateStr(a.checkIn)
            const co = toLocalDateStr(a.checkOut)
            const dayIn = byDay.get(ci) ?? { arrivals: 0, departures: 0 }
            dayIn.arrivals += 1
            byDay.set(ci, dayIn)
            const dayOut = byDay.get(co) ?? { arrivals: 0, departures: 0 }
            dayOut.departures += 1
            byDay.set(co, dayOut)
        }
        return [...byDay.entries()]
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, v]) => ({ day: formatReportDate(date), ...v }))
    }, [arrivals])

    const statusSummary = useMemo(() => {
        const counts = new Map<string, number>()
        for (const a of arrivals) counts.set(a.status, (counts.get(a.status) ?? 0) + 1)
        const total = arrivals.length || 1
        const row = (statuses: string[], label: string, color: string) => {
            const n = statuses.reduce((s, st) => s + (counts.get(st) ?? 0), 0)
            return { label, value: String(n), percent: Math.round((n / total) * 100), color }
        }
        return [
            row(['CHECKED_IN'], 'Checked-in', '#20c77a'),
            row(['CONFIRMED', 'PENDING'], 'Pending arrival', '#f4a51c'),
            row(['CHECKED_OUT'], 'Departed', '#6366f1'),
            row(['NO_SHOW'], 'No-shows', '#f44f75'),
        ]
    }, [arrivals])

    const sortedArrivals = useMemo(() => [...arrivals].sort((a, b) => a.checkIn.localeCompare(b.checkIn)), [arrivals])
    const currentPage = safePage(page, limit, sortedArrivals.length)
    const pagedArrivals = slicePage(sortedArrivals, currentPage, limit)

    const arrivalsColumns = useMemo<DataTableColumn<ArrivalRow>[]>(
        () => [
            { key: 'bookingRef', header: 'Booking ID', render: (r) => <span className="font-semibold text-foreground">#{r.bookingRef}</span> },
            { key: 'guest', header: 'Guest', render: (r) => <span className="font-medium">{r.guest}</span> },
            { key: 'propertyUnit', header: 'Property / Unit', render: (r) => <span className="text-muted-foreground">{r.propertyUnit}</span> },
            { key: 'checkIn', header: 'Check-in', render: (r) => <span className="text-muted-foreground">{formatReportDate(toLocalDateStr(r.checkIn))}</span> },
            { key: 'checkOut', header: 'Check-out', render: (r) => <span className="text-muted-foreground">{formatReportDate(toLocalDateStr(r.checkOut))}</span> },
            { key: 'nights', header: 'Nights', render: (r) => <span className="text-muted-foreground">{r.nights}</span> },
            { key: 'source', header: 'Source', render: (r) => <span className="text-muted-foreground">{formatSource(r.source)}</span> },
            {
                key: 'status',
                header: 'Status',
                render: (r) => (
                    <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold capitalize', STATUS_BADGE[r.status] ?? 'text-muted-foreground bg-muted')}>
                        {formatStatus(r.status)}
                    </span>
                ),
            },
        ],
        [],
    )

    const recentRows = recentQuery.data?.data ?? []
    const recentColumns = useMemo<DataTableColumn<(typeof recentRows)[number]>[]>(
        () => [
            { key: 'id', header: 'Ref ID', render: (r) => <span className="font-semibold text-foreground">#{r.id.slice(-6).toUpperCase()}</span> },
            { key: 'guest', header: 'Guest', render: (r) => <span className="font-medium">{r.guest.user.name}</span> },
            { key: 'property', header: 'Property / Room', render: (r) => <span className="text-muted-foreground">{`${r.property.name} / ${r.unit.roomNumber}`}</span> },
            { key: 'stay', header: 'Stay Dates', render: (r) => <span className="text-muted-foreground">{`${formatReportDate(toLocalDateStr(r.checkInDate))} — ${formatReportDate(toLocalDateStr(r.checkOutDate))}`}</span> },
            { key: 'source', header: 'Channel', render: (r) => <span className="text-muted-foreground">{formatSource(r.source)}</span> },
            { key: 'grandTotal', header: 'Price', render: (r) => <span className="font-semibold">{formatCurrency(Number(r.grandTotal), r.currency)}</span> },
            {
                key: 'status',
                header: 'Status',
                render: (r) => (
                    <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold capitalize', STATUS_BADGE[r.status] ?? 'text-muted-foreground bg-muted')}>
                        {formatStatus(r.status)}
                    </span>
                ),
            },
            {
                key: 'action',
                header: '',
                render: (r) => (
                    <Link
                        to="/reservations/$id"
                        params={{ id: r.id }}
                        className="inline-flex h-8 items-center justify-center rounded-md bg-[#24357B] px-3 text-xs font-medium text-white hover:bg-[#24357B]/90"
                    >
                        View
                    </Link>
                ),
            },
        ],
        [],
    )

    const heatCells = heatmap.slice(-35)

    if (query.isError || recentQuery.isError) return <ErrorNote message={query.error?.message ?? recentQuery.error?.message} />

    return (
        <>
            <SectionLabel title="Arrivals & Departures" badge={range.from !== range.to ? `${range.from} → ${range.to}` : range.from} />
            <StatCardsGrid
                cards={getArrivalsStatsCards({
                    data: arrivals,
                    summary: summary ?? { arrivalsToday: 0, departuresToday: 0, inHouse: 0, noShows: 0 },
                })}
            />
            <section className="grid gap-5 xl:grid-cols-[1.65fr_1fr]">
                <Panel title="Guest Flow — Arrivals vs Departures" subtitle="Movement across the selected period">
                    <div className="h-60">
                        {query.isLoading ? (
                            <Skeleton className="h-full w-full" />
                        ) : guestFlow.length ? (
                            <ResponsiveContainer>
                                <BarChart data={guestFlow} margin={{ top: 12, right: 8, left: -20 }}>
                                    <CartesianGrid vertical={false} stroke="#e7eaf3" />
                                    <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={9} />
                                    <YAxis tickLine={false} axisLine={false} fontSize={10} />
                                    <Tooltip />
                                    <Bar dataKey="arrivals" name="Arrivals" fill="#6366f1" radius={[3, 3, 0, 0]} />
                                    <Bar dataKey="departures" name="Departures" fill="#f44f75" radius={[3, 3, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <ChartEmpty />
                        )}
                    </div>
                </Panel>
                <Panel title="Status Summary" subtitle="Guest status split in the period">
                    <div className="space-y-5 pt-4">
                        {statusSummary.map((row) => (
                            <ProgressRow key={row.label} {...row} />
                        ))}
                        <div className="grid grid-cols-2 gap-3">
                            <MiniValue label="Avg. Stay" value={arrivals.length ? `${(arrivals.reduce((s, a) => s + a.nights, 0) / arrivals.length).toFixed(1)} nights` : '—'} tone="violet" />
                            <MiniValue label="Sources" value={`${new Set(arrivals.map((a) => a.source)).size} channels`} tone="rose" />
                        </div>
                    </div>
                </Panel>
            </section>

            <Panel title="Arrivals & Departures" subtitle="Guest movement in the selected period">
                <DataTable
                    loading={query.isLoading}
                    columns={arrivalsColumns}
                    data={pagedArrivals}
                    noun="arrivals"
                    emptyIcon={<CalendarDays className="h-6 w-6" />}
                    page={currentPage}
                    limit={limit}
                    total={sortedArrivals.length}
                    limitOptions={[10, 25, 50]}
                />
            </Panel>

            <section className="grid gap-5 xl:grid-cols-2">
                <Panel title="Occupancy Heatmap" subtitle="Daily inventory snapshot for the selected period">
                    {query.isLoading ? (
                        <Skeleton className="h-32 w-full" />
                    ) : heatCells.length ? (
                        <>
                            <div className="grid grid-cols-7 gap-2 pt-5">
                                {heatCells.map((cell) => (
                                    <div
                                        key={cell.date}
                                        className="flex h-7 items-center justify-center rounded-md text-[8px] font-semibold"
                                        style={{ backgroundColor: heatColor(cell.occupancyRate) }}
                                        title={`${cell.date} — ${cell.occupied}/${cell.availableRooms} occupied`}
                                    >
                                        {cell.occupied}
                                    </div>
                                ))}
                            </div>
                            <div className="mt-3 flex justify-between text-[10px] text-muted-foreground">
                                <span>Less Busy</span>
                                <span>Fully Booked</span>
                            </div>
                        </>
                    ) : (
                        <ChartEmpty />
                    )}
                </Panel>
                <Panel title="Ancillary Revenue" subtitle="Add-ons & extra services breakdown">
                    {query.isLoading ? (
                        <Skeleton className="h-32 w-full" />
                    ) : addons.length ? (
                        <div className="space-y-6 pt-5">
                            {addons.map((a) => (
                                <ProgressRow
                                    key={a.name}
                                    label={a.name}
                                    value={formatCurrency(a.revenue, currency)}
                                    percent={maxAddon ? Math.round((a.revenue / maxAddon) * 100) : 0}
                                    color="#6366f1"
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="pt-5">
                            <ChartEmpty />
                        </div>
                    )}
                </Panel>
            </section>

            <Panel title="Recent Reservations" subtitle="Latest bookings across the selected property">
                <DataTable
                    loading={recentQuery.isLoading}
                    columns={recentColumns}
                    data={recentRows}
                    noun="reservations"
                    emptyIcon={<CalendarDays className="h-6 w-6" />}
                    page={1}
                    limit={recentRows.length || 1}
                    total={recentRows.length}
                    limitOptions={[recentRows.length || 1]}
                />
            </Panel>
        </>
    )
}

// ── Shared UI atoms ──────────────────────────────────────────

function Panel({ title, subtitle, action, children }: { title: string; subtitle: string; action?: React.ReactNode; children: React.ReactNode }) {
    return (
        <section className="rounded-xl border bg-card p-5 text-card-foreground shadow-sm">
            <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                    <h2 className="text-sm font-semibold tracking-tight text-foreground">{title}</h2>
                    <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
                </div>
                {action}
            </div>
            {children}
        </section>
    )
}

function SparkCard({ card, sparkline }: { card: StatCardProps; sparkline: number[] }) {
    const colors = { blue: '#6366f1', emerald: '#20b979', amber: '#f2a721', rose: '#f24f73' }
    const color = colors[card.color as keyof typeof colors]
    const heights = sparkline.length
        ? sparkline.map((v, _i, arr) => {
              const max = Math.max(...arr) || 1
              const min = Math.min(...arr)
              const range = max - min || 1
              return 20 + ((v - min) / range) * 80
          })
        : [30, 40, 35, 55, 45, 70]
    return (
        <div className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex items-start justify-between">
                <span className="flex size-8 items-center justify-center rounded-md bg-muted" style={{ color }}>
                    <card.icon className="size-4" />
                </span>
            </div>
            <p className="mt-3 text-[10px] font-medium text-muted-foreground">{card.label}</p>
            <p className="mt-0.5 text-xl font-bold tracking-tight text-foreground">{card.value}</p>
            <div className="mt-3 flex h-5 items-end gap-1">
                {heights.map((height, i) => (
                    <span key={i} className="w-full rounded-sm" style={{ height: `${height}%`, backgroundColor: color, opacity: 0.25 + (i / heights.length) * 0.75 }} />
                ))}
            </div>
        </div>
    )
}

function ProgressRow({ label, value, percent, color }: { label: string; value: string; percent: number; color: string }) {
    return (
        <div>
            <div className="mb-1.5 flex justify-between text-[10px]">
                <span className="font-medium text-muted-foreground">{label}</span>
                <span className="font-semibold text-foreground">{value}</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted">
                <div className="h-full rounded-full" style={{ width: `${Math.min(percent, 100)}%`, backgroundColor: color }} />
            </div>
        </div>
    )
}

function MiniValue({ label, value, tone }: { label: string; value: string; tone: 'violet' | 'mint' | 'rose' }) {
    const backgrounds = { violet: 'bg-indigo-50 text-indigo-600', mint: 'bg-emerald-50 text-emerald-600', rose: 'bg-rose-50 text-rose-600' }
    return (
        <div className={`rounded-md p-3 ${backgrounds[tone]}`}>
            <p className="text-[9px] opacity-70">{label}</p>
            <p className="mt-1 text-sm font-bold">{value}</p>
        </div>
    )
}

function SectionLabel({ title, badge }: { title: string; badge: string }) {
    return (
        <div className="flex items-center gap-2 pt-2">
            <span className="h-4 w-1 rounded-full bg-emerald-500" />
            <h2 className="text-sm font-bold text-foreground">{title}</h2>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-semibold text-primary">{badge}</span>
        </div>
    )
}

function ErrorNote({ message }: { message?: string }) {
    return (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <p className="text-sm font-medium text-destructive">Failed to load analytics data</p>
            <p className="text-xs text-muted-foreground">{message ?? 'Please try again.'}</p>
        </div>
    )
}

function ChartEmpty() {
    return (
        <div className="flex h-full min-h-32 flex-col items-center justify-center gap-1 text-center">
            <p className="text-xs font-medium text-muted-foreground">No data for this period</p>
            <p className="text-[10px] text-muted-foreground/70">Try widening the date range.</p>
        </div>
    )
}

function heatColor(rate: number): string {
    if (rate >= 80) return '#6366f1'
    if (rate >= 60) return '#818cf8'
    if (rate >= 40) return '#a5b4fc'
    if (rate >= 20) return '#c7d2fe'
    return '#e0e7ff'
}
