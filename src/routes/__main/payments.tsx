import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import type { DataTableColumn } from '@/components/ui/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { PageHeader } from '@/components/ui/page-header'
import { SearchInput } from '@/components/ui/search-input'
import { createFileRoute } from '@tanstack/react-router'
import { ChevronDown, Eye, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'

export const Route = createFileRoute('/__main/payments')({
    component: RouteComponent,
})

type Payment = {
    id: number
    userName: string
    property: string
    amount: string
    method: string
    channel: string
    status: 'Paid' | 'Pending' | 'Failed'
}

const INITIAL_PAYMENTS: Payment[] = [
    { id: 1, userName: 'Jane Cooper', property: 'Ocean Breeze Villa', amount: '$240', method: 'Stripe', channel: 'Airbnb', status: 'Paid' },
    { id: 2, userName: 'Wade Warren', property: 'Sunset Paradise Resort', amount: '$80', method: 'Card', channel: 'Airbnb', status: 'Paid' },
    { id: 3, userName: 'Esther Howard', property: 'Palm Horizon Retreat', amount: '$300', method: 'Cash', channel: 'Airbnb', status: 'Paid' },
    { id: 4, userName: 'Leslie Alexander', property: 'Blue Lagoon Suites', amount: '$80', method: 'Stripe', channel: 'Airbnb', status: 'Paid' },
    { id: 5, userName: 'Jenny Wilson', property: 'Coral Bay Residence', amount: '$300', method: 'Stripe', channel: 'Airbnb', status: 'Paid' },
    { id: 6, userName: 'Guy Hawkins', property: 'Golden Sands Resort', amount: '$800', method: 'Stripe', channel: 'Airbnb', status: 'Pending' },
    { id: 7, userName: 'Robert Fox', property: 'Ocean Breeze Villa', amount: '$240', method: 'Cash', channel: 'Airbnb', status: 'Pending' },
    { id: 8, userName: 'Kristin Watson', property: 'Sunset Paradise Resort', amount: '$100', method: 'Cash', channel: 'Airbnb', status: 'Failed' },
    { id: 9, userName: 'Jacob Jones', property: 'Palm Horizon Retreat', amount: '$150', method: 'Card', channel: 'Airbnb', status: 'Paid' },
    { id: 10, userName: 'Bessie Cooper', property: 'Blue Lagoon Suites', amount: '$700', method: 'Card', channel: 'Airbnb', status: 'Paid' },
    { id: 11, userName: 'Albert Flores', property: 'Coral Bay Residence', amount: '$600', method: 'Card', channel: 'Airbnb', status: 'Paid' },
    { id: 12, userName: 'Dianne Russell', property: 'Golden Sands Resort', amount: '$500', method: 'Card', channel: 'Airbnb', status: 'Failed' },
    { id: 13, userName: 'Eleanor Pena', property: 'Ocean Breeze Villa', amount: '$200', method: 'Card', channel: 'Airbnb', status: 'Failed' },
]

function RouteComponent() {
    const [payments] = useState<Payment[]>(INITIAL_PAYMENTS)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
    const [isDetailsOpen, setIsDetailsOpen] = useState(false)

    const openDetails = (payment: Payment) => {
        setSelectedPayment(payment)
        setIsDetailsOpen(true)
    }

    const filteredPayments = useMemo(() => {
        if (!searchQuery.trim()) return payments
        const query = searchQuery.toLowerCase()
        return payments.filter(
            (p) =>
                p.userName.toLowerCase().includes(query) ||
                p.property.toLowerCase().includes(query) ||
                p.amount.toLowerCase().includes(query) ||
                p.method.toLowerCase().includes(query) ||
                p.channel.toLowerCase().includes(query) ||
                p.status.toLowerCase().includes(query)
        )
    }, [payments, searchQuery])

    const columns: DataTableColumn<Payment>[] = useMemo(
        () => [
            {
                key: 'userName',
                header: 'User Name',
                className: 'font-medium',
                render: (p) => <span className="text-muted-foreground">{p.userName}</span>,
            },
            { key: 'property', header: 'Property', render: (p) => <span className="text-muted-foreground">{p.property}</span> },
            { key: 'amount', header: 'Amount', render: (p) => <span className="text-muted-foreground">{p.amount}</span> },
            { key: 'method', header: 'Method', render: (p) => <span className="text-muted-foreground">{p.method}</span> },
            { key: 'channel', header: 'Channel', render: (p) => <span className="text-muted-foreground">{p.channel}</span> },
            {
                key: 'status',
                header: 'Status',
                render: (p) => {
                    if (p.status === 'Paid') return <span className="text-sm font-medium text-green-500">Paid</span>
                    if (p.status === 'Pending') return <span className="text-sm font-medium text-orange-400">Pending</span>
                    return <span className="text-sm font-medium text-red-500">Failed</span>
                },
            },
            {
                key: 'action',
                header: 'Action',
                render: (p) => (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="sm" className="bg-[#24357B] hover:bg-[#24357B]/90 text-white rounded-md h-9">
                                Action <ChevronDown className="ml-1 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white">
                            <DropdownMenuItem onClick={() => openDetails(p)}>
                                <Eye className="size-3.5" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600 focus:text-red-600">
                                <Trash2 className="size-3.5" /> Delete Payment
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ),
            },
        ],
        []
    )

    return (
        <>
            <div className="flex items-start justify-between mb-4">
                <PageHeader title="Payments" description="Manage your payments" />
                <div className="mt-2">
                    <SearchInput value={searchQuery} onValueChange={setSearchQuery} placeholder="Search" className="sm:w-80" />
                </div>
            </div>

            <DataTable
                columns={columns}
                data={filteredPayments}
                noun="payments"
                onReset={() => setSearchQuery('')}
            />

            <PaymentDetailsDialog
                payment={selectedPayment}
                isOpen={isDetailsOpen}
                onOpenChange={setIsDetailsOpen}
            />
        </>
    )
}

function PaymentDetailsDialog({ payment, isOpen, onOpenChange }: { payment: Payment | null, isOpen: boolean, onOpenChange: (open: boolean) => void }) {
    if (!payment) return null

    const total = parseInt(payment.amount.replace('$', '')) || 0
    const base = Math.floor(total * 0.8)
    const service = total - base

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Paid':
                return <span className="inline-flex items-center rounded-md bg-green-50 px-2.5 py-0.5 text-sm font-medium text-green-700">Paid</span>
            case 'Pending':
                return <span className="inline-flex items-center rounded-md bg-orange-50 px-2.5 py-0.5 text-sm font-medium text-orange-700">Pending</span>
            case 'Failed':
                return <span className="inline-flex items-center rounded-md bg-red-50 px-2.5 py-0.5 text-sm font-medium text-red-700">Failed</span>
            default:
                return null
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md bg-white">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Payment Details</DialogTitle>
                </DialogHeader>

                <div className="space-y-6 mt-2">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900">#PAY-1234{payment.id}</h3>
                        <div className="mt-2">
                            {getStatusBadge(payment.status)}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <div className="text-sm text-slate-500 mb-1">User</div>
                            <div className="font-semibold text-base text-slate-900">{payment.userName}</div>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <div className="text-sm text-slate-500 mb-1">Property</div>
                            <div className="font-semibold text-base text-slate-900">{payment.property}</div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <div className="text-sm text-slate-500 mb-1">Method</div>
                                <div className="font-semibold text-base text-slate-900">{payment.method}</div>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <div className="text-sm text-slate-500 mb-1">Date</div>
                                <div className="font-semibold text-base text-slate-900">20 April 2026</div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg text-slate-900 mb-3">Bill Breakdown</h3>
                        <div className="border border-slate-200 rounded-xl p-4 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Base Room Rate</span>
                                <span className="text-slate-900">${base}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Service Fee</span>
                                <span className="text-slate-900">${service}</span>
                            </div>
                            <div className="border-t border-dashed border-slate-200 pt-3 flex justify-between font-semibold text-sm">
                                <span className="text-slate-900">Total fee</span>
                                <span className="text-slate-900">{payment.amount}</span>
                            </div>
                        </div>
                    </div>

                    <Button className="w-full bg-[#24357B] hover:bg-[#24357B]/90 text-white rounded-md h-12 text-base font-medium mt-2">
                        Download Invoice
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
