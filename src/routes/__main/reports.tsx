import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'
import { DataTable } from '@/components/ui/data-table'
import type { DataTableColumn } from '@/components/ui/data-table';
import { PageHeader } from '@/components/ui/page-header'
import { StatCardsGrid } from '@/components/ui/stat-card'
import { createFileRoute } from '@tanstack/react-router'
import { Filter } from 'lucide-react'
import { useMemo, useState } from 'react'

export const Route = createFileRoute('/__main/reports')({
    component: RouteComponent,
})

import {
    OCCUPANCY_DATA,
    REVENUE_DATA,
    ARRIVALS_DATA,
    OCCUPANCY_STATS_CARDS,
    REVENUE_STATS_CARDS,
    ARRIVALS_STATS_CARDS,
    type OccupancyData,
    type RevenueData,
    type ArrivalsData
} from '@/lib/reports'

function RouteComponent() {
    const [activeTab, setActiveTab] = useState<'occupancy' | 'revenue' | 'arrivals'>(() => {
        return (sessionStorage.getItem('reportsTab') as any) || 'arrivals'
    })

    const handleTabChange = (tab: 'occupancy' | 'revenue' | 'arrivals') => {
        setActiveTab(tab)
        sessionStorage.setItem('reportsTab', tab)
    }

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
                render: (r) => (
                    <Link to="/reports/$source" params={{ source: r.source.toLowerCase() }} className="inline-flex items-center justify-center whitespace-nowrap bg-[#24357B] hover:bg-[#24357B]/90 text-white rounded-md h-8 px-4 text-xs font-medium">
                        View
                    </Link>
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
                <div className="sticky top-0 left-0 right-0 z-10 flex items-center gap-3 w-full sm:w-auto pb-1 sm:pb-0">
                    <Button
                        variant={activeTab === 'occupancy' ? 'default' : 'outline'}
                        className={`rounded-md px-6 transition-colors ${activeTab === 'occupancy' ? 'bg-[#24357B] hover:bg-[#24357B]/90 text-white' : ''}`}
                        onClick={() => handleTabChange('occupancy')}
                    >
                        Occupancy
                    </Button>
                    <Button
                        variant={activeTab === 'revenue' ? 'default' : 'outline'}
                        className={`rounded-md px-6 transition-colors ${activeTab === 'revenue' ? 'bg-[#24357B] hover:bg-[#24357B]/90 text-white' : ''}`}
                        onClick={() => handleTabChange('revenue')}
                    >
                        Revenue by Source
                    </Button>
                    <Button
                        variant={activeTab === 'arrivals' ? 'default' : 'outline'}
                        className={`rounded-md px-6 transition-colors ${activeTab === 'arrivals' ? 'bg-[#24357B] hover:bg-[#24357B]/90 text-white' : ''}`}
                        onClick={() => handleTabChange('arrivals')}
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
                    cards={OCCUPANCY_STATS_CARDS}
                />
            )}

            {activeTab === 'revenue' && (
                <StatCardsGrid
                    cards={REVENUE_STATS_CARDS}
                />
            )}

            {activeTab === 'arrivals' && (
                <StatCardsGrid
                    cards={ARRIVALS_STATS_CARDS}
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
