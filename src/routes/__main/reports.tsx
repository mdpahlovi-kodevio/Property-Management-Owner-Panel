import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import type { DataTableColumn } from '@/components/ui/data-table';
import { PageHeader } from '@/components/ui/page-header'
import { StatCardsGrid } from '@/components/ui/stat-card'
import { createFileRoute } from '@tanstack/react-router'
import { ArrowDownRight, ArrowUpRight, BedDouble, CalendarCheck, CalendarX, Filter, Home, Users } from 'lucide-react'
import { useMemo, useState } from 'react'

export const Route = createFileRoute('/__main/reports')({
    component: RouteComponent,
})

type OccupancyData = {
    id: number
    date: string
    availableRooms: number
    occupied: number
    occupancyRate: string
    adr: string
    revpar: string
    revenue: string
}

const OCCUPANCY_DATA: OccupancyData[] = [
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

type RevenueData = {
    id: number
    source: string
    bookings: number
    totalRevenue: string
    totalEarnings: string
    expectedPayout: string
}

const REVENUE_DATA: RevenueData[] = [
    { id: 1, source: 'Airbnb', bookings: 142, totalRevenue: '$84,320', totalEarnings: '$84,320', expectedPayout: '$50000' },
    { id: 2, source: 'Booking.com', bookings: 142, totalRevenue: '$84,320', totalEarnings: '$84,320', expectedPayout: '$50000' },
    { id: 3, source: 'Direct', bookings: 142, totalRevenue: '$84,320', totalEarnings: '$84,320', expectedPayout: '$50000' },
    { id: 4, source: 'Expedia', bookings: 142, totalRevenue: '$84,320', totalEarnings: '$84,320', expectedPayout: '$50000' },
    { id: 5, source: 'Vrbo', bookings: 142, totalRevenue: '$84,320', totalEarnings: '$84,320', expectedPayout: '$50000' },
    { id: 6, source: 'Direct', bookings: 24, totalRevenue: '$84,320', totalEarnings: '$84,320', expectedPayout: '$50000' },
    { id: 7, source: 'Booking.com', bookings: 24, totalRevenue: '$84,320', totalEarnings: '$84,320', expectedPayout: '$50000' },
]

type ArrivalsData = {
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

const ARRIVALS_DATA: ArrivalsData[] = [
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

function RouteComponent() {
    const [activeTab, setActiveTab] = useState<'occupancy' | 'revenue' | 'arrivals'>('arrivals')

    const occupancyColumns = useMemo<DataTableColumn<OccupancyData>[]>(
        () => [
            { key: 'date', header: 'Date', render: (r) => <span className="text-muted-foreground">{r.date}</span> },
            { key: 'availableRooms', header: 'Available Rooms', render: (r) => <span className="text-muted-foreground">{r.availableRooms}</span> },
            { key: 'occupied', header: 'Occupied', render: (r) => <span className="text-muted-foreground">{r.occupied}</span> },
            { key: 'occupancyRate', header: 'Occupancy %', render: (r) => <span className="text-muted-foreground">{r.occupancyRate}</span> },
            { key: 'adr', header: 'ADR', render: (r) => <span className="text-muted-foreground">{r.adr}</span> },
            { key: 'revpar', header: 'REVPAR', render: (r) => <span className="text-muted-foreground">{r.revpar}</span> },
            { key: 'revenue', header: 'Revenue', render: (r) => <span className="text-muted-foreground">{r.revenue}</span> },
        ],
        []
    )

    const revenueColumns = useMemo<DataTableColumn<RevenueData>[]>(
        () => [
            { key: 'source', header: 'Booking Source', render: (r) => <span className="text-muted-foreground">{r.source}</span> },
            { key: 'bookings', header: 'Total Bookings', render: (r) => <span className="text-muted-foreground">{r.bookings}</span> },
            { key: 'totalRevenue', header: 'Total Revenue', render: (r) => <span className="text-muted-foreground">{r.totalRevenue}</span> },
            { key: 'totalEarnings', header: 'Total Earnings', render: (r) => <span className="text-muted-foreground">{r.totalEarnings}</span> },
            { key: 'expectedPayout', header: 'Expected Payout', render: (r) => <span className="text-muted-foreground">{r.expectedPayout}</span> },
            {
                key: 'action',
                header: 'Action',
                render: () => (
                    <Button size="sm" className="bg-[#24357B] hover:bg-[#24357B]/90 text-white rounded-md h-8 px-4 text-xs font-medium">
                        View
                    </Button>
                )
            },
        ],
        []
    )

    const arrivalsColumns = useMemo<DataTableColumn<ArrivalsData>[]>(
        () => [
            { key: 'bookingId', header: 'Booking ID', render: (r) => <span className="text-muted-foreground">{r.bookingId}</span> },
            { key: 'guest', header: 'Guest', render: (r) => <span className="text-muted-foreground">{r.guest}</span> },
            { key: 'propertyUnit', header: 'Property / Unit', render: (r) => <span className="text-muted-foreground">{r.propertyUnit}</span> },
            { key: 'checkIn', header: 'Check-in', render: (r) => <span className="text-muted-foreground">{r.checkIn}</span> },
            { key: 'checkOut', header: 'Check-out', render: (r) => <span className="text-muted-foreground">{r.checkOut}</span> },
            { key: 'nights', header: 'Nights', render: (r) => <span className="text-muted-foreground">{r.nights}</span> },
            { key: 'source', header: 'Source', render: (r) => <span className="text-muted-foreground">{r.source}</span> },
            {
                key: 'status',
                header: 'Status',
                render: (r) => (
                    <span className={`text-xs font-medium ${r.status === 'Checked-in' ? 'text-green-500' : 'text-orange-400'}`}>
                        {r.status}
                    </span>
                )
            },
        ],
        []
    )

    return (
        <>
            <PageHeader title="Reports" description="Track occupancy, revenue, and daily operations" className="mb-0" />

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                    <Button
                        variant={activeTab === 'occupancy' ? 'default' : 'outline'}
                        className={`rounded-md px-6 transition-colors ${activeTab === 'occupancy' ? 'bg-[#24357B] hover:bg-[#24357B]/90 text-white' : ''}`}
                        onClick={() => setActiveTab('occupancy')}
                    >
                        Occupancy
                    </Button>
                    <Button
                        variant={activeTab === 'revenue' ? 'default' : 'outline'}
                        className={`rounded-md px-6 transition-colors ${activeTab === 'revenue' ? 'bg-[#24357B] hover:bg-[#24357B]/90 text-white' : ''}`}
                        onClick={() => setActiveTab('revenue')}
                    >
                        Revenue by Source
                    </Button>
                    <Button
                        variant={activeTab === 'arrivals' ? 'default' : 'outline'}
                        className={`rounded-md px-6 transition-colors ${activeTab === 'arrivals' ? 'bg-[#24357B] hover:bg-[#24357B]/90 text-white' : ''}`}
                        onClick={() => setActiveTab('arrivals')}
                    >
                        Arrivals / Departures
                    </Button>
                </div>
                <Button variant="outline" className="rounded-md w-full sm:w-auto">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                </Button>
            </div>
            {activeTab === 'occupancy' && (
                <StatCardsGrid
                    cards={[
                        {
                            label: "Occupancy Rate",
                            value: "83.3%",
                            icon: BedDouble,
                            color: "blue",
                            trend: { direction: 'up', value: '4.2%', label: 'vs last period' }
                        },
                        {
                            label: "ADR (Avg. Daily Rate)",
                            value: "$182.50",
                            icon: Home,
                            color: "emerald",
                            trend: { direction: 'up', value: '4.2%', label: 'vs last period' }
                        },
                        {
                            label: "REVPAR",
                            value: "$143.08",
                            icon: CalendarCheck,
                            color: "amber",
                            trend: { direction: 'up', value: '4.2%', label: 'vs last period' }
                        },
                        {
                            label: "Total Room Nights",
                            value: "1,247",
                            icon: Users,
                            color: "slate",
                            trend: { direction: 'down', value: '32', label: 'vs last period' }
                        }
                    ]}
                />
            )}

            {activeTab === 'revenue' && (
                <StatCardsGrid
                    cards={[
                        {
                            label: "Total Revenue",
                            value: "$84,320",
                            icon: CalendarCheck,
                            color: "blue",
                            trend: { direction: 'up', value: '4.2%', label: 'vs last period' }
                        },
                        {
                            label: "Total Bookings",
                            value: "72,180",
                            icon: BedDouble,
                            color: "emerald",
                            trend: { direction: 'up', value: '4.2%', label: 'vs last period' }
                        },
                        {
                            label: "Net Earnings",
                            value: "$12,140",
                            icon: CalendarX,
                            color: "orange",
                            trend: { direction: 'down', value: 'Lower direct share', label: '' }
                        },
                        {
                            label: "Top Channel",
                            value: "Airbnb",
                            icon: Home,
                            color: "amber"
                        }
                    ]}
                />
            )}

            {activeTab === 'arrivals' && (
                <StatCardsGrid
                    cards={[
                        {
                            label: "Arrivals Today",
                            value: "8",
                            icon: ArrowDownRight,
                            color: "blue"
                        },
                        {
                            label: "Departures Today",
                            value: "6",
                            icon: ArrowUpRight,
                            color: "orange"
                        },
                        {
                            label: "In-house",
                            value: "20",
                            icon: Home,
                            color: "emerald"
                        },
                        {
                            label: "No-shows",
                            value: "1",
                            icon: CalendarX,
                            color: "rose"
                        }
                    ]}
                />
            )}

            {activeTab === 'occupancy' && (
                <DataTable columns={occupancyColumns} data={OCCUPANCY_DATA} noun="reports" />
            )}

            {activeTab === 'revenue' && (
                <DataTable columns={revenueColumns} data={REVENUE_DATA} noun="revenue sources" />
            )}

            {activeTab === 'arrivals' && (
                <DataTable columns={arrivalsColumns} data={ARRIVALS_DATA} noun="arrivals" />
            )}
        </>
    )
}