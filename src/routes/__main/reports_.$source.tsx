import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import type { DataTableColumn } from '@/components/ui/data-table'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { useMemo, useState } from 'react'

export const Route = createFileRoute('/__main/reports_/$source')({
    component: RouteComponent,
})

import { getSourceReportData, type SourceReportData } from '@/lib/reports'
import { PageHeader } from '#/components/ui/page-header'

function RouteComponent() {
    const navigate = useNavigate()
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
            <div className="flex flex-col gap-2">
                <Button variant="default" size="sm" className="w-fit" onClick={() => navigate({ to: '/reports' })}>
                    <ArrowLeft className="mr-2 w-4" />
                    Back to Reports
                </Button>
                <PageHeader title="Reports by Source" description="Manage Reports by Source" />
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

            <DataTable columns={columns} data={getSourceReportData(source, activeTab)} noun="records" />
        </div>
    )
}
