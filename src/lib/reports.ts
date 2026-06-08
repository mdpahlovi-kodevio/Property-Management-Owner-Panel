export type OccupancyData = {
    id: number
    date: string
    availableRooms: number
    occupied: number
    occupancyRate: string
    adr: string
    revpar: string
    revenue: string
}

export const OCCUPANCY_DATA: OccupancyData[] = [
    { id: 1, date: 'Apr 28, 2026', availableRooms: 24, occupied: 20, occupancyRate: '83.3%', adr: '$185.00', revpar: '$154.17', revenue: '$3,700.00' },
    { id: 2, date: 'Apr 27, 2026', availableRooms: 24, occupied: 19, occupancyRate: '79.2%', adr: '$180.00', revpar: '$154.17', revenue: '$3,420.00' },
    { id: 3, date: 'Apr 26, 2026', availableRooms: 24, occupied: 22, occupancyRate: '91.7%', adr: '$195.00', revpar: '$154.17', revenue: '$4,290.00' },
    { id: 4, date: 'Apr 25, 2026', availableRooms: 24, occupied: 21, occupancyRate: '87.5%', adr: '$190.00', revpar: '$154.17', revenue: '$3,990.00' },
    { id: 5, date: 'Apr 24, 2026', availableRooms: 24, occupied: 17, occupancyRate: '70.8%', adr: '$175.00', revpar: '$154.17', revenue: '$3,990.00' },
    { id: 6, date: 'Apr 23, 2026', availableRooms: 24, occupied: 16, occupancyRate: '66.7%', adr: '$172.00', revpar: '$154.17', revenue: '$3,990.00' },
    { id: 7, date: 'Apr 22, 2026', availableRooms: 24, occupied: 18, occupancyRate: '75.0%', adr: '$178.00', revpar: '$154.17', revenue: '$3,990.00' },
    { id: 8, date: 'Apr 21, 2026', availableRooms: 24, occupied: 14, occupancyRate: '60.0%', adr: '$185.00', revpar: '$154.17', revenue: '$3,990.00' },
    { id: 9, date: 'Apr 20, 2026', availableRooms: 24, occupied: 20, occupancyRate: '70.0%', adr: '$195.00', revpar: '$154.17', revenue: '$3,990.00' },
    { id: 10, date: 'Apr 19, 2026', availableRooms: 24, occupied: 10, occupancyRate: '87.5%', adr: '$190.00', revpar: '$154.17', revenue: '$3,990.00' },
    { id: 11, date: 'Apr 18, 2026', availableRooms: 24, occupied: 16, occupancyRate: '66.7%', adr: '$185.00', revpar: '$154.17', revenue: '$3,990.00' },
    { id: 12, date: 'Apr 17, 2026', availableRooms: 24, occupied: 22, occupancyRate: '87.5%', adr: '$172.00', revpar: '$154.17', revenue: '$3,990.00' },
    { id: 13, date: 'Apr 16, 2026', availableRooms: 24, occupied: 17, occupancyRate: '87.5%', adr: '$175.00', revpar: '$154.17', revenue: '$3,990.00' },
]

export type RevenueData = {
    id: number
    source: string
    bookings: number
    totalRevenue: string
    totalEarnings: string
    expectedPayout: string
}

export const REVENUE_DATA: RevenueData[] = [
    { id: 1, source: 'Airbnb', bookings: 142, totalRevenue: '$84,320', totalEarnings: '$84,320', expectedPayout: '$50000' },
    { id: 2, source: 'Booking.com', bookings: 142, totalRevenue: '$84,320', totalEarnings: '$84,320', expectedPayout: '$50000' },
    { id: 3, source: 'Direct', bookings: 142, totalRevenue: '$84,320', totalEarnings: '$84,320', expectedPayout: '$50000' },
    { id: 4, source: 'Expedia', bookings: 142, totalRevenue: '$84,320', totalEarnings: '$84,320', expectedPayout: '$50000' },
    { id: 5, source: 'Vrbo', bookings: 142, totalRevenue: '$84,320', totalEarnings: '$84,320', expectedPayout: '$50000' },
    { id: 6, source: 'Direct', bookings: 24, totalRevenue: '$84,320', totalEarnings: '$84,320', expectedPayout: '$50000' },
    { id: 7, source: 'Booking.com', bookings: 24, totalRevenue: '$84,320', totalEarnings: '$84,320', expectedPayout: '$50000' },
]

export type ArrivalsData = {
    id: number
    bookingId: string
    guest: string
    propertyUnit: string
    checkIn: string
    checkOut: string
    nights: number
    source: string
    status: 'Checked-in' | 'Pending'
}

