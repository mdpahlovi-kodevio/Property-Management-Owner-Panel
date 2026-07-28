import type { StatCardProps } from '@/components/ui/stat-card'
import { BedDouble, CalendarDays, TrendingUp, UsersRound } from 'lucide-react'

export type RevenueTrend = {
    month: string
    revenue: number
    bookings: number
}

export type PropertyPerformance = {
    property: string
    occupancy: number
    revenue: number
}

export type BookingChannel = {
    name: string
    value: number
    fill: string
}

const REVENUE_TREND: RevenueTrend[] = [
    { month: 'Jan', revenue: 15200, bookings: 92 },
    { month: 'Feb', revenue: 18400, bookings: 111 },
    { month: 'Mar', revenue: 22100, bookings: 138 },
    { month: 'Apr', revenue: 19800, bookings: 126 },
    { month: 'May', revenue: 26400, bookings: 157 },
    { month: 'Jun', revenue: 31200, bookings: 181 },
]

const PROPERTY_PERFORMANCE: PropertyPerformance[] = [
    { property: 'Ocean View', occupancy: 91, revenue: 18400 },
    { property: 'City Suites', occupancy: 84, revenue: 14200 },
    { property: 'Green Retreat', occupancy: 78, revenue: 11700 },
    { property: 'Harbor House', occupancy: 73, revenue: 9600 },
]

const BOOKING_CHANNELS: BookingChannel[] = [
    { name: 'Direct', value: 42, fill: 'var(--chart-1)' },
    { name: 'Booking.com', value: 31, fill: 'var(--chart-2)' },
    { name: 'Airbnb', value: 19, fill: 'var(--chart-3)' },
    { name: 'Other', value: 8, fill: 'var(--chart-4)' },
]

const SUMMARY_CARDS: StatCardProps[] = [
    {
        label: 'Gross revenue',
        value: '$124,592',
        icon: TrendingUp,
        color: 'blue',
        trend: { value: '12.8%', direction: 'up', label: 'vs. last period' },
    },
    {
        label: 'Occupancy rate',
        value: '84.2%',
        icon: BedDouble,
        color: 'emerald',
        trend: { value: '6.4%', direction: 'up', label: 'vs. last period' },
    },
    {
        label: 'Average daily rate',
        value: '$184.50',
        icon: CalendarDays,
        color: 'orange',
        trend: { value: '2.1%', direction: 'up', label: 'vs. last period' },
    },
    {
        label: 'Total reservations',
        value: '1,248',
        icon: UsersRound,
        color: 'pink',
        trend: { value: '4.7%', direction: 'down', label: 'vs. last period' },
    },
]

export function getRevenueTrend(): RevenueTrend[] {
    return REVENUE_TREND
}

export function getPropertyPerformance(): PropertyPerformance[] {
    return PROPERTY_PERFORMANCE
}

export function getBookingChannels(): BookingChannel[] {
    return BOOKING_CHANNELS
}

export function getAnalyticsSummaryCards(): StatCardProps[] {
    return SUMMARY_CARDS
}

export function getAnalyticsCsv(): string {
    return ['Month,Revenue,Bookings', ...REVENUE_TREND.map(({ month, revenue, bookings }) => `${month},${revenue},${bookings}`)].join('\n')
}
