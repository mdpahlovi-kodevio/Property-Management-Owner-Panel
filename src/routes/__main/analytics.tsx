import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PageHeader } from '@/components/ui/page-header'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createFileRoute } from '@tanstack/react-router'
import {
    ArrowDownRight,
    ArrowUpRight,
    BedDouble,
    CalendarDays,
    Check,
    CircleDollarSign,
    Download,
    Filter,
    Hotel,
    MoreHorizontal,
    Search,
    TrendingUp,
} from 'lucide-react'
import { useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export const Route = createFileRoute('/__main/analytics')({ component: AnalyticsPage })

const channels = [
    { name: 'Direct', value: 38, color: '#6366f1' },
    { name: 'Booking.com', value: 24, color: '#20b96f' },
    { name: 'Airbnb', value: 18, color: '#f4a51c' },
    { name: 'Vrbo', value: 11, color: '#0ea5a5' },
    { name: 'Expedia', value: 9, color: '#f44f75' },
]

const pace = [
    { name: 'Mon', value: 310 },
    { name: 'Tue', value: 190 },
    { name: 'Wed', value: 255 },
    { name: 'Thu', value: 180 },
    { name: 'Fri', value: 215 },
    { name: 'Sat', value: 330 },
]

const occupancy = [
    { day: 'Apr 16', occupancy: 72 },
    { day: 'Apr 17', occupancy: 88 },
    { day: 'Apr 18', occupancy: 76 },
    { day: 'Apr 19', occupancy: 91 },
    { day: 'Apr 20', occupancy: 83 },
    { day: 'Apr 21', occupancy: 86 },
]

const arrivals = [
    { day: 'Apr 16', arrivals: 8, departures: 5, pendingConfirmations: 1 },
    { day: 'Apr 17', arrivals: 13, departures: 8, pendingConfirmations: 2 },
    { day: 'Apr 18', arrivals: 10, departures: 12, pendingConfirmations: 1 },
    { day: 'Apr 19', arrivals: 17, departures: 8, pendingConfirmations: 2 },
    { day: 'Apr 20', arrivals: 12, departures: 14, pendingConfirmations: 1 },
    { day: 'Apr 21', arrivals: 19, departures: 9, pendingConfirmations: 2 },
    { day: 'Apr 22', arrivals: 13, departures: 12, pendingConfirmations: 1 },
]

const sourceRevenue = [
    { name: 'Gross booking value', value: 84320, display: '$84,320', color: '#6b6af5' },
    { name: 'Commission fees', value: 8432, display: '$8,432', color: '#f7ad22' },
    { name: 'Net owner earnings', value: 75888, display: '$75,888', color: '#22c77a' },
    { name: 'Confirmed bookings', value: 428, display: '428', color: '#f55175' },
]

const bookings = [
    ['BK-1042', 'Sarah Mitchell', 'Sunset Villa / 301', 'Apr 28, 15:00', 'May 02, 11:00', '2', 'Airbnb', 'Checked in'],
    ['BK-1043', 'James Carter', 'Downtown Loft / 128', 'Apr 28, 15:00', 'May 02, 11:00', '4', 'Airbnb', 'Checked in'],
    ['BK-1044', 'James Carter', 'Sunset Villa / 301', 'Apr 28, 15:00', 'May 02, 11:00', '2', 'Direct', 'Checked in'],
    ['BK-1045', 'James Carter', 'Downtown Loft / 128', 'Apr 28, 15:00', 'May 02, 11:00', '4', 'Direct', 'Checked in'],
    ['BK-1046', 'Sarah Mitchell', 'Sunset Villa / 201', 'Apr 28, 15:00', 'May 02, 11:00', '2', 'Expedia', 'Checked in'],
]

function AnalyticsPage() {
    const [period, setPeriod] = useState('month')
    const [property, setProperty] = useState('all')
    const [tab, setTab] = useState(() => sessionStorage.getItem('analyticsTab') ?? 'overview')
    const handleTabChange = (nextTab: string) => {
        setTab(nextTab)
        sessionStorage.setItem('analyticsTab', nextTab)
    }

    return (
        <main className="space-y-6 text-foreground">
            <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <PageHeader
                    title="Analytics"
                    description="Monitor performance Overview, booking channels, occupancy, and guest operations."
                />
                <div className="flex flex-wrap gap-2">
                    <Select value={property} onValueChange={setProperty}>
                        <SelectTrigger className="h-9 w-40 text-xs">
                            <Hotel className="mr-2 size-3.5 text-muted-foreground" />
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Properties</SelectItem>
                            <SelectItem value="sunset">Sunset Villa</SelectItem>
                            <SelectItem value="loft">Downtown Loft</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={period} onValueChange={setPeriod}>
                        <SelectTrigger className="h-9 w-34 text-xs">
                            <CalendarDays className="mr-2 size-3.5 text-muted-foreground" />
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="week">This Week</SelectItem>
                            <SelectItem value="month">This Month</SelectItem>
                            <SelectItem value="quarter">This Quarter</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" className="h-9 text-xs">
                        <Filter className="mr-2 size-3.5" />
                        Channels
                    </Button>
                </div>
            </header>

            <Tabs value={tab} onValueChange={handleTabChange} className="w-full">
                <div className="overflow-x-auto rounded-xl border bg-card p-1 shadow-sm">
                    <TabsList className="h-10 min-w-max gap-1 bg-muted/60 p-1">
                        <TabsTrigger
                            value="overview"
                            className="h-8 gap-2 px-3 text-xs data-[state=active]:bg-background data-[state=active]:text-foreground"
                        >
                            <TrendingUp className="size-3.5" />
                            Overview
                        </TabsTrigger>
                        <TabsTrigger
                            value="occupancy"
                            className="h-8 gap-2 px-3 text-xs data-[state=active]:bg-background data-[state=active]:text-foreground"
                        >
                            <BedDouble className="size-3.5" />
                            Occupancy
                        </TabsTrigger>
                        <TabsTrigger
                            value="revenue"
                            className="h-8 gap-2 px-3 text-xs data-[state=active]:bg-background data-[state=active]:text-foreground"
                        >
                            <CircleDollarSign className="size-3.5" />
                            <span className="sm:hidden">Revenue</span>
                            <span className="hidden sm:inline">Revenue & channels</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="operations"
                            className="h-8 gap-2 px-3 text-xs data-[state=active]:bg-background data-[state=active]:text-foreground"
                        >
                            <CalendarDays className="size-3.5" />
                            <span className="sm:hidden">Operations</span>
                            <span className="hidden sm:inline">Guest operations</span>
                        </TabsTrigger>
                    </TabsList>
                </div>
            </Tabs>

            {tab === 'overview' && (
                <>
                    <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                        <Metric
                            icon={CircleDollarSign}
                            label="Gross booking value"
                            value="$124,592"
                            change="+12.4%"
                            tone="violet"
                            chart={[5, 6, 5, 7, 8, 10]}
                        />
                        <Metric
                            icon={BedDouble}
                            label="Occupancy Rate"
                            value="84.2%"
                            change="+6.8%"
                            tone="mint"
                            chart={[8, 6, 5, 7, 6, 8]}
                        />
                        <Metric
                            icon={TrendingUp}
                            label="ADR (Avg. Daily Rate)"
                            value="$184.50"
                            change="-2.4%"
                            tone="peach"
                            chart={[9, 8, 7, 8, 6, 7]}
                            down
                        />
                        <Metric
                            icon={CalendarDays}
                            label="Confirmed bookings"
                            value="1,248"
                            change="+4.2%"
                            tone="rose"
                            chart={[6, 5, 7, 6, 8, 9]}
                        />
                    </section>

                    <section className="grid gap-5 xl:grid-cols-[1.65fr_1fr]">
                        <Panel
                            title="Revenue & Booking Pace"
                            subtitle="Daily performance overview"
                            action={
                                <div className="rounded-md bg-slate-100 p-0.5 text-[10px]">
                                    <button className="rounded bg-white px-2 py-1 shadow-sm">Daily</button>
                                    <button className="px-2 py-1 text-slate-500">Weekly</button>
                                </div>
                            }
                        >
                            <div className="h-64">
                                <ResponsiveContainer>
                                    <LineChart data={pace} margin={{ top: 12, right: 12, left: -18, bottom: 0 }}>
                                        <CartesianGrid vertical={false} stroke="#e7eaf3" />
                                        <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={10} />
                                        <YAxis tickLine={false} axisLine={false} fontSize={10} />
                                        <Tooltip />
                                        <Line dataKey="value" type="monotone" stroke="#6b6af5" strokeWidth={3} dot={false} />
                                        <Line dataKey="name" stroke="#20c987" strokeWidth={1} dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </Panel>
                        <Panel title="Channel Distribution" subtitle="Source attribution breakdown">
                            <div className="flex h-64 flex-col items-center justify-center gap-3 sm:flex-row">
                                <ResponsiveContainer width={155} height={155}>
                                    <PieChart>
                                        <Pie data={channels} dataKey="value" innerRadius={43} outerRadius={64} paddingAngle={5}>
                                            {channels.map((item) => (
                                                <Cell key={item.name} fill={item.color} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <ChannelLegend />
                            </div>
                        </Panel>
                    </section>
                </>
            )}

            {tab === 'occupancy' && (
                <>
                    <SectionLabel title="Occupancy Report" badge="Live" />
                    <section className="grid gap-5 xl:grid-cols-[1.65fr_1fr]">
                        <Panel title="Occupancy rate" subtitle="Share of available rooms booked each day">
                            <div className="h-60">
                                <ResponsiveContainer>
                                    <LineChart data={occupancy} margin={{ top: 12, right: 12, left: -18 }}>
                                        <CartesianGrid vertical={false} stroke="#e7eaf3" />
                                        <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={10} />
                                        <YAxis
                                            domain={[0, 100]}
                                            tickFormatter={(value) => `${value}%`}
                                            tickLine={false}
                                            axisLine={false}
                                            fontSize={10}
                                        />
                                        <Tooltip />
                                        <Line name="Occupancy" dataKey="occupancy" stroke="#6b6af5" strokeWidth={2.5} dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                                <span className="flex items-center gap-1.5">
                                    <span className="size-2 rounded-full bg-primary" />
                                    Occupancy
                                </span>
                                <span>Period average: 83%</span>
                            </div>
                        </Panel>
                        <Panel title="Occupancy Overview" subtitle="Current period breakdown">
                            <div className="space-y-5 pt-4">
                                <ProgressRow label="Rooms Occupied" value="20 / 24" percent={83} color="#6366f1" />
                                <ProgressRow label="Available tonight" value="4 / 24" percent={17} color="#20c77a" />
                                <ProgressRow label="Peak Occupancy" value="22 / 24" percent={92} color="#f4a51c" />
                                <ProgressRow label="Low Occupancy Day" value="14 / 24" percent={58} color="#f44f75" />
                                <div className="grid grid-cols-2 gap-3 pt-1">
                                    <MiniValue label="Average nightly rate" value="$184.50" tone="violet" />
                                    <MiniValue label="REVPAR" value="$154.17" tone="mint" />
                                </div>
                            </div>
                        </Panel>
                    </section>

                    <Panel
                        title="Daily Occupancy Breakdown"
                        subtitle="Per-day metrics for the current period"
                        action={
                            <Button variant="outline" size="sm" className="h-8 text-xs">
                                <Download className="mr-1.5 size-3.5" />
                                Export
                            </Button>
                        }
                    >
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-190 text-left text-xs">
                                <thead className="border-b border-slate-100 text-[10px] text-slate-400 uppercase">
                                    <tr>
                                        <th className="pb-3 font-medium">Date</th>
                                        <th className="pb-3 font-medium">Available Rooms</th>
                                        <th className="pb-3 font-medium">Occupied</th>
                                        <th className="pb-3 font-medium">Occupancy %</th>
                                        <th className="pb-3 font-medium">ADR</th>
                                        <th className="pb-3 font-medium">REVPAR</th>
                                        <th className="pb-3 text-right font-medium">Revenue</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Array.from({ length: 10 }, (_, index) => {
                                        const rate = [83, 79, 91, 87, 78, 66, 75, 60, 87, 66][index]
                                        return (
                                            <tr key={index} className="border-b border-slate-50 last:border-0">
                                                <td className="py-3 font-medium text-slate-700">Apr {28 - index}</td>
                                                <td className="py-3 text-slate-500">24</td>
                                                <td className="py-3 font-semibold text-indigo-500">{Math.round((rate / 100) * 24)}</td>
                                                <td className="py-3">
                                                    <span className="mr-2 text-slate-600">{rate}%</span>
                                                    <span className="inline-block h-1.5 w-20 rounded-full bg-slate-100 align-middle">
                                                        <span
                                                            className="block h-full rounded-full bg-indigo-500"
                                                            style={{ width: `${rate}%` }}
                                                        />
                                                    </span>
                                                </td>
                                                <td className="py-3 text-slate-600">$185.00</td>
                                                <td className="py-3 text-slate-600">$154.17</td>
                                                <td className="py-3 text-right font-semibold text-slate-700">
                                                    ${(rate * 470).toLocaleString()}.00
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </Panel>
                </>
            )}

            {tab === 'revenue' && (
                <>
                    <SectionLabel title="Revenue by Source" badge="April 2025" />
                    <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                        {sourceRevenue.map((item) => (
                            <CompactMetric key={item.name} {...item} trend="7.42% vs. last period" />
                        ))}
                    </section>
                    <section className="grid gap-5 xl:grid-cols-[1.65fr_1fr]">
                        <Panel title="Revenue by Booking Source" subtitle="Comparative revenue & earnings per channel">
                            <div className="h-64">
                                <ResponsiveContainer>
                                    <BarChart
                                        data={[
                                            {
                                                name: 'Gross value',
                                                direct: 32100,
                                                booking: 20240,
                                                airbnb: 15340,
                                                vrbo: 9280,
                                                expedia: 7360,
                                            },
                                            { name: 'Commission', direct: 3210, booking: 2024, airbnb: 1534, vrbo: 928, expedia: 736 },
                                            {
                                                name: 'Owner earnings',
                                                direct: 28890,
                                                booking: 18216,
                                                airbnb: 13806,
                                                vrbo: 8352,
                                                expedia: 6624,
                                            },
                                        ]}
                                        margin={{ top: 12, right: 8, left: -20 }}
                                    >
                                        <CartesianGrid vertical={false} stroke="#e7eaf3" />
                                        <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={9} />
                                        <YAxis tickLine={false} axisLine={false} fontSize={10} />
                                        <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                                        <Bar name="Direct" dataKey="direct" fill="#6366f1" radius={[3, 3, 0, 0]} />
                                        <Bar name="Booking.com" dataKey="booking" fill="#20c77a" radius={[3, 3, 0, 0]} />
                                        <Bar name="Airbnb" dataKey="airbnb" fill="#f4a51c" radius={[3, 3, 0, 0]} />
                                        <Bar name="Vrbo" dataKey="vrbo" fill="#0ea5a5" radius={[3, 3, 0, 0]} />
                                        <Bar name="Expedia" dataKey="expedia" fill="#f44f75" radius={[3, 3, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Panel>
                        <Panel title="Booking Share" subtitle="Reservations by channel">
                            <div className="flex h-64 flex-col items-center justify-center gap-2 sm:flex-row">
                                <ResponsiveContainer width={150} height={150}>
                                    <PieChart>
                                        <Pie data={channels} dataKey="value" innerRadius={38} outerRadius={62} paddingAngle={4}>
                                            {channels.map((item) => (
                                                <Cell key={item.name} fill={item.color} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <ChannelLegend />
                            </div>
                        </Panel>
                    </section>

                    <Panel
                        title="Booking Source Breakdown"
                        subtitle="Revenue and earnings per channel"
                        action={
                            <Button variant="outline" size="sm" className="h-8 text-xs">
                                <Download className="mr-1.5 size-3.5" />
                                Export
                            </Button>
                        }
                    >
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-170 text-left text-xs">
                                <thead className="border-b border-slate-100 text-[10px] text-slate-400 uppercase">
                                    <tr>
                                        <th className="pb-3 font-medium">Booking Source</th>
                                        <th className="pb-3 font-medium">Total Bookings</th>
                                        <th className="pb-3 font-medium">Total Revenue</th>
                                        <th className="pb-3 font-medium">Total Earnings</th>
                                        <th className="pb-3 font-medium">Expected Payout</th>
                                        <th className="pb-3 text-right font-medium">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {channels.map((channel, index) => (
                                        <tr key={channel.name} className="border-b border-slate-50 last:border-0">
                                            <td className="py-3 font-medium">
                                                <span
                                                    className="mr-2 inline-block size-1.5 rounded-full"
                                                    style={{ backgroundColor: channel.color }}
                                                />
                                                {channel.name}
                                            </td>
                                            <td className="py-3 text-slate-600">{142 - index * 19}</td>
                                            <td className="py-3 font-semibold text-indigo-500">
                                                ${(48200 - index * 7200).toLocaleString()}
                                            </td>
                                            <td className="py-3 text-slate-600">${(7120 - index * 780).toLocaleString()}</td>
                                            <td className="py-3">
                                                <span className="mr-2 inline-block h-1.5 w-18 rounded-full bg-slate-100">
                                                    <span
                                                        className="block h-full rounded-full bg-emerald-500"
                                                        style={{ width: `${85 - index * 7}%` }}
                                                    />
                                                </span>
                                                ${(6500 - index * 680).toLocaleString()}
                                            </td>
                                            <td className="py-3 text-right">
                                                <Button variant="outline" size="sm" className="h-7 px-2 text-[10px]">
                                                    View
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Panel>
                </>
            )}

            {tab === 'operations' && (
                <>
                    <SectionLabel title="Arrivals & Departures" badge="Today" />
                    <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                        <CompactMetric name="Arrivals Today" display="8" value={8} color="#6b6af5" trend="2 more than yesterday" />
                        <CompactMetric name="Departures Today" display="6" value={6} color="#f4a51c" trend="1 less than yesterday" />
                        <CompactMetric name="In-house Guests" display="20" value={20} color="#20c77a" trend="Guests currently staying" />
                        <CompactMetric
                            name="Pending confirmations"
                            display="3"
                            value={3}
                            color="#f44f75"
                            trend="Bookings awaiting owner confirmation"
                        />
                    </section>
                    <section className="grid gap-5 xl:grid-cols-[1.65fr_1fr]">
                        <Panel title="Guest Flow — Arrivals vs Departures" subtitle="Projected movement over the next 7 days">
                            <div className="h-60">
                                <ResponsiveContainer>
                                    <BarChart data={arrivals} margin={{ top: 12, right: 8, left: -20 }}>
                                        <CartesianGrid vertical={false} stroke="#e7eaf3" />
                                        <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={9} />
                                        <YAxis tickLine={false} axisLine={false} fontSize={10} />
                                        <Tooltip />
                                        <Bar dataKey="arrivals" fill="#6366f1" radius={[3, 3, 0, 0]} />
                                        <Bar dataKey="departures" fill="#f44f75" radius={[3, 3, 0, 0]} />
                                        <Bar dataKey="pendingConfirmations" fill="#20c77a" radius={[3, 3, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Panel>
                        <Panel title="Status Summary" subtitle="Today’s guest status split">
                            <div className="space-y-5 pt-4">
                                <ProgressRow label="Checked-in" value="8" percent={58} color="#20c77a" />
                                <ProgressRow label="Pending Arrival" value="2" percent={24} color="#f4a51c" />
                                <ProgressRow label="Departed" value="4" percent={45} color="#6366f1" />
                                <ProgressRow label="Pending confirmation" value="3" percent={16} color="#f44f75" />
                                <div className="grid grid-cols-2 gap-3">
                                    <MiniValue label="Avg. Stay" value="3.8 nights" tone="violet" />
                                    <MiniValue label="Sources" value="4 channels" tone="rose" />
                                </div>
                            </div>
                        </Panel>
                    </section>

                    <Panel
                        title="Today’s Arrivals & Departures"
                        subtitle="Live guest movement"
                        action={
                            <div className="flex gap-2">
                                <div className="relative">
                                    <Search className="absolute top-2 left-2 size-3.5 text-slate-400" />
                                    <Input className="h-8 w-36 pl-7 text-xs" placeholder="Search guests..." />
                                </div>
                                <Button variant="outline" size="sm" className="h-8 text-xs">
                                    <Filter className="mr-1.5 size-3.5" />
                                    Filter
                                </Button>
                            </div>
                        }
                    >
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-220 text-left text-xs">
                                <thead className="border-b border-slate-100 text-[10px] text-slate-400 uppercase">
                                    <tr>
                                        <th className="pb-3 font-medium">Booking ID</th>
                                        <th className="pb-3 font-medium">Guest</th>
                                        <th className="pb-3 font-medium">Property / Unit</th>
                                        <th className="pb-3 font-medium">Check-in</th>
                                        <th className="pb-3 font-medium">Check-out</th>
                                        <th className="pb-3 font-medium">Guests</th>
                                        <th className="pb-3 font-medium">Source</th>
                                        <th className="pb-3 font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.map((row) => (
                                        <tr key={row[0]} className="border-b border-slate-50 last:border-0">
                                            <td className="py-3 font-semibold text-indigo-500">{row[0]}</td>
                                            <td className="py-3">
                                                <span className="mr-2 inline-flex size-5 items-center justify-center rounded-full bg-indigo-100 text-[9px] font-bold text-indigo-600">
                                                    {row[1]
                                                        .split(' ')
                                                        .map((word) => word[0])
                                                        .join('')}
                                                </span>
                                                {row[1]}
                                            </td>
                                            <td className="py-3 text-slate-600">{row[2]}</td>
                                            <td className="py-3 text-slate-600">{row[3]}</td>
                                            <td className="py-3 text-slate-600">{row[4]}</td>
                                            <td className="py-3">{row[5]}</td>
                                            <td className="py-3">{row[6]}</td>
                                            <td className="py-3">
                                                <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-medium text-emerald-700">
                                                    <Check className="mr-0.5 inline size-2.5" />
                                                    {row[7]}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Panel>

                    <section className="grid gap-5 xl:grid-cols-2">
                        <Panel title="Occupancy Heatmap" subtitle="Weekly inventory snapshot">
                            <div className="grid grid-cols-7 gap-2 pt-5">
                                {Array.from({ length: 35 }, (_, i) => (
                                    <span
                                        key={i}
                                        className="h-7 rounded-md"
                                        style={{ backgroundColor: ['#e0e7ff', '#a5b4fc', '#818cf8', '#6366f1', '#c7d2fe'][i % 5] }}
                                    />
                                ))}
                            </div>
                            <div className="mt-3 flex justify-between text-[10px] text-slate-400">
                                <span>Less Busy</span>
                                <span>Fully Booked</span>
                            </div>
                        </Panel>
                        <Panel title="Ancillary Revenue" subtitle="Add-ons & extra services breakdown">
                            <div className="space-y-6 pt-5">
                                <ProgressRow label="Breakfast & Dining" value="$4,240" percent={82} color="#6366f1" />
                                <ProgressRow label="Airport Transfers" value="$1,820" percent={55} color="#20c77a" />
                                <ProgressRow label="Early/Late Check-in" value="$840" percent={27} color="#f4a51c" />
                                <ProgressRow label="Cleaning Fees" value="$3,150" percent={95} color="#f44f75" />
                            </div>
                        </Panel>
                    </section>
                    <Panel
                        title="Recent Reservations"
                        subtitle="Manage bookings and stay details"
                        action={
                            <div className="flex gap-2">
                                <Input className="h-8 w-32 text-xs" placeholder="Search..." />
                                <Button variant="outline" size="sm" className="h-8 text-xs">
                                    View all
                                </Button>
                            </div>
                        }
                    >
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-200 text-left text-xs">
                                <thead className="border-b border-slate-100 text-[10px] text-slate-400 uppercase">
                                    <tr>
                                        <th className="pb-3 font-medium">Ref ID</th>
                                        <th className="pb-3 font-medium">Guest</th>
                                        <th className="pb-3 font-medium">Property / Room</th>
                                        <th className="pb-3 font-medium">Stay Dates</th>
                                        <th className="pb-3 font-medium">Channel</th>
                                        <th className="pb-3 font-medium">Price</th>
                                        <th className="pb-3 font-medium">Status</th>
                                        <th className="pb-3" />
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        [
                                            'RES-9031',
                                            'Marcus Chambers',
                                            'Azure Beach Villa',
                                            'Oct 28 — Nov 02',
                                            'Direct',
                                            '$1,250',
                                            'Confirmed',
                                        ],
                                        [
                                            'RES-9032',
                                            'Elena Rodriguez',
                                            'Grand Horizon Resort',
                                            'Nov 05 — Nov 09',
                                            'Booking.com',
                                            '$2,400',
                                            'Checked-in',
                                        ],
                                        ['RES-9033', 'Sarah Jenkins', 'Azure Beach Villa', 'Oct 22 — Oct 25', 'Airbnb', '$890', 'Pending'],
                                        [
                                            'RES-9034',
                                            'David Wilson',
                                            'Grand Horizon Resort',
                                            'Oct 29 — Oct 22',
                                            'Manual',
                                            '$450',
                                            'Cancelled',
                                        ],
                                    ].map((row) => (
                                        <tr key={row[0]} className="border-b border-slate-50 last:border-0">
                                            <td className="py-3 font-semibold text-indigo-500">
                                                {row[0]}
                                                <span className="mt-1 block text-[9px] font-normal text-slate-400">Oct 20, 2025</span>
                                            </td>
                                            <td className="py-3 font-medium">
                                                {row[1]}
                                                <span className="mt-1 block text-[9px] font-normal text-slate-400">guest@example.com</span>
                                            </td>
                                            <td className="py-3 text-slate-600">
                                                {row[2]}
                                                <span className="mt-1 block text-[9px] text-slate-400">Suite 402</span>
                                            </td>
                                            <td className="py-3 text-slate-600">
                                                {row[3]}
                                                <span className="mt-1 block text-[9px] text-slate-400">5 nights</span>
                                            </td>
                                            <td className="py-3">{row[4]}</td>
                                            <td className="py-3 font-semibold">
                                                {row[5]}
                                                <span className="mt-1 block text-[9px] font-normal text-slate-400">Paid</span>
                                            </td>
                                            <td className="py-3">
                                                <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-medium text-emerald-700">
                                                    {row[6]}
                                                </span>
                                            </td>
                                            <td className="py-3 text-right">
                                                <Button variant="ghost" size="icon" className="size-7">
                                                    <MoreHorizontal className="size-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Panel>
                </>
            )}
        </main>
    )
}

function Panel({
    title,
    subtitle,
    action,
    children,
}: {
    title: string
    subtitle: string
    action?: React.ReactNode
    children: React.ReactNode
}) {
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
function Metric({
    icon: Icon,
    label,
    value,
    change,
    tone,
    chart,
    down,
}: {
    icon: typeof CircleDollarSign
    label: string
    value: string
    change: string
    tone: 'violet' | 'mint' | 'peach' | 'rose'
    chart: number[]
    down?: boolean
}) {
    const colors = { violet: '#6366f1', mint: '#20b979', peach: '#f2a721', rose: '#f24f73' }
    return (
        <div className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex items-start justify-between">
                <span className="flex size-8 items-center justify-center rounded-md bg-muted" style={{ color: colors[tone] }}>
                    <Icon className="size-4" />
                </span>
                <span className={`flex items-center text-[10px] font-bold ${down ? 'text-rose-500' : 'text-emerald-600'}`}>
                    {down ? <ArrowDownRight className="size-3" /> : <ArrowUpRight className="size-3" />}
                    {change}
                </span>
            </div>
            <p className="mt-3 text-[10px] font-medium text-muted-foreground">{label}</p>
            <p className="mt-0.5 text-xl font-bold tracking-tight text-foreground">{value}</p>
            <div className="mt-3 flex h-5 items-end gap-1">
                {chart.map((height, i) => (
                    <span
                        key={i}
                        className="w-full rounded-sm"
                        style={{ height: `${height * 10}%`, backgroundColor: colors[tone], opacity: 0.25 + i / 12 }}
                    />
                ))}
            </div>
        </div>
    )
}
function CompactMetric({ name, display, color, trend }: { name: string; display: string; value: number; color: string; trend: string }) {
    return (
        <div className="rounded-xl border bg-card p-5 shadow-sm">
            <span className="flex size-7 items-center justify-center rounded-md bg-muted" style={{ color }}>
                <CircleDollarSign className="size-4" />
            </span>
            <p className="mt-2 text-[10px] text-muted-foreground">{name}</p>
            <p className="text-lg font-bold text-foreground">{display}</p>
            <p className="text-[9px] text-muted-foreground">{trend}</p>
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
                <div className="h-full rounded-full" style={{ width: `${percent}%`, backgroundColor: color }} />
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
function ChannelLegend() {
    return (
        <div className="w-40 space-y-2">
            {channels.map((channel) => (
                <div key={channel.name} className="flex items-center justify-between text-[10px]">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                        <span className="size-2 rounded-full" style={{ backgroundColor: channel.color }} />
                        {channel.name}
                    </span>
                    <span className="font-bold text-foreground">{channel.value}%</span>
                </div>
            ))}
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