export const ARRIVALS_DATA: ArrivalsData[] = [
    { id: 1, bookingId: '#BK-1042', guest: 'Sarah Mitchell', propertyUnit: 'Sunset Villa / 201', checkIn: 'Apr 28, 15:00', checkOut: 'May 02, 11:00', nights: 4, source: 'Airbnb', status: 'Checked-in' },
    { id: 2, bookingId: '#BK-1043', guest: 'James Carter', propertyUnit: 'Downtown Loft / 12B', checkIn: 'Apr 28, 15:00', checkOut: 'May 02, 11:00', nights: 4, source: 'Airbnb', status: 'Checked-in' },
    { id: 3, bookingId: '#BK-1044', guest: 'James Carter', propertyUnit: 'Sunset Villa / 201', checkIn: 'Apr 28, 15:00', checkOut: 'May 02, 11:00', nights: 4, source: 'Airbnb', status: 'Checked-in' },
    { id: 4, bookingId: '#BK-1045', guest: 'James Carter', propertyUnit: 'Downtown Loft / 12B', checkIn: 'Apr 28, 15:00', checkOut: 'May 02, 11:00', nights: 4, source: 'Direct', status: 'Checked-in' },
    { id: 5, bookingId: '#BK-1046', guest: 'Sarah Mitchell', propertyUnit: 'Sunset Villa / 201', checkIn: 'Apr 28, 15:00', checkOut: 'May 02, 11:00', nights: 4, source: 'Direct', status: 'Checked-in' },
    { id: 6, bookingId: '#BK-1047', guest: 'James Carter', propertyUnit: 'Downtown Loft / 12B', checkIn: 'Apr 28, 15:00', checkOut: 'May 02, 11:00', nights: 4, source: 'Direct', status: 'Pending' },
    { id: 7, bookingId: '#BK-1048', guest: 'Sarah Mitchell', propertyUnit: 'Sunset Villa / 201', checkIn: 'Apr 28, 15:00', checkOut: 'May 02, 11:00', nights: 4, source: 'Expedia', status: 'Checked-in' },
    { id: 8, bookingId: '#BK-1049', guest: 'Sarah Mitchell', propertyUnit: 'Downtown Loft / 12B', checkIn: 'Apr 28, 15:00', checkOut: 'May 02, 11:00', nights: 4, source: 'Expedia', status: 'Checked-in' },
    { id: 9, bookingId: '#BK-1050', guest: 'James Carter', propertyUnit: 'Sunset Villa / 201', checkIn: 'Apr 28, 15:00', checkOut: 'May 02, 11:00', nights: 4, source: 'Airbnb', status: 'Pending' },
    { id: 10, bookingId: '#BK-1051', guest: 'Sarah Mitchell', propertyUnit: 'Downtown Loft / 12B', checkIn: 'Apr 28, 15:00', checkOut: 'May 02, 11:00', nights: 4, source: 'Airbnb', status: 'Pending' },
    { id: 11, bookingId: '#BK-1052', guest: 'James Carter', propertyUnit: 'Sunset Villa / 201', checkIn: 'Apr 28, 15:00', checkOut: 'May 02, 11:00', nights: 4, source: 'Airbnb', status: 'Pending' },
    { id: 12, bookingId: '#BK-1053', guest: 'Sarah Mitchell', propertyUnit: 'Downtown Loft / 12B', checkIn: 'Apr 28, 15:00', checkOut: 'May 02, 11:00', nights: 4, source: 'Direct', status: 'Checked-in' },
    { id: 13, bookingId: '#BK-1054', guest: 'James Carter', propertyUnit: 'Sunset Villa / 201', checkIn: 'Apr 28, 15:00', checkOut: 'May 02, 11:00', nights: 4, source: 'Direct', status: 'Checked-in' },
]

export type SourceReportData = {
    id: number
    date: string
    totalBookings: number
    totalRevenue: string
    totalEarnings: string
    expectedPayout: string
}

export const SOURCE_REPORT_DATA: SourceReportData[] = Array.from({ length: 16 }).map((_, i) => ({
    id: i + 1,
    date: `${(i + 1).toString().padStart(2, '0')} Apr 2026`,
    totalBookings: [10, 20, 30, 20, 30, 60, 50, 30, 70, 60, 50, 30, 30, 20, 20, 20][i],
    totalRevenue: '$10,320',
    totalEarnings: '$10,320',
    expectedPayout: '$8,320',
}))

import { BedDouble, CalendarCheck, CalendarX, Home, Users, ArrowDownRight, ArrowUpRight } from 'lucide-react'

export const OCCUPANCY_STATS_CARDS = [
    {
        label: "Occupancy Rate",
        value: "83.3%",
        icon: BedDouble,
        color: "blue" as const,
        trend: { direction: 'up' as const, value: '4.2%', label: 'vs last period' }
    },
    {
        label: "ADR (Avg. Daily Rate)",
        value: "$182.50",
        icon: Home,
        color: "emerald" as const,
        trend: { direction: 'up' as const, value: '4.2%', label: 'vs last period' }
    },
    {
        label: "REVPAR",
        value: "$143.08",
        icon: CalendarCheck,
        color: "amber" as const,
        trend: { direction: 'up' as const, value: '4.2%', label: 'vs last period' }
    },
    {
        label: "Total Room Nights",
        value: "1,247",
        icon: Users,
        color: "slate" as const,
        trend: { direction: 'down' as const, value: '32', label: 'vs last period' }
    }
]

export const REVENUE_STATS_CARDS = [
    {
        label: "Total Revenue",
        value: "$84,320",
        icon: CalendarCheck,
        color: "blue" as const,
        trend: { direction: 'up' as const, value: '4.2%', label: 'vs last period' }
    },
    {
        label: "Total Bookings",
        value: "72,180",
        icon: BedDouble,
        color: "emerald" as const,
        trend: { direction: 'up' as const, value: '4.2%', label: 'vs last period' }
    },
    {
        label: "Net Earnings",
        value: "$12,140",
        icon: CalendarX,
        color: "orange" as const,
        trend: { direction: 'down' as const, value: 'Lower direct share', label: '' }
    },
    {
        label: "Top Channel",
        value: "Airbnb",
        icon: Home,
        color: "amber" as const
    }
]

export const ARRIVALS_STATS_CARDS = [
    {
        label: "Arrivals Today",
        value: "8",
        icon: ArrowDownRight,
        color: "blue" as const
    },
    {
        label: "Departures Today",
        value: "6",
        icon: ArrowUpRight,
        color: "orange" as const
    },
    {
        label: "In-house",
        value: "20",
        icon: Home,
        color: "emerald" as const
    },
    {
        label: "No-shows",
        value: "1",
        icon: CalendarX,
        color: "rose" as const
    }
]
