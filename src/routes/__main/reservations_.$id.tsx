import { useAppForm } from '@/components/form/form-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import type { Booking, BookingStatus, CreatePaymentPayload, UpdatePaymentPayload } from '@/lib/api'
import { bookingApi, BookingStatusOptions, paymentApi, resolveImage } from '@/lib/api'
import { capitalize, cn } from '@/lib/utils'
import { useMutation } from '@tanstack/react-query'
import { createFileRoute, Link, notFound, useNavigate, useRouter } from '@tanstack/react-router'
import {
    ArrowLeft,
    Building2,
    Calendar,
    CalendarDays,
    CheckCircle2,
    Clock,
    CreditCard,
    Download,
    Hash,
    Mail,
    Phone,
    Plus,
    RotateCcw,
    Users,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import * as z from 'zod'

const detailSearchSchema = z.object({
    status: z.number().optional(),
    edit: z.number().optional(),
})

export const Route = createFileRoute('/__main/reservations_/$id')({
    validateSearch: detailSearchSchema,
    loader: async ({ params }) => {
        try {
            const res = await bookingApi.findOne(params.id)
            return { booking: res.data }
        } catch {
            throw notFound()
        }
    },
    notFoundComponent: () => (
        <div className="mx-auto max-w-xl px-4 py-24 text-center">
            <div className="mb-6 flex justify-center">
                <div className="flex size-16 items-center justify-center rounded-lg bg-muted">
                    <Calendar className="size-8 text-muted-foreground" />
                </div>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Reservation not found</h1>
            <p className="mt-3 text-muted-foreground">The reservation you're looking for doesn't exist or has been removed.</p>
            <Link
                to="/reservations"
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary transition-colors"
            >
                Back to Reservations
            </Link>
        </div>
    ),
    pendingComponent: () => (
        <div className="flex justify-center py-24">
            <Spinner className="size-6" />
        </div>
    ),
    component: ReservationDetailsComponent,
})

// Status badge styling per BookingStatus (mirrors Admin Panel detail page)
const STATUS_BADGE: Record<BookingStatus, string> = {
    PENDING: 'text-amber-600 bg-amber-500/10 border-amber-200',
    CONFIRMED: 'text-emerald-600 bg-emerald-500/10 border-emerald-200',
    CHECKED_IN: 'text-blue-600 bg-blue-500/10 border-blue-200',
    CHECKED_OUT: 'text-slate-600 bg-slate-500/10 border-slate-200',
    CANCELLED: 'text-red-600 bg-red-500/10 border-red-200',
    NO_SHOW: 'text-rose-600 bg-rose-500/10 border-rose-200',
}

function formatDateLong(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}

function formatDateTime(dateStr: string) {
    return new Date(dateStr).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    })
}

function formatPrice(amount: string, currency: string) {
    try {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(parseFloat(amount))
    } catch {
        return `${currency} ${amount}`
    }
}

// Status change form schema — requires a reason when moving to CANCELLED.
const statusChangeSchema = z
    .object({
        status: z.enum(BookingStatusOptions),
        reason: z.string(),
    })
    .refine((v) => v.status !== 'CANCELLED' || v.reason.trim().length > 0, {
        message: 'A reason is required to cancel a reservation.',
        path: ['reason'],
    })

