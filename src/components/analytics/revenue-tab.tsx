import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import type { DataTableColumn } from '@/components/ui/data-table'
import { Skeleton } from '@/components/ui/skeleton'
import { StatCardsGrid } from '@/components/ui/stat-card'
import type { RevenueReport, RevenueSourceRow } from '@/lib/api'
import { CHANNEL_COLORS, downloadCsv, safePage, slicePage } from '@/lib/analytics-utils'
import { formatCurrency, formatSource, getRevenueStatsCards } from '@/lib/reports'
import type { UseQueryResult } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { CircleDollarSign, Download } from 'lucide-react'
import { useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartEmpty, ErrorNote, Panel, SectionLabel } from './atoms'

export function RevenueTab({
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
