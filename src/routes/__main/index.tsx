// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { StatCard } from '@/components/ui/stat-card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { createFileRoute } from '@tanstack/react-router'
import {
    Activity,
    ArrowUpRight,
    DollarSign,
    Clock,
    ExternalLink,
    UsersRound,
    CalendarDays,
    Ban,
    Star,
    UserCheck,
    UserPlus,
} from 'lucide-react'
import { useState } from 'react'
import {
    Area,
    AreaChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart as RechartsPieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'
import { PageHeader } from '#/components/ui/page-header'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/__main/')({
    component: RouteComponent,
})

// Mock chart data for different intervals
const CHART_DATA_OPTIONS = {
    '7months': [
        { name: 'Jan', booking: 4500 },
        { name: 'Feb', booking: 4800 },
        { name: 'Mar', booking: 8000 },
        { name: 'Apr', booking: 5200 },
        { name: 'May', booking: 8200 },
        { name: 'Jun', booking: 6500 },
        { name: 'Jul', booking: 10500 },
    ],
    '3months': [
        { name: 'May', booking: 8200 },
        { name: 'Jun', booking: 6500 },
        { name: 'Jul', booking: 10500 },
    ],
    '12months': [
        { name: 'Aug', booking: 3800 },
        { name: 'Sep', booking: 4200 },
        { name: 'Oct', booking: 5000 },
        { name: 'Nov', booking: 5500 },
        { name: 'Dec', booking: 7200 },
        { name: 'Jan', booking: 4500 },
        { name: 'Feb', booking: 4800 },
        { name: 'Mar', booking: 8000 },
        { name: 'Apr', booking: 5200 },
        { name: 'May', booking: 8200 },
        { name: 'Jun', booking: 6500 },
        { name: 'Jul', booking: 10500 },
    ],
}

const ChartData = [
    {
        name: 'Returning User',
        value: 70,
        color: '#1E3A8A',
    },
    {
        name: 'New User',
        value: 30,
        color: '#D97706',
    },
]