function ReservationDetailsComponent() {
    const { t } = useTranslation()
    const { booking } = Route.useLoaderData()
    const search = Route.useSearch()
    const router = useRouter()
    const navigate = useNavigate()
    const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false)
    const [refundTarget, setRefundTarget] = useState<{ id: string } | null>(null)

    const totalGuests = booking.adults + booking.children
    const isStatusDialogOpen = search.status === 1
    const isEditDialogOpen = search.edit === 1

    // Status change mutation
    const statusMutation = useMutation({
        mutationFn: async (values: { status: BookingStatus; reason?: string }) => {
            if (values.status === 'CONFIRMED') return bookingApi.confirm(booking.id)
            if (values.status === 'CHECKED_IN') return bookingApi.checkIn(booking.id)
            if (values.status === 'CHECKED_OUT') return bookingApi.checkOut(booking.id)
            if (values.status === 'CANCELLED') return bookingApi.cancel(booking.id, { reason: values.reason ?? '' })
            throw new Error('Unsupported status transition')
        },
        onSuccess: () => {
            toast.success(t('reservations.statusUpdated', 'Reservation status updated successfully'))
            router.invalidate()
            closeStatusDialog()
        },
        onError: (error: Error) => {
            toast.error(error.message || t('reservations.statusUpdateFailed', 'Failed to update reservation status'))
        },
    })

    const closeStatusDialog = () => {
        navigate({ to: '/reservations/$id', params: { id: booking.id }, search: {} })
    }

    const closeEditDialog = () => {
        navigate({ to: '/reservations/$id', params: { id: booking.id }, search: {} })
    }

    // Record payment mutation
    const recordPaymentMutation = useMutation({
        mutationFn: (payload: CreatePaymentPayload) => paymentApi.create(payload),
        onSuccess: () => {
            toast.success(t('reservations.payment.recordedSuccess', 'Payment recorded successfully'))
            router.invalidate()
            setIsRecordPaymentOpen(false)
        },
        onError: (error: Error) => {
            toast.error(error.message || t('reservations.payment.recordFailed', 'Failed to record payment'))
        },
    })

    // Update payment (mark paid / refund) mutation
    const updatePaymentMutation = useMutation({
        mutationFn: ({ paymentId, payload }: { paymentId: string; payload: UpdatePaymentPayload }) => paymentApi.update(paymentId, payload),
        onSuccess: () => {
            toast.success(t('reservations.payment.refundSuccess', 'Payment refunded successfully'))
            router.invalidate()
            setRefundTarget(null)
        },
        onError: (error: Error) => {
            toast.error(error.message || t('reservations.payment.refundFailed', 'Failed to refund payment'))
        },
    })

    return (
        <>
            {/* Top Action Bar */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <Button variant="ghost" size="sm" onClick={() => navigate({ to: '/reservations' })} className="-ml-2 w-fit">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t('reservations.title', 'Reservations')}
                </Button>
                <div className="flex gap-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate({ to: '/reservations/$id', params: { id: booking.id }, search: { edit: 1 } })}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        {t('reservations.edit', 'Edit Details')}
                    </Button>
                    <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Invoice
                    </Button>
                </div>
            </div>

            {/* Header section with cover/thumbnail */}
            <div className="relative h-48 w-full overflow-hidden rounded-xl bg-muted sm:h-64">
                {booking.roomType.images.length > 0 ? (
                    <img
                        src={resolveImage(booking.roomType.images[0].url)}
                        alt={booking.property.name}
                        crossOrigin="anonymous"
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="h-full w-full bg-slate-100 flex items-center justify-center">
                        <Building2 className="h-12 w-12 text-slate-300" />
                    </div>
                )}
                <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/40 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary-foreground/80">
                            <span>Reservation</span>
                            <span>•</span>
                            <span className="font-mono">#{booking.id}</span>
                        </div>
                        <h1 className="mt-1 text-2xl font-bold sm:text-3xl drop-shadow-sm">{booking.property.name}</h1>
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-white/90">
                            <span className="flex items-center gap-1.5">
                                <Building2 className="h-4 w-4 shrink-0" />
                                {booking.roomType.name}
                                {booking.unit.roomNumber && ` (Room ${booking.unit.roomNumber})`}
                            </span>
                        </div>
                    </div>
                    <span
                        className={cn(
                            'text-xs font-semibold px-3 py-1 rounded-full capitalize border shadow-xs',
                            STATUS_BADGE[booking.status],
                        )}
                    >
                        {booking.status.toLowerCase().replace(/_/g, ' ')}
                    </span>
                </div>
            </div>

            {/* Main Content Layout */}
            <div className="grid gap-5 lg:grid-cols-3">
                {/* Left Columns (Booking and financial details) */}
                <div className="space-y-5 lg:col-span-2">
                    {/* Booking Information */}
                    <Card>
                        <CardContent className="pt-5 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-base font-semibold">Stay Information</h3>
                                <span className="text-xs text-muted-foreground">Booked on {formatDateTime(booking.createdAt)}</span>
                            </div>
                            <Separator />
                            <div className="grid gap-4 sm:grid-cols-2">
                                <InfoRow icon={CalendarDays} label="Check-in Date" value={formatDateLong(booking.checkInDate)} />
                                <InfoRow icon={CalendarDays} label="Check-out Date" value={formatDateLong(booking.checkOutDate)} />
                                <InfoRow
                                    icon={Clock}
                                    label="Nights"
                                    value={`${booking.nights} ${booking.nights === 1 ? 'night' : 'nights'}`}
                                />
                                <InfoRow
                                    icon={Users}
                                    label="Guests"
                                    value={`${totalGuests} ${totalGuests === 1 ? 'guest' : 'guests'} (${booking.adults} Ad · ${booking.children} Ch)`}
                                />
                                <InfoRow icon={CreditCard} label="Booking Source" value={capitalize(booking.source)} />
                                {booking.channelRef && <InfoRow icon={Hash} label="Channel Reference" value={booking.channelRef} />}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pricing details and breakdown */}
                    <Card>
                        <CardContent className="pt-5 space-y-4">
                            <h3 className="text-base font-semibold">Financial Summary</h3>
                            <Separator />
                            <div className="space-y-2">
                                <PriceLine
                                    label={`${formatPrice(booking.nightlyRate, booking.currency)} × ${booking.nights} night${
                                        booking.nights !== 1 ? 's' : ''
                                    }`}
                                    value={formatPrice(booking.unitPrice, booking.currency)}
                                />
                                {parseFloat(booking.addonsTotal) > 0 && (
                                    <PriceLine label="Add-ons" value={formatPrice(booking.addonsTotal, booking.currency)} />
                                )}
                                {parseFloat(booking.taxTotal) > 0 && (
                                    <PriceLine label="Taxes & Fees" value={formatPrice(booking.taxTotal, booking.currency)} />
                                )}
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between font-semibold">
                                <span>Grand Total</span>
                                <span className="text-lg">{formatPrice(booking.grandTotal, booking.currency)}</span>
                            </div>
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Amount Paid</span>
                                    <span className="font-medium text-emerald-600">
                                        {formatPrice(booking.amountPaid, booking.currency)}
                                    </span>
                                </div>
                                {parseFloat(booking.amountRefunded) > 0 && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Amount Refunded</span>
                                        <span className="font-medium text-red-600">
                                            {formatPrice(booking.amountRefunded, booking.currency)}
                                        </span>
                                    </div>
                                )}
                                {parseFloat(booking.grandTotal) - parseFloat(booking.amountPaid) > 0 && booking.status !== 'CANCELLED' && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Balance Due</span>
                                        <span className="font-medium text-amber-600">
                                            {formatPrice(
                                                (parseFloat(booking.grandTotal) - parseFloat(booking.amountPaid)).toFixed(2),
                                                booking.currency,
                                            )}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment History */}
                    {booking.payments.length > 0 && (
                        <Card>
                            <CardContent className="pt-5 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-base font-semibold">Payment History</h3>
                                    {['PENDING', 'CONFIRMED', 'CHECKED_IN'].includes(booking.status) && (
                                        <Button size="sm" variant="outline" onClick={() => setIsRecordPaymentOpen(true)}>
                                            <Plus className="mr-2 h-3.5 w-3.5" />
                                            {t('reservations.payment.record', 'Record Payment')}
                                        </Button>
                                    )}
                                </div>
                                <Separator />
                                <div className="space-y-3">
                                    {booking.payments.map((payment) => (
                                        <div key={payment.id} className="flex items-center justify-between rounded-lg border p-3">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <CreditCard className="h-4 w-4 shrink-0 text-muted-foreground" />
                                                    <span className="text-sm font-medium">{capitalize(payment.method)}</span>
                                                    <span
                                                        className={cn(
                                                            'rounded-full px-2 py-0.5 text-[10px] font-semibold',
                                                            payment.status === 'SUCCEEDED'
                                                                ? 'bg-emerald-50 text-emerald-600'
                                                                : payment.status === 'PENDING'
                                                                  ? 'bg-amber-50 text-amber-600'
                                                                  : 'bg-red-50 text-red-600',
                                                        )}
                                                    >
                                                        {capitalize(payment.status)}
                                                    </span>
                                                </div>
                                                <p className="mt-0.5 text-xs text-muted-foreground">
                                                    {payment.paidAt
                                                        ? `Paid ${formatDateTime(payment.paidAt)}`
                                                        : formatDateTime(payment.createdAt)}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-semibold">
                                                    {formatPrice(payment.amount, payment.currency)}
                                                </span>
                                                <div className="flex items-center gap-1.5">
                                                    {payment.status === 'PENDING' && (
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-7 px-2 text-emerald-600 hover:text-emerald-700"
                                                            onClick={() =>
                                                                updatePaymentMutation.mutate({
                                                                    paymentId: payment.id,
                                                                    payload: { bookingId: booking.id, status: 'SUCCEEDED' },
                                                                })
                                                            }
                                                            disabled={updatePaymentMutation.isPending}
                                                        >
                                                            {t('reservations.payment.markPaid', 'Mark Paid')}
                                                        </Button>
                                                    )}
                                                    {payment.status === 'SUCCEEDED' && (
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-7 px-2 text-red-600 hover:text-red-700"
                                                            onClick={() => setRefundTarget({ id: payment.id })}
                                                            disabled={updatePaymentMutation.isPending}
                                                        >
                                                            <RotateCcw className="mr-1 h-3.5 w-3.5" />
                                                            {t('reservations.payment.refund', 'Refund')}
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Right Columns (Guest & timeline) */}
                <div className="space-y-5">
                    {/* Guest Information */}
                    <Card>
                        <CardContent className="pt-5 space-y-4">
                            <h3 className="text-base font-semibold">Guest Profile</h3>
                            <Separator />
                            <div className="flex items-center gap-3">
                                <div className="size-12 rounded-full overflow-hidden bg-muted shrink-0">
                                    {booking.guest.user.image ? (
                                        <img
                                            src={resolveImage(booking.guest.user.image)}
                                            alt={booking.guest.user.name}
                                            crossOrigin="anonymous"
                                            className="size-full object-cover"
                                        />
                                    ) : (
                                        <div className="size-full flex items-center justify-center text-muted-foreground text-xs font-semibold">
                                            {booking.guest.user.name.slice(0, 2).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-semibold">{booking.guest.user.name}</p>
                                    <div className="text-sm">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Mail className="h-3.5 w-3.5 shrink-0" />
                                            <span className="truncate">{booking.guest.user.email}</span>
                                        </div>
                                        {booking.guest.user.phone && (
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Phone className="h-3.5 w-3.5 shrink-0" />
                                                <span>{booking.guest.user.phone}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Status History Timeline */}
                    {booking.statusHistory.length > 0 && (
                        <Card>
                            <CardContent className="pt-5 space-y-4">
                                <h3 className="text-base font-semibold">Status Activity</h3>
                                <Separator />
                                <div>
                                    {booking.statusHistory.map((entry, idx) => (
                                        <div key={entry.id} className="flex gap-3">
                                            <div className="flex flex-col items-center">
                                                <div
                                                    className={cn(
                                                        'flex h-7 w-7 items-center justify-center rounded-full border-2',
                                                        idx === 0
                                                            ? 'border-primary bg-primary/10 text-primary'
                                                            : 'border-border bg-muted text-muted-foreground',
                                                    )}
                                                >
                                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                                </div>
                                                {idx < booking.statusHistory.length - 1 && <div className="w-px flex-1 bg-border" />}
                                            </div>
                                            <div className="pb-2 min-w-0 flex-1">
                                                <p className="text-sm font-medium">{capitalize(entry.toStatus)}</p>
                                                <p className="text-[11px] text-muted-foreground">
                                                    {formatDateTime(entry.createdAt)}
                                                    {entry.actor && ` by ${entry.actor.name}`}
                                                </p>
                                                {entry.reason && (
                                                    <p className="mt-1 text-xs text-muted-foreground italic bg-slate-50 p-1.5 rounded-sm">
                                                        "{entry.reason}"
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Status-change dialog */}
            <StatusChangeDialog
                open={isStatusDialogOpen}
                currentStatus={booking.status}
                onOpenChange={(o) => {
                    if (!o) closeStatusDialog()
                }}
                onConfirm={async (values) => {
                    await statusMutation.mutateAsync(values)
                    closeStatusDialog()
                }}
            />

            {/* Manage / Edit dialog — guided workflow: Confirm → Payment → Check-in → Check-out */}
            <Dialog
                open={isEditDialogOpen}
                onOpenChange={(o) => {
                    if (!o) closeEditDialog()
                }}
            >
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{t('reservations.edit', 'Edit Details')}</DialogTitle>
                        <DialogDescription>{t('reservations.editDesc', 'Modify the details of this reservation.')}</DialogDescription>
                    </DialogHeader>

                    <BookingStepper
                        status={booking.status}
                        amountPaid={booking.amountPaid}
                        grandTotal={booking.grandTotal}
                        currency={booking.currency}
                    />

                    <div className="flex flex-col gap-2">
                        {booking.status === 'PENDING' && (
                            <>
                                <Button onClick={() => statusMutation.mutate({ status: 'CONFIRMED' })} disabled={statusMutation.isPending}>
                                    {t('reservations.steps.confirm', 'Confirm')}
                                </Button>
                                {parseFloat(booking.grandTotal) - parseFloat(booking.amountPaid) > 0 && (
                                    <Button variant="outline" onClick={() => setIsRecordPaymentOpen(true)}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        {t('reservations.payment.record', 'Record Payment')}
                                    </Button>
                                )}
                            </>
                        )}

                        {booking.status === 'CONFIRMED' &&
                            (parseFloat(booking.grandTotal) - parseFloat(booking.amountPaid) > 0 ? (
                                <Button onClick={() => setIsRecordPaymentOpen(true)}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    {t('reservations.payment.record', 'Record Payment')}
                                </Button>
                            ) : (
                                <Button onClick={() => statusMutation.mutate({ status: 'CHECKED_IN' })} disabled={statusMutation.isPending}>
                                    {t('reservations.steps.checkIn', 'Check-in')}
                                </Button>
                            ))}

                        {booking.status === 'CHECKED_IN' && (
                            <Button onClick={() => statusMutation.mutate({ status: 'CHECKED_OUT' })} disabled={statusMutation.isPending}>
                                {t('reservations.steps.checkOut', 'Check-out')}
                            </Button>
                        )}

                        {(booking.status === 'CHECKED_OUT' || booking.status === 'CANCELLED' || booking.status === 'NO_SHOW') && (
                            <p className="text-sm text-muted-foreground text-center py-2">
                                {t('reservations.statusChange.title', 'Change reservation status')} — {capitalize(booking.status)}
                            </p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={closeEditDialog}>
                            {t('properties.cancel', 'Close')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Record payment dialog */}
            <RecordPaymentDialog
                open={isRecordPaymentOpen}
                booking={booking}
                onOpenChange={setIsRecordPaymentOpen}
                onSubmit={async (payload) => {
                    await recordPaymentMutation.mutateAsync(payload)
                    closeEditDialog()
                }}
            />

            {/* Refund confirmation dialog */}
            <RefundDialog
                open={refundTarget !== null}
                paymentId={refundTarget?.id ?? null}
                bookingId={booking.id}
                onOpenChange={(o) => {
                    if (!o) setRefundTarget(null)
                }}
                onSubmit={async (reason) => {
                    if (!refundTarget) return
                    await updatePaymentMutation.mutateAsync({
                        paymentId: refundTarget.id,
                        payload: { bookingId: booking.id, status: 'REFUNDED', reason },
                    })
                    closeEditDialog()
                }}
            />
        </>
    )
}

// ─── Booking workflow stepper ────────────────────────────────────────
function BookingStepper({
    status,
    amountPaid,
    grandTotal,
    currency,
}: {
    status: BookingStatus
    amountPaid: string
    grandTotal: string
    currency: string
}) {
    const { t } = useTranslation()
    const balanceDue = Math.max(0, parseFloat(grandTotal) - parseFloat(amountPaid))
    const isFullyPaid = balanceDue <= 0

    const stages = [
        {
            key: 'confirm',
            label: t('reservations.steps.confirm', 'Confirm'),
            done: status !== 'PENDING',
            active: status === 'PENDING',
        },
        {
            key: 'payment',
            label: t('reservations.steps.payment', 'Payment'),
            done: isFullyPaid,
            active: !isFullyPaid && ['PENDING', 'CONFIRMED', 'CHECKED_IN'].includes(status),
        },
        {
            key: 'checkIn',
            label: t('reservations.steps.checkIn', 'Check-in'),
            done: ['CHECKED_IN', 'CHECKED_OUT'].includes(status),
            active: status === 'CONFIRMED',
        },
        {
            key: 'checkOut',
            label: t('reservations.steps.checkOut', 'Check-out'),
            done: status === 'CHECKED_OUT',
            active: status === 'CHECKED_IN',
        },
    ]

    return (
        <div className="space-y-3">
            <div className="flex items-center">
                {stages.map((stage, idx) => (
                    <div key={stage.key} className="flex flex-1 last:flex-none">
                        <div className="flex flex-col items-center gap-1.5">
                            <div
                                className={cn(
                                    'flex size-8 items-center justify-center rounded-full border-2 text-xs font-semibold',
                                    stage.done
                                        ? 'border-emerald-500 bg-emerald-500 text-white'
                                        : stage.active
                                          ? 'border-primary bg-primary/10 text-primary'
                                          : 'border-border bg-muted text-muted-foreground',
                                )}
                            >
                                {stage.done ? <CheckCircle2 className="size-4" /> : idx + 1}
                            </div>
                            <span
                                className={cn(
                                    'text-[11px] font-medium',
                                    stage.done || stage.active ? 'text-foreground' : 'text-muted-foreground',
                                )}
                            >
                                {stage.label}
                            </span>
                        </div>
                        {idx < stages.length - 1 && (
                            <div className={cn('mt-4 h-0.5 flex-1', stage.done ? 'bg-emerald-500' : 'bg-border')} />
                        )}
                    </div>
                ))}
            </div>
            {balanceDue > 0 && status !== 'CANCELLED' && (
                <p className="text-center text-xs text-muted-foreground">
                    {t('reservations.payment.balanceDue', 'Balance Due')}:{' '}
                    <span className="font-semibold text-amber-600">{formatPrice(balanceDue.toFixed(2), currency)}</span>
                </p>
            )}
            {isFullyPaid && (
                <p className="text-center text-xs font-medium text-emerald-600">{t('reservations.payment.fullyPaid', 'Fully paid')}</p>
            )}
        </div>
    )
}

// ─── Record payment dialog ───────────────────────────────────────────
function RecordPaymentDialog({
    open,
    booking,
    onOpenChange,
    onSubmit,
}: {
    open: boolean
    booking: Booking
    onOpenChange: (open: boolean) => void
    onSubmit: (payload: CreatePaymentPayload) => Promise<void>
}) {
    const { t } = useTranslation()
    const balanceDue = Math.max(0, parseFloat(booking.grandTotal) - parseFloat(booking.amountPaid)).toFixed(2)
    const payable = ['PENDING', 'CONFIRMED', 'CHECKED_IN'].includes(booking.status)

    const methodOptions = [
        { value: 'CASH', label: 'Cash' },
        { value: 'CARD', label: 'Card' },
        { value: 'BANK', label: 'Bank' },
    ]
    const statusOptions = [
        { value: 'SUCCEEDED', label: 'Succeeded' },
        { value: 'PENDING', label: 'Pending' },
    ]

    const form = useAppForm({
        defaultValues: {
            amount: balanceDue,
            method: 'CASH' as const,
            status: 'SUCCEEDED' as const,
            provider: '',
            providerRef: '',
            note: '',
        },
        onSubmit: async ({ value }) => {
            await onSubmit({
                bookingId: booking.id,
                amount: parseFloat(value.amount).toFixed(2),
                method: value.method,
                status: value.status,
                provider: value.provider || undefined,
                providerRef: value.providerRef || undefined,
                note: value.note || undefined,
            })
        },
    })

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{t('reservations.payment.title', 'Record Payment')}</DialogTitle>
                    <DialogDescription>
                        {t('reservations.payment.description', 'Record a payment against this reservation.')}
                    </DialogDescription>
                </DialogHeader>

                {!payable ? (
                    <p className="text-sm text-muted-foreground">
                        {t('reservations.payment.recordFailed', 'Failed to record payment')} — booking is in a non-payable state.
                    </p>
                ) : (
                    <form
                        onSubmit={(e) => {
                            e.preventDefault()
                            form.handleSubmit()
                        }}
                        className="space-y-4"
                    >
                        <form.AppField name="amount">
                            {(field) => <field.FormInput type="number" step="0.01" label={t('reservations.payment.amount', 'Amount')} />}
                        </form.AppField>

                        <form.AppField name="method">
                            {(field) => <field.FormSelect label={t('reservations.payment.method', 'Method')} options={methodOptions} />}
                        </form.AppField>

                        <form.AppField name="status">
                            {(field) => <field.FormSelect label={t('reservations.payment.status', 'Status')} options={statusOptions} />}
                        </form.AppField>

                        <form.AppField name="provider">
                            {(field) => (
                                <field.FormInput label={t('reservations.payment.provider', 'Provider')} placeholder="Stripe, PayPal…" />
                            )}
                        </form.AppField>

                        <form.AppField name="providerRef">
                            {(field) => (
                                <field.FormInput label={t('reservations.payment.providerRef', 'Reference')} placeholder="txn_123…" />
                            )}
                        </form.AppField>

                        <form.AppField name="note">
                            {(field) => <field.FormTextarea label={t('reservations.payment.note', 'Note')} />}
                        </form.AppField>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                {t('properties.cancel', 'Cancel')}
                            </Button>
                            <form.AppForm>
                                <form.FormSubmit label={t('reservations.payment.payLabel', 'Record Payment')} />
                            </form.AppForm>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    )
}

// ─── Refund dialog ───────────────────────────────────────────────────
function RefundDialog({
    open,
    paymentId,
    bookingId,
    onOpenChange,
    onSubmit,
}: {
    open: boolean
    paymentId: string | null
    bookingId: string
    onOpenChange: (open: boolean) => void
    onSubmit: (reason: string) => Promise<void>
}) {
    const { t } = useTranslation()
    const [reason, setReason] = useState('')

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{t('reservations.payment.refund', 'Refund')}</DialogTitle>
                    <DialogDescription>
                        {t('reservations.payment.refundReasonPlaceholder', 'Why is this payment being refunded?')}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-1.5">
                    <Label htmlFor="refund-reason">{t('reservations.payment.refundReason', 'Refund reason')}</Label>
                    <Textarea
                        id="refund-reason"
                        rows={3}
                        value={reason}
                        onBlur={() => {}}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder={t('reservations.payment.refundReasonPlaceholder', 'Why is this payment being refunded?')}
                    />
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        {t('properties.cancel', 'Cancel')}
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        disabled={!paymentId}
                        onClick={async () => {
                            await onSubmit(reason)
                            setReason('')
                        }}
                    >
                        {t('reservations.payment.refund', 'Refund')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

// ─── Status change dialog ─────────────────────────────────────────────
function StatusChangeDialog({
    open,
    currentStatus,
    onOpenChange,
    onConfirm,
}: {
    open: boolean
    currentStatus: BookingStatus
    onOpenChange: (open: boolean) => void
    onConfirm: (values: { status: BookingStatus; reason?: string }) => Promise<void>
}) {
    const { t } = useTranslation()

    // Determine which transitions are valid from the current status.
    const availableTargets: BookingStatus[] = useMemo(() => {
        switch (currentStatus) {
            case 'PENDING':
                return ['CONFIRMED', 'CANCELLED']
            case 'CONFIRMED':
                return ['CHECKED_IN', 'CANCELLED']
            case 'CHECKED_IN':
                return ['CHECKED_OUT', 'NO_SHOW']
            case 'CHECKED_OUT':
            case 'CANCELLED':
            case 'NO_SHOW':
                return []
        }
    }, [currentStatus])

    const form = useAppForm({
        defaultValues: { status: availableTargets[0] ?? 'CONFIRMED', reason: '' },
        validators: { onChange: statusChangeSchema },
        onSubmit: async ({ value }) => onConfirm(value),
    })

    if (availableTargets.length === 0) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('reservations.statusChange.title', 'Change reservation status')}</DialogTitle>
                        <DialogDescription>
                            This reservation is in a terminal state ({capitalize(currentStatus)}) and cannot be moved to another status.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('reservations.statusChange.title', 'Change reservation status')}</DialogTitle>
                    <DialogDescription>
                        {t('reservations.statusChange.description', 'Select the new status for this reservation.')}
                    </DialogDescription>
                </DialogHeader>

                <form
                    onSubmit={(e) => {
                        e.preventDefault()
                        form.handleSubmit()
                    }}
                    className="space-y-4"
                >
                    <form.AppField name="status">
                        {(field) => (
                            <div className="space-y-1.5">
                                <Label>{t('reservations.statusChange.toStatus', 'New status')}</Label>
                                <Select value={field.state.value} onValueChange={(value) => field.handleChange(value as BookingStatus)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableTargets.map((s) => (
                                            <SelectItem key={s} value={s}>
                                                {capitalize(s)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </form.AppField>

                    <form.Subscribe
                        selector={(state) => state.values.status}
                        children={(selected) => {
                            if (selected !== 'CANCELLED') return null
                            return (
                                <form.AppField name="reason">
                                    {(field) => (
                                        <div className="space-y-1.5">
                                            <Label htmlFor={field.name}>
                                                {t('reservations.statusChange.cancelReason', 'Cancellation reason')}
                                            </Label>
                                            <Textarea
                                                id={field.name}
                                                rows={3}
                                                value={field.state.value}
                                                onBlur={field.handleBlur}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                                placeholder={t(
                                                    'reservations.statusChange.cancelReasonPlaceholder',
                                                    'Why is this reservation being cancelled?',
                                                )}
                                            />
                                            {field.state.meta.isTouched && !field.state.meta.isValid && (
                                                <p className="text-xs text-destructive">
                                                    {t(
                                                        'reservations.statusChange.reasonRequired',
                                                        'A reason is required to cancel a reservation.',
                                                    )}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </form.AppField>
                            )
                        }}
                    />

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            {t('properties.cancel', 'Cancel')}
                        </Button>
                        <form.AppForm>
                            <form.FormSubmit label={t('reservations.statusChange.confirm', 'Update status')} />
                        </form.AppForm>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
    return (
        <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
                <p className="text-sm font-medium text-foreground">{value}</p>
            </div>
        </div>
    )
}

function PriceLine({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-medium">{value}</span>
        </div>
    )
}
