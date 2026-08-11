import { DataTable } from '@/components/ui/data-table'
import type { DataTableColumn } from '@/components/ui/data-table'
import { Skeleton } from '@/components/ui/skeleton'
import { StatCardsGrid } from '@/components/ui/stat-card'
import type { ArrivalRow, Booking, OperationsReport, Paginated } from '@/lib/api'
import { heatColor, safePage, slicePage, STATUS_BADGE, toLocalDateStr } from '@/lib/analytics-utils'
import { formatCurrency, formatReportDate, formatSource, formatStatus, getArrivalsStatsCards } from '@/lib/reports'
import type { UseQueryResult } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { CalendarDays } from 'lucide-react'
import { useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartEmpty, ErrorNote, MiniValue, Panel, ProgressRow, SectionLabel } from './atoms'

export function OperationsTab({
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
        return [...byDay.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, v]) => ({ day: formatReportDate(date), ...v }))
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
            {
                key: 'bookingRef',
                header: 'Booking ID',
                render: (r) => <span className="font-semibold text-foreground">#{r.bookingRef}</span>,
            },
            { key: 'guest', header: 'Guest', render: (r) => <span className="font-medium">{r.guest}</span> },
            {
                key: 'propertyUnit',
                header: 'Property / Unit',
                render: (r) => <span className="text-muted-foreground">{r.propertyUnit}</span>,
            },
            {
                key: 'checkIn',
                header: 'Check-in',
                render: (r) => <span className="text-muted-foreground">{formatReportDate(toLocalDateStr(r.checkIn))}</span>,
            },
            {
                key: 'checkOut',
                header: 'Check-out',
                render: (r) => <span className="text-muted-foreground">{formatReportDate(toLocalDateStr(r.checkOut))}</span>,
            },
            { key: 'nights', header: 'Nights', render: (r) => <span className="text-muted-foreground">{r.nights}</span> },
            { key: 'source', header: 'Source', render: (r) => <span className="text-muted-foreground">{formatSource(r.source)}</span> },
            {
                key: 'status',
                header: 'Status',
                render: (r) => (
                    <span
                        className={cn(
                            'rounded-full px-2.5 py-1 text-xs font-semibold capitalize',
                            STATUS_BADGE[r.status] ?? 'text-muted-foreground bg-muted',
                        )}
                    >
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
            {
                key: 'id',
                header: 'Ref ID',
                render: (r) => <span className="font-semibold text-foreground">#{r.id.slice(-6).toUpperCase()}</span>,
            },
            { key: 'guest', header: 'Guest', render: (r) => <span className="font-medium">{r.guest.user.name}</span> },
            {
                key: 'property',
                header: 'Property / Room',
                render: (r) => <span className="text-muted-foreground">{`${r.property.name} / ${r.unit.roomNumber}`}</span>,
            },
            {
                key: 'stay',
                header: 'Stay Dates',
                render: (r) => (
                    <span className="text-muted-foreground">{`${formatReportDate(toLocalDateStr(r.checkInDate))} — ${formatReportDate(toLocalDateStr(r.checkOutDate))}`}</span>
                ),
            },
            { key: 'source', header: 'Channel', render: (r) => <span className="text-muted-foreground">{formatSource(r.source)}</span> },
            {
                key: 'grandTotal',
                header: 'Price',
                render: (r) => <span className="font-semibold">{formatCurrency(Number(r.grandTotal), r.currency)}</span>,
            },
            {
                key: 'status',
                header: 'Status',
                render: (r) => (
                    <span
                        className={cn(
                            'rounded-full px-2.5 py-1 text-xs font-semibold capitalize',
                            STATUS_BADGE[r.status] ?? 'text-muted-foreground bg-muted',
                        )}
                    >
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
                    <div className="space-y-5">
                        {statusSummary.map((row) => (
                            <ProgressRow key={row.label} {...row} />
                        ))}
                        <div className="grid grid-cols-2 gap-3">
                            <MiniValue
                                label="Avg. Stay"
                                value={
                                    arrivals.length
                                        ? `${(arrivals.reduce((s, a) => s + a.nights, 0) / arrivals.length).toFixed(1)} nights`
                                        : '—'
                                }
                                tone="violet"
                            />
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
