import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { StatCard } from '@/components/ui/stat-card'
import { createFileRoute } from '@tanstack/react-router'
import { Activity, ArrowUpRight, Building, Calendar, Clock, ExternalLink, TrendingUp, Users } from 'lucide-react'
import { useState } from 'react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export const Route = createFileRoute('/__main/')({
    component: RouteComponent,
})

// Mock chart data for different intervals
const CHART_DATA_OPTIONS = {
    '7months': [
        { name: 'Jan', revenue: 4500 },
        { name: 'Feb', revenue: 4800 },
        { name: 'Mar', revenue: 8000 },
        { name: 'Apr', revenue: 5200 },
        { name: 'May', revenue: 8200 },
        { name: 'Jun', revenue: 6500 },
        { name: 'Jul', revenue: 10500 },
    ],
    '3months': [
        { name: 'May', revenue: 8200 },
        { name: 'Jun', revenue: 6500 },
        { name: 'Jul', revenue: 10500 },
    ],
    '12months': [
        { name: 'Aug', revenue: 3800 },
        { name: 'Sep', revenue: 4200 },
        { name: 'Oct', revenue: 5000 },
        { name: 'Nov', revenue: 5500 },
        { name: 'Dec', revenue: 7200 },
        { name: 'Jan', revenue: 4500 },
        { name: 'Feb', revenue: 4800 },
        { name: 'Mar', revenue: 8000 },
        { name: 'Apr', revenue: 5200 },
        { name: 'May', revenue: 8200 },
        { name: 'Jun', revenue: 6500 },
        { name: 'Jul', revenue: 10500 },
    ],
}

// Mock recent bookings data matching the screenshot and adding a couple more for polish
const RECENT_ACTIVITIES = [
    {
        id: 1,
        title: 'New owner registered',
        time: '2 min ago',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80',
        initials: 'OR',
        type: 'owner',
        badgeColor: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
    },
    {
        id: 2,
        title: 'Tenant account created',
        time: '10 min ago',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80',
        initials: 'TC',
        type: 'tenant',
        badgeColor:
            'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    },
    {
        id: 3,
        title: 'User profile updated',
        time: '20 min ago',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80',
        initials: 'UP',
        type: 'profile',
        badgeColor: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    },
    {
        id: 4,
        title: 'New Reservation',
        time: '2 hr ago',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&h=100&q=80',
        initials: 'NR',
        type: 'booking',
        badgeColor: 'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950/40 dark:text-pink-300 dark:border-pink-800',
    },
    {
        id: 5,
        title: 'Maintenance request filed',
        time: '5 hr ago',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&h=100&q=80',
        initials: 'MR',
        type: 'maintenance',
        badgeColor: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
    },
]

function RouteComponent() {
    const [timeframe, setTimeframe] = useState<'7months' | '3months' | '12months'>('7months')
    const chartData = CHART_DATA_OPTIONS[timeframe]

    return (
        <>
            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Total Users"
                    value="12,842"
                    icon={Users}
                    color="blue"
                    trend={{ value: '+12.4%', direction: 'up', label: 'from last month' }}
                />
                <StatCard
                    label="Total Properties"
                    value="3,120"
                    icon={Building}
                    color="emerald"
                    trend={{ value: '+8.2%', direction: 'up', label: 'from last month' }}
                />
                <StatCard
                    label="Net Revenue"
                    value="$142.5k"
                    icon={TrendingUp}
                    color="pink"
                    trend={{ value: '+18.3%', direction: 'up', label: 'from last month' }}
                />
                <StatCard
                    label="Bookings"
                    value="892"
                    icon={Calendar}
                    color="amber"
                    trend={{ value: '-2.4%', direction: 'down', label: 'from last week' }}
                />
            </div>

            {/* Charts & Activity Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
                {/* Revenue Overview Chart - Explicit Padding of 4 */}
                <Card className="lg:col-span-2 border border-border/50 shadow-sm p-4 flex flex-col gap-4">
                    <CardHeader className="p-0 flex flex-row items-center justify-between pb-4 border-b">
                        <div>
                            <CardTitle className="text-lg font-semibold tracking-tight">Revenue Overview</CardTitle>
                            <CardDescription>Monthly visual of system-wide net revenue collection</CardDescription>
                        </div>
                        <Select value={timeframe} onValueChange={(val) => setTimeframe(val as '7months' | '3months' | '12months')}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select period" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="3months">Last 3 months</SelectItem>
                                <SelectItem value="7months">Last 7 months</SelectItem>
                                <SelectItem value="12months">Last 12 months</SelectItem>
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
                                    dataKey="revenue"
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
                            <CardTitle className="text-lg font-semibold tracking-tight">Recent Activity</CardTitle>
                            <CardDescription>Latest actions taken on the system</CardDescription>
                        </div>
                        <div className="p-1.5 bg-muted text-muted-foreground rounded-lg">
                            <Activity className="h-4 w-4" />
                        </div>
                    </CardHeader>
                    <CardContent className="-m-2.5 p-0">
                        {RECENT_ACTIVITIES.map((activity) => (
                            <div
                                key={activity.id}
                                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/70 transition-all duration-200 group/item cursor-pointer"
                            >
                                <Avatar className="h-10 w-10 border border-border/30 group-hover/item:scale-105 transition-all duration-200">
                                    <AvatarImage src={activity.avatar} alt={activity.title} />
                                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                                        {activity.initials}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate group-hover/item:text-primary transition-colors duration-200">
                                        {activity.title}
                                    </p>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                                        <Clock className="h-3 w-3" />
                                        {activity.time}
                                    </p>
                                </div>
                                <span
                                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${activity.badgeColor} uppercase tracking-wider`}
                                >
                                    {activity.type}
                                </span>
                            </div>
                        ))}
                    </CardContent>
                    <div className="mt-auto pt-4 border-t flex items-center justify-center">
                        <button className="text-xs font-semibold text-primary inline-flex items-center gap-1.5 hover:underline active:scale-95 transition-all cursor-pointer">
                            View All Activities
                            <ExternalLink className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </Card>
            </div>
        </>
    )
}

// Custom Tooltip component for Recharts
function CustomTooltip({ active, payload, label }: any) {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md p-3.5 rounded-xl border border-border/40 shadow-xl flex flex-col gap-1.5 animate-in fade-in-0 zoom-in-95 duration-150">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label} Revenue</span>
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
