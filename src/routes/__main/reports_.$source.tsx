import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import type { DataTableColumn } from '@/components/ui/data-table'
import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { useMemo, useState } from 'react'

export const Route = createFileRoute('/__main/reports_/$source')({
    component: RouteComponent,
})

type SourceReportData = {
    id: number
    date: string
    totalBookings: number
    totalRevenue: string
    totalEarnings: string
    expectedPayout: string
}

const REPORT_DATA: SourceReportData[] = Array.from({ length: 16 }).map((_, i) => ({
    id: i + 1,
    date: `${(i + 1).toString().padStart(2, '0')} Apr 2026`,
    totalBookings: [10, 20, 30, 20, 30, 60, 50, 30, 70, 60, 50, 30, 30, 20, 20, 20][i],
    totalRevenue: '$10,320',
    totalEarnings: '$10,320',
    expectedPayout: '$8,320',
}))

function RouteComponent() {
    const { source } = Route.useParams()
    const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily')

    // Capitalize source for the title
    const formattedSource = source.charAt(0).toUpperCase() + source.slice(1)

    const columns = useMemo<DataTableColumn<SourceReportData>[]>(
        () => [
            { key: 'date', header: 'Date', render: (r) => <span className="text-muted-foreground">{r.date}</span> },
            { key: 'totalBookings', header: 'Total Bookings', render: (r) => <span className="text-muted-foreground">{r.totalBookings}</span> },
            { key: 'totalRevenue', header: 'Total Revenue', render: (r) => <span className="text-muted-foreground">{r.totalRevenue}</span> },
            { key: 'totalEarnings', header: 'Total Earnings', render: (r) => <span className="text-muted-foreground">{r.totalEarnings}</span> },
            { key: 'expectedPayout', header: 'Expected Payout', render: (r) => <span className="text-muted-foreground">{r.expectedPayout}</span> },
        ],
        []
    )

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" asChild className="h-8 w-8 rounded-full">
                    <Link to="/reports">
                        <ArrowLeft className="h-5 w-5" />
                        <span className="sr-only">Back</span>
                    </Link>
                </Button>
                <h1 className="text-2xl font-bold tracking-tight">{formattedSource} Reports</h1>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 w-full sm:w-auto  pb-1 sm:pb-0">
                    {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((tab) => (
                        <Button
                            key={tab}
                            variant={activeTab === tab ? 'default' : 'outline'}
                            className={`rounded-[20px] px-6 transition-colors ${activeTab === tab ? 'bg-[#24357B] hover:bg-[#24357B]/90 text-white' : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </Button>
                    ))}
                </div>
            </div>

            <DataTable columns={columns} data={REPORT_DATA} noun="records" />
        </div>
    )
}
