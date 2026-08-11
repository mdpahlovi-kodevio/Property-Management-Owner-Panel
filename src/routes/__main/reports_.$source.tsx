import { defaultReportRange, ReportFilterBar } from '@/components/reports/report-filter-bar'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import type { DataTableColumn } from '@/components/ui/data-table'
import { PageHeader } from '@/components/ui/page-header'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useSearchParams } from '@/hooks/use-search-params'
import type { ReportPeriod, SourceReportRow } from '@/lib/api'
import { reportsApi } from '@/lib/api'
import { formatCurrency, formatSource } from '@/lib/reports'
import { GetProperties } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { useMemo, useState } from 'react'
import * as z from 'zod'

const searchSchema = z.object({
    from: z.string().optional(),
    to: z.string().optional(),
    propertyId: z.string().optional(),
})

export const Route = createFileRoute('/__main/reports_/$source')({
    validateSearch: searchSchema,
    component: RouteComponent,
})

const PERIOD_OPTIONS: ReportPeriod[] = ['daily', 'weekly', 'monthly', 'yearly']

function RouteComponent() {
    const navigate = useNavigate()
    const mergeSearch = useSearchParams()
    const { source } = Route.useParams()
    const query = Route.useSearch()
    const properties = GetProperties()
    const [activeTab, setActiveTab] = useState<ReportPeriod>('daily')

    const currency =
        (query.propertyId ? properties.find((p) => p.id === query.propertyId)?.currency : undefined) ??
        properties[0]?.currency ??
        'USD'

    const defaultRange = defaultReportRange()

    const { data, isLoading } = useQuery({
        queryKey: ['reports-source', source, activeTab, query],
        queryFn: () => reportsApi.source(source, { period: activeTab, from: query.from, to: query.to, propertyId: query.propertyId }),
    })

    const rows = data?.data ?? []

    const columns = useMemo<DataTableColumn<SourceReportRow>[]>(
        () => [
            { key: 'label', header: 'Date', render: (r) => <span className="text-muted-foreground">{r.label}</span> },
            { key: 'totalBookings', header: 'Total Bookings', render: (r) => <span className="text-muted-foreground">{r.totalBookings}</span> },
            { key: 'totalRevenue', header: 'Total Revenue', render: (r) => <span className="text-muted-foreground">{formatCurrency(r.totalRevenue, currency)}</span> },
            { key: 'totalEarnings', header: 'Total Earnings', render: (r) => <span className="text-muted-foreground">{formatCurrency(r.totalEarnings, currency)}</span> },
            { key: 'expectedPayout', header: 'Expected Payout', render: (r) => <span className="text-muted-foreground">{formatCurrency(r.expectedPayout, currency)}</span> },
        ],
        [currency],
    )

    const handleReset = () => mergeSearch({ from: undefined, to: undefined, propertyId: undefined })

    return (
        <div className="space-y-6">
            <Button
                variant="ghost"
                size="sm"
                className="-ml-2 w-fit text-muted-foreground hover:text-foreground"
                onClick={() => navigate({ to: '/reports', search: { from: query.from, to: query.to, propertyId: query.propertyId } })}
            >
                <ArrowLeft className="mr-1.5 h-4 w-4" />
                Back to Reports
            </Button>

            {/* Title + segmented period switcher */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <PageHeader title="Reports by Source" description={`${formatSource(source)} channel — ${activeTab} breakdown`} />

                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ReportPeriod)}>
                    <TabsList
                        variant="primary"
                        className="h-9 max-w-full overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    >
                        {PERIOD_OPTIONS.map((tab) => (
                            <TabsTrigger key={tab} value={tab} className="h-7 shrink-0 px-4 text-sm capitalize">
                                {tab}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
            </div>

            <ReportFilterBar
                initial={{ from: query.from ?? defaultRange.from, to: query.to ?? defaultRange.to, propertyId: query.propertyId }}
                properties={properties}
                onApply={(filters) => mergeSearch({ ...filters })}
                onReset={handleReset}
            />

            <DataTable
                loading={isLoading}
                columns={columns}
                data={rows}
                noun="records"
                page={1}
                limit={rows.length || 1}
                total={rows.length}
                limitOptions={[rows.length || 1]}
                onReset={handleReset}
            />
        </div>
    )
}
