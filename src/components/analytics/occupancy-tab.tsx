import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import type { DataTableColumn } from '@/components/ui/data-table'
import { Skeleton } from '@/components/ui/skeleton'
import { StatCardsGrid } from '@/components/ui/stat-card'
import type { OccupancyReport, OccupancyRow } from '@/lib/api'
import { downloadCsv, safePage, slicePage } from '@/lib/analytics-utils'
import { formatCurrency, formatPercent, formatReportDate, getOccupancyStatsCards } from '@/lib/reports'
import type { UseQueryResult } from '@tanstack/react-query'
import { BedDouble, Download } from 'lucide-react'
import { useMemo } from 'react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartEmpty, ErrorNote, MiniValue, Panel, ProgressRow, SectionLabel } from './atoms'

export function OccupancyTab({
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
    const last = rows.at(-1)
    const availableRooms = last?.availableRooms ?? 0
    const peak = rows.reduce<OccupancyRow | null>((a, b) => (b.occupied > (a?.occupied ?? -1) ? b : a), null)
    const low = rows.reduce<OccupancyRow | null>((a, b) => (b.occupied < (a?.occupied ?? Infinity) ? b : a), null)

    const chartData = rows.map((r) => ({ date: formatReportDate(r.date), occupancyRate: r.occupancyRate }))

    const columns = useMemo<DataTableColumn<OccupancyRow>[]>(
        () => [
            { key: 'date', header: 'Date', render: (r) => <span className="text-muted-foreground">{formatReportDate(r.date)}</span> },
            {
                key: 'availableRooms',
                header: 'Available Rooms',
                render: (r) => <span className="text-muted-foreground">{r.availableRooms}</span>,
            },
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
            {
                key: 'revpar',
                header: 'REVPAR',
                render: (r) => <span className="text-muted-foreground">{formatCurrency(r.revpar, currency)}</span>,
            },
            {
                key: 'revenue',
                header: 'Revenue',
                render: (r) => <span className="text-right font-semibold text-foreground">{formatCurrency(r.revenue, currency)}</span>,
            },
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
                                    <YAxis
                                        domain={[0, 100]}
                                        tickFormatter={(v) => `${v}%`}
                                        tickLine={false}
                                        axisLine={false}
                                        fontSize={10}
                                    />
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
                    <div className="space-y-5">
                        <ProgressRow
                            label="Rooms Occupied (today)"
                            value={last ? `${last.occupied} / ${availableRooms}` : '—'}
                            percent={last ? (last.occupied / Math.max(availableRooms, 1)) * 100 : 0}
                            color="#6366f1"
                        />
                        <ProgressRow
                            label="Available tonight"
                            value={last ? `${Math.max(availableRooms - last.occupied, 0)} / ${availableRooms}` : '—'}
                            percent={last ? ((availableRooms - last.occupied) / Math.max(availableRooms, 1)) * 100 : 0}
                            color="#20c77a"
                        />
                        <ProgressRow
                            label="Peak Occupancy"
                            value={peak ? `${peak.occupied} / ${peak.availableRooms}` : '—'}
                            percent={peak ? (peak.occupied / Math.max(peak.availableRooms, 1)) * 100 : 0}
                            color="#f4a51c"
                        />
                        <ProgressRow
                            label="Low Occupancy Day"
                            value={low ? `${low.occupied} / ${low.availableRooms}` : '—'}
                            percent={low ? (low.occupied / Math.max(low.availableRooms, 1)) * 100 : 0}
                            color="#f44f75"
                        />
                        <div className="grid grid-cols-2 gap-3 pt-1">
                            <MiniValue
                                label="Average nightly rate"
                                value={summary ? formatCurrency(summary.adr, currency) : '—'}
                                tone="violet"
                            />
                            <MiniValue label="REVPAR" value={summary ? formatCurrency(summary.revpar, currency) : '—'} tone="mint" />
                        </div>
                    </div>
                </Panel>
            </section>

            <Panel
                title="Daily Occupancy Breakdown"
                subtitle="Per-day metrics for the current period"
                action={
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() => downloadCsv(`occupancy-${range.from}-${range.to}.csv`, rows)}
                    >
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
