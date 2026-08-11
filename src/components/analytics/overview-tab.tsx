import { Skeleton } from '@/components/ui/skeleton'
import type { StatCardProps } from '@/components/ui/stat-card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { OverviewReport, TrendGranularity } from '@/lib/api'
import { CHANNEL_COLORS } from '@/lib/analytics-utils'
import { formatCurrency, formatPercent, formatSource } from '@/lib/reports'
import type { UseQueryResult } from '@tanstack/react-query'
import { BedDouble, CalendarDays, CircleDollarSign, TrendingUp } from 'lucide-react'
import { useMemo } from 'react'
import { CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartEmpty, ErrorNote, Panel, SparkCard } from './atoms'

export function OverviewTab({
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