function RouteComponent() {
    const { t } = useTranslation()
    const [timeframe, setTimeframe] = useState<'7months' | '3months' | '12months'>('7months')
    const chartData = CHART_DATA_OPTIONS[timeframe]

    const chartDataWithT = ChartData.map((item) => ({
        ...item,
        name: item.name === 'Returning User' ? t('dashboard.charts.returningUser') : t('dashboard.charts.newUser'),
    }))

    return (
        <>
            <PageHeader title={t('dashboard.title')} description={t('dashboard.description')} />
            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label={t('dashboard.stats.totalBooking')}
                    value="124"
                    icon={UsersRound}
                    color="blue"
                    trend={{ value: '+12.4%', direction: 'up', label: t('dashboard.stats.fromLastMonth') }}
                />
                <StatCard
                    label={t('dashboard.stats.revenue')}
                    value="$84,000"
                    icon={DollarSign}
                    color="emerald"
                    trend={{ value: '+8.2%', direction: 'up', label: t('dashboard.stats.fromLastMonth') }}
                />
                <StatCard
                    label={t('dashboard.stats.occupancyRate')}
                    value="85%"
                    icon={Activity}
                    color="pink"
                    trend={{ value: '+18.3%', direction: 'up', label: t('dashboard.stats.fromLastMonth') }}
                />
                <StatCard
                    label={t('dashboard.stats.pendingReservations')}
                    value="6"
                    icon={Clock}
                    color="amber"
                    trend={{ value: '-2.4%', direction: 'down', label: t('dashboard.stats.fromLastWeek') }}
                />
            </div>

            {/* Charts & Activity Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
                {/* Booking Chart   - Explicit Padding of 4 */}
                <Card className="lg:col-span-2 border border-border/50 shadow-sm p-4 flex flex-col gap-4">
                    <CardHeader className="p-0 flex flex-row items-center justify-between pb-4 border-b">
                        <div>
                            <CardTitle className="text-lg font-semibold tracking-tight">
                                {t('dashboard.charts.bookingChartTitle')}
                            </CardTitle>
                            <CardDescription>{t('dashboard.charts.bookingChartDesc')}</CardDescription>
                        </div>
                        <Select value={timeframe} onValueChange={(val) => setTimeframe(val as '7months' | '3months' | '12months')}>
                            <SelectTrigger>
                                <SelectValue placeholder={t('dashboard.charts.selectPeriod')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="3months">{t('dashboard.charts.last3Months')}</SelectItem>
                                <SelectItem value="7months">{t('dashboard.charts.last7Months')}</SelectItem>
                                <SelectItem value="12months">{t('dashboard.charts.last12Months')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </CardHeader>
                    <CardContent className="h-88 p-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0071b5" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#0071b5" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(17, 17, 17, 0.05)" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'rgba(17, 17, 17, 0.5)', fontSize: 12, fontWeight: 500 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'rgba(17, 17, 17, 0.5)', fontSize: 11, fontWeight: 500 }}
                                    tickFormatter={(val) => `$${val}`}
                                    dx={-5}
                                />
                                <Tooltip
                                    content={<CustomTooltip />}
                                    cursor={{ stroke: '#0071b5', strokeWidth: 1, strokeDasharray: '3 3' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="booking"
                                    stroke="#0071b5"
                                    strokeWidth={2.5}
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                    activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2, fill: '#0071b5' }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Recent Bookings & Activities - Explicit Padding of 4 */}
                <Card className="border border-border/50 shadow-sm flex flex-col h-full p-4 gap-4">
                    <CardHeader className="p-0 flex flex-row items-center justify-between pb-4 border-b">
                        <div>
                            <CardTitle className="text-lg font-semibold tracking-tight">
                                {t('dashboard.charts.recentBookingsTitle')}
                            </CardTitle>

                            <CardDescription>{t('dashboard.charts.recentBookingsDesc')}</CardDescription>
                        </div>
                    </CardHeader>

                    <CardContent className="flex flex-col items-center justify-center flex-1 p-0">
                        <div className="h-65 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RechartsPieChart>
                                    <Pie
                                        data={chartDataWithT}
                                        dataKey="value"
                                        innerRadius={70}
                                        outerRadius={105}
                                        paddingAngle={0}
                                        stroke="none"
                                    >
                                        {chartDataWithT.map((item, index) => (
                                            <Cell key={`cell-${index}`} fill={item.color} />
                                        ))}
                                    </Pie>
                                </RechartsPieChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="flex items-center justify-center gap-8 pt-2 pb-1 flex-wrap">
                            {chartDataWithT.map((item) => (
                                <div key={item.name} className="flex items-center gap-2">
                                    <div
                                        className="h-3.5 w-3.5 rounded-full"
                                        style={{
                                            backgroundColor: item.color,
                                        }}
                                    />

                                    <span className="text-sm text-muted-foreground font-medium">{item.name}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>

                    <div className="mt-auto pt-4 border-t flex items-center justify-center">
                        <Dialog>
                            <DialogTrigger asChild>
                                <button className="text-xs font-semibold text-primary inline-flex items-center gap-1.5 hover:underline active:scale-95 transition-all cursor-pointer">
                                    {t('dashboard.analytics.viewDetailed')}
                                    <ExternalLink className="h-3.5 w-3.5" />
                                </button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle className="text-xl flex items-center gap-2">
                                        <Activity className="w-5 h-5 text-primary" />
                                        {t('dashboard.analytics.dialogTitle')}
                                    </DialogTitle>
                                    <DialogDescription>{t('dashboard.analytics.dialogDesc')}</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-6 py-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-2 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30">
                                            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                                                <UserCheck className="w-4 h-4" />
                                                <span className="text-sm font-semibold">{t('dashboard.analytics.returningUsers')}</span>
                                            </div>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-2xl font-bold text-blue-700 dark:text-blue-300">70%</span>
                                                <span className="text-xs text-blue-600/70 dark:text-blue-400/70">
                                                    {t('dashboard.analytics.ofTotal')}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2 p-4 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30">
                                            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                                <UserPlus className="w-4 h-4" />
                                                <span className="text-sm font-semibold">{t('dashboard.analytics.newUsers')}</span>
                                            </div>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-2xl font-bold text-green-700 dark:text-green-300">30%</span>
                                                <span className="text-xs text-green-600/70 dark:text-green-400/70">
                                                    {t('dashboard.analytics.ofTotal')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-md bg-primary/10 text-primary">
                                                    <CalendarDays className="w-4 h-4" />
                                                </div>
                                                <span className="text-sm font-medium">{t('dashboard.analytics.avgBookingDuration')}</span>
                                            </div>
                                            <span className="text-sm font-semibold">4.2 days</span>
                                        </div>

                                        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-md bg-destructive/10 text-destructive">
                                                    <Ban className="w-4 h-4" />
                                                </div>
                                                <span className="text-sm font-medium">{t('dashboard.analytics.cancellationRate')}</span>
                                            </div>
                                            <span className="text-sm font-semibold">3.1%</span>
                                        </div>

                                        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-md bg-amber-500/10 text-amber-500">
                                                    <Star className="w-4 h-4" />
                                                </div>
                                                <span className="text-sm font-medium">{t('dashboard.analytics.customerSatisfaction')}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-sm font-semibold">4.8</span>
                                                <span className="text-xs text-muted-foreground">/ 5.0</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </Card>
            </div>
        </>
    )
}

// Custom Tooltip component for Recharts
function CustomTooltip({ active, payload, label }: any) {
    const { t } = useTranslation()

    if (active && payload && payload.length) {
        return (
            <div className="bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md p-3.5 rounded-xl border border-border/40 shadow-xl flex flex-col gap-1.5 animate-in fade-in-0 zoom-in-95 duration-150">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {label} {t('dashboard.stats.totalBooking')}
                </span>
                <span className="text-xl font-bold text-primary tabular-nums">${payload[0].value.toLocaleString()}</span>
                <div className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                    <ArrowUpRight className="h-3 w-3" />
                    <span>+15.2% vs target</span>
                </div>
            </div>
        )
    }
    return null
}
