import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { StatCardsGrid } from '@/components/ui/stat-card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getAnalyticsCsv, getAnalyticsSummaryCards, getBookingChannels, getPropertyPerformance, getRevenueTrend } from '@/lib/analytics'
import { createFileRoute } from '@tanstack/react-router'
import { Download, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from 'recharts'

export const Route = createFileRoute('/__main/analytics')({
    component: AnalyticsPage,
})

const chartConfig = {
    revenue: { label: 'Revenue', color: 'var(--chart-1)' },
    bookings: { label: 'Bookings', color: 'var(--chart-2)' },
    occupancy: { label: 'Occupancy', color: 'var(--chart-1)' },
    direct: { label: 'Direct', color: 'var(--chart-1)' },
    booking: { label: 'Booking.com', color: 'var(--chart-2)' },
    airbnb: { label: 'Airbnb', color: 'var(--chart-3)' },
    other: { label: 'Other', color: 'var(--chart-4)' },
} satisfies ChartConfig

function AnalyticsPage() {
    const [property, setProperty] = useState('all')
    const [period, setPeriod] = useState('month')
    const [refreshedAt, setRefreshedAt] = useState('just now')

    const refresh = () => setRefreshedAt(new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date()))

    const exportSummary = () => {
        const downloadUrl = URL.createObjectURL(new Blob([getAnalyticsCsv()], { type: 'text/csv;charset=utf-8' }))
        const link = document.createElement('a')
        link.href = downloadUrl
        link.download = 'portfolio-analytics.csv'
        link.click()
        URL.revokeObjectURL(downloadUrl)
    }

    return (
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
            <section className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                <div>
                    <p className="mb-2 text-xs font-semibold tracking-[0.14em] text-primary uppercase">Portfolio intelligence</p>
                    <h1 className="text-3xl font-semibold tracking-tight">Analytics</h1>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                        Monitor your property portfolio, compare performance, and spot booking trends in one place.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Select value={property} onValueChange={setProperty}>
                        <SelectTrigger aria-label="Select property" className="w-42 bg-card">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All properties</SelectItem>
                            <SelectItem value="ocean">Ocean View</SelectItem>
                            <SelectItem value="city">City Suites</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={period} onValueChange={setPeriod}>
                        <SelectTrigger aria-label="Select time range" className="w-36 bg-card">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="week">This week</SelectItem>
                            <SelectItem value="month">This month</SelectItem>
                            <SelectItem value="quarter">This quarter</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" onClick={refresh}>
                        <RefreshCw className="mr-2 size-4" />
                        Refresh
                    </Button>
                    <Button size="sm" onClick={exportSummary}>
                        <Download className="mr-2 size-4" />
                        Export
                    </Button>
                </div>
            </section>

            <StatCardsGrid cards={getAnalyticsSummaryCards()} />

            <Tabs defaultValue="overview" className="gap-5">
                <div className="overflow-x-auto pb-1">
                    <TabsList variant="line" className="h-10 min-w-max border-b border-border p-0">
                        <TabsTrigger value="overview" className="px-4">
                            Overview
                        </TabsTrigger>
                        <TabsTrigger value="revenue" className="px-4">
                            Revenue & demand
                        </TabsTrigger>
                        <TabsTrigger value="performance" className="px-4">
                            Properties & channels
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="overview" className="m-0">
                    <div className="grid gap-5 lg:grid-cols-5">
                        <RevenueCard className="lg:col-span-3" />
                        <ChannelCard className="lg:col-span-2" />
                    </div>
                </TabsContent>

                <TabsContent value="revenue" className="m-0">
                    <div className="grid gap-5 lg:grid-cols-5">
                        <RevenueCard className="lg:col-span-3" expanded />
                        <BookingCard className="lg:col-span-2" />
                    </div>
                </TabsContent>

                <TabsContent value="performance" className="m-0">
                    <div className="grid gap-5 lg:grid-cols-5">
                        <PropertyCard className="lg:col-span-3" />
                        <ChannelCard className="lg:col-span-2" />
                    </div>
                </TabsContent>
            </Tabs>

            <p className="text-xs text-muted-foreground">Portfolio data refreshed {refreshedAt}. Figures are shown in USD.</p>
        </div>
    )
}

function RevenueCard({ className, expanded = false }: { className: string; expanded?: boolean }) {
    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle>Revenue performance</CardTitle>
                <CardDescription>Gross booking value across the selected period</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
                <ChartContainer config={chartConfig} className={expanded ? 'h-82 w-full' : 'h-70 w-full'}>
                    <AreaChart data={getRevenueTrend()} margin={{ left: -18, right: 8, top: 12 }}>
                        <defs>
                            <linearGradient id="revenue-fill" x1="0" x2="0" y1="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.28} />
                                <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `$${value / 1000}k`} />
                        <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                        <Area
                            dataKey="revenue"
                            type="natural"
                            fill="url(#revenue-fill)"
                            fillOpacity={1}
                            stroke="var(--color-revenue)"
                            strokeWidth={2.5}
                        />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}

function BookingCard({ className }: { className: string }) {
    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle>Booking momentum</CardTitle>
                <CardDescription>Reservations confirmed each month</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
                <ChartContainer config={chartConfig} className="h-82 w-full">
                    <BarChart data={getRevenueTrend()} margin={{ left: -20, right: 6, top: 12 }}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="bookings" fill="var(--color-bookings)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}

function PropertyCard({ className }: { className: string }) {
    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle>Property performance</CardTitle>
                <CardDescription>Occupancy rate by property</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
                <ChartContainer config={chartConfig} className="h-82 w-full">
                    <BarChart data={getPropertyPerformance()} layout="vertical" margin={{ left: 18, right: 20, top: 8 }}>
                        <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                        <XAxis type="number" domain={[0, 100]} axisLine={false} tickLine={false} tickFormatter={(value) => `${value}%`} />
                        <YAxis dataKey="property" type="category" axisLine={false} tickLine={false} width={88} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="occupancy" fill="var(--color-occupancy)" radius={[0, 6, 6, 0]} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}

function ChannelCard({ className }: { className: string }) {
    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle>Booking channels</CardTitle>
                <CardDescription>Share of confirmed reservations</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4 pt-2 sm:flex-row sm:justify-center">
                <ChartContainer config={chartConfig} className="h-48 w-48 shrink-0">
                    <PieChart>
                        <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                        <Pie data={getBookingChannels()} dataKey="value" innerRadius={50} outerRadius={74} paddingAngle={3}>
                            {getBookingChannels().map((channel) => (
                                <Cell key={channel.name} fill={channel.fill} />
                            ))}
                        </Pie>
                    </PieChart>
                </ChartContainer>
                <div className="grid w-full gap-3">
                    {getBookingChannels().map((channel) => (
                        <div key={channel.name} className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2">
                                <span className="size-2.5 rounded-full" style={{ backgroundColor: channel.fill }} />
                                {channel.name}
                            </span>
                            <span className="font-semibold tabular-nums">{channel.value}%</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
