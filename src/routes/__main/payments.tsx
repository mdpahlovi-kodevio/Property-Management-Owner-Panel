import { Button } from '@/components/ui/button'
import { DataTable, type DataTableColumn } from '@/components/ui/data-table'
import { PageHeader } from '@/components/ui/page-header'
import { SearchInput } from '@/components/ui/search-input'
import { useSearchParams } from '@/hooks/use-search-params'
import { type Payment, paymentApi } from '@/lib/api'
import { capitalize } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { FileText } from 'lucide-react'
import { useMemo } from 'react'
import { z } from 'zod'

const STATUS_STYLES: Record<Payment['status'], string> = {
    PENDING: 'bg-amber-50 text-amber-600',
    SUCCEEDED: 'bg-emerald-50 text-emerald-600',
    FAILED: 'bg-red-50 text-red-600',
    REFUNDED: 'bg-blue-50 text-blue-600',
}

const searchSchema = z.object({
    page: z.number().default(1),
    limit: z.number().default(10),
    search: z.string().optional(),
})

export const Route = createFileRoute('/__main/payments')({
    validateSearch: searchSchema,
    component: RouteComponent,
})

function formatPriceValue(amount: string, currency: string) {
    try {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(parseFloat(amount))
    } catch {
        return `${amount} ${currency}`
    }
}

function RouteComponent() {
    const query = Route.useSearch()
    const mergeSearch = useSearchParams()

    const { data, isLoading } = useQuery({
        queryKey: ['payments', query],
        queryFn: () => paymentApi.list(query),
        placeholderData: (prev) => prev,
    })

    const payments = data?.data ?? []

    const columns: DataTableColumn<Payment>[] = useMemo(
        () => [
            {
                key: 'user',
                header: 'User',
                render: (p) => (
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{p.booking.guest.user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{p.booking.guest.user.email}</p>
                    </div>
                ),
            },
            {
                key: 'property',
                header: 'Property',
                render: (p) => (
                    <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">{p.booking.property.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                            {p.booking.roomType.name}
                            {p.booking.unit.roomNumber ? ` · Room ${p.booking.unit.roomNumber}` : ''}
                        </p>
                    </div>
                ),
            },
            {
                key: 'amount',
                header: 'Amount',
                render: (p) => <span className="text-muted-foreground">{formatPriceValue(p.amount, p.currency)}</span>,
            },
            {
                key: 'method',
                header: 'Method',
                render: (p) => <span className="text-muted-foreground">{capitalize(p.method)}</span>,
            },
            {
                key: 'channel',
                header: 'Channel',
                render: (p) => <span className="text-muted-foreground">{capitalize(p.booking?.source)}</span>,
            },
            {
                key: 'status',
                header: 'Status',
                render: (p) => (
                    <span className={`text-sm font-medium ${STATUS_STYLES[p.status] ?? 'text-muted-foreground'}`}>
                        {capitalize(p.status)}
                    </span>
                ),
            },
            {
                key: 'action',
                header: 'Action',
                render: (p) => (
                    <Button size="sm" variant="outline">
                        <FileText className="size-3.5" />
                        PDF
                    </Button>
                ),
            },
        ],
        [],
    )

    return (
        <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <PageHeader title="Payments" description="Manage your payments" />
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <SearchInput value={query.search ?? ''} placeholder="Search payments" className="w-full sm:w-[320px]" />
                </div>
            </div>

            <DataTable
                loading={isLoading}
                columns={columns}
                data={payments}
                noun="payments"
                page={query.page}
                limit={query.limit}
                total={data?.meta.total ?? 0}
                onReset={() => mergeSearch({ search: undefined, page: 1, limit: 10 })}
            />
        </>
    )
}
