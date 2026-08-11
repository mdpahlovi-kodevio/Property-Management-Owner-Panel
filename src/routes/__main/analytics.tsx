import { OccupancyTab } from '@/components/analytics/occupancy-tab'
import { OperationsTab } from '@/components/analytics/operations-tab'
import { OverviewTab } from '@/components/analytics/overview-tab'
import { RevenueTab } from '@/components/analytics/revenue-tab'
import { PageHeader } from '@/components/ui/page-header'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useSearchParams } from '@/hooks/use-search-params'
import { analyticsApi, bookingApi, overviewApi, reportsApi } from '@/lib/api'
import type { TrendGranularity } from '@/lib/api'
import { PERIOD_OPTIONS, periodRange } from '@/lib/analytics-utils'
import type { PeriodValue } from '@/lib/analytics-utils'
import { GetProperties } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { BedDouble, CalendarDays, CircleDollarSign, Hotel, TrendingUp } from 'lucide-react'
import { useMemo, useState } from 'react'
import * as z from 'zod'

const searchSchema = z.object({
    // .min/.catch guard against hand-edited URLs (?limit=0 or non-numeric).
    page: z.number().min(1).default(1).catch(1),
    limit: z.number().min(1).default(10).catch(10),
})

export const Route = createFileRoute('/__main/analytics')({
    validateSearch: searchSchema,
    component: AnalyticsPage,
})

function AnalyticsPage() {
    const [period, setPeriod] = useState<PeriodValue>('30d')
    const [propertyId, setPropertyId] = useState('all')
    const [granularity, setGranularity] = useState<TrendGranularity>('daily')
    const [tab, setTab] = useState(() => sessionStorage.getItem('analyticsTab') ?? 'overview')
    const handleTabChange = (nextTab: string) => {
        setTab(nextTab)
        sessionStorage.setItem('analyticsTab', nextTab)
    }

    const properties = GetProperties()
    const search = Route.useSearch()
    const mergeSearch = useSearchParams()
    const currency =
        (propertyId !== 'all' ? properties.find((p) => p.id === propertyId)?.currency : undefined) ??
        properties[0]?.currency ??
        'USD'

    const handlePropertyChange = (value: string) => {
        setPropertyId(value)
        mergeSearch({ page: 1 })
    }
    const handlePeriodChange = (value: PeriodValue) => {
        setPeriod(value)
        mergeSearch({ page: 1 })
    }

    const range = useMemo(() => {
        const days = PERIOD_OPTIONS.find((p) => p.value === period)!.days
        return periodRange(days)
    }, [period])
    const filterParams = useMemo(
        () => ({ from: range.from, to: range.to, propertyId: propertyId === 'all' ? undefined : propertyId }),
        [range, propertyId],
    )

    const overviewQuery = useQuery({
        queryKey: ['analytics-overview', filterParams, granularity],
        queryFn: () => overviewApi.overview({ ...filterParams, granularity }),
        enabled: tab === 'overview',
    })

    const occupancyQuery = useQuery({
        queryKey: ['analytics-occupancy', filterParams],
        queryFn: () => reportsApi.occupancy(filterParams),
        enabled: tab === 'occupancy',
    })

    const revenueQuery = useQuery({
        queryKey: ['analytics-revenue', filterParams],
        queryFn: () => reportsApi.revenue(filterParams),
        enabled: tab === 'revenue',
    })

    const operationsQuery = useQuery({
        queryKey: ['analytics-operations', filterParams],
        queryFn: () => analyticsApi.operations(filterParams),
        enabled: tab === 'operations',
    })

    const recentQuery = useQuery({
        queryKey: ['analytics-recent', { propertyId: filterParams.propertyId }],
        queryFn: () => bookingApi.list({ page: 1, limit: 6, propertyId: filterParams.propertyId }),
        enabled: tab === 'operations',
    })

    return (
        <main className="space-y-6 text-foreground">
            <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <PageHeader
                    title="Analytics"
                    description="Monitor performance Overview, booking channels, occupancy, and guest operations."
                />
                <div className="flex flex-wrap gap-2">
                    <Select value={propertyId} onValueChange={handlePropertyChange}>
                        <SelectTrigger className="h-9 w-44 text-xs">
                            <Hotel className="mr-2 size-3.5 text-muted-foreground" />
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Properties</SelectItem>
                            {properties.map((p) => (
                                <SelectItem key={p.id} value={p.id}>
                                    {p.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={period} onValueChange={handlePeriodChange}>
                        <SelectTrigger className="h-9 w-36 text-xs">
                            <CalendarDays className="mr-2 size-3.5 text-muted-foreground" />
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {PERIOD_OPTIONS.map((p) => (
                                <SelectItem key={p.value} value={p.value}>
                                    {p.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </header>

            <Tabs value={tab} onValueChange={handleTabChange} className="w-full">
                <div className="overflow-x-auto rounded-xl border bg-card p-1 shadow-sm scrollbar-auto [&::-webkit-scrollbar]:hidden">
                    <TabsList variant="primary" className="h-10 min-w-max gap-1 p-1">
                        <TabsTrigger value="overview" className="h-8 gap-2 px-3 text-xs">
                            <TrendingUp className="size-3.5" />
                            Overview
                        </TabsTrigger>
                        <TabsTrigger value="occupancy" className="h-8 gap-2 px-3 text-xs">
                            <BedDouble className="size-3.5" />
                            Occupancy
                        </TabsTrigger>
                        <TabsTrigger value="revenue" className="h-8 gap-2 px-3 text-xs">
                            <CircleDollarSign className="size-3.5" />
                            <span className="sm:hidden">Revenue</span>
                            <span className="hidden sm:inline">Revenue & channels</span>
                        </TabsTrigger>
                        <TabsTrigger value="operations" className="h-8 gap-2 px-3 text-xs">
                            <CalendarDays className="size-3.5" />
                            <span className="sm:hidden">Operations</span>
                            <span className="hidden sm:inline">Guest operations</span>
                        </TabsTrigger>
                    </TabsList>
                </div>
            </Tabs>

            {tab === 'overview' && <OverviewTab query={overviewQuery} currency={currency} granularity={granularity} setGranularity={setGranularity} />}
            {tab === 'occupancy' && (
                <OccupancyTab query={occupancyQuery} currency={currency} range={range} page={search.page} limit={search.limit} />
            )}
            {tab === 'revenue' && (
                <RevenueTab
                    query={revenueQuery}
                    currency={currency}
                    range={range}
                    filterParams={filterParams}
                    page={search.page}
                    limit={search.limit}
                />
            )}
            {tab === 'operations' && (
                <OperationsTab query={operationsQuery} recentQuery={recentQuery} currency={currency} range={range} page={search.page} limit={search.limit} />
            )}
        </main>
    )
}
