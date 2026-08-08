import { useAppForm } from '@/components/form/form-context'
import { Button } from '@/components/ui/button'
import type { DataTableColumn } from '@/components/ui/data-table'
import { DataTable } from '@/components/ui/data-table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { PageHeader } from '@/components/ui/page-header'
import { SearchInput } from '@/components/ui/search-input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useSearchParams } from '@/hooks/use-search-params'
import type { Booking, BookingStatus, CreateBookingPayload } from '@/lib/api'
import { bookingApi, BookingStatusOptions, resolveImage } from '@/lib/api'
import { capitalize, cn, GetGuests, GetProperties, GetRoomTypes } from '@/lib/utils'
import { useMutation, useQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Calendar, Check, ChevronDown, Edit, Eye, Plus, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import * as z from 'zod'

const searchSchema = z.object({
    page: z.number().default(1),
    limit: z.number().default(10),
    search: z.string().optional(),
    status: z.enum(BookingStatusOptions).optional(),
    propertyId: z.string().optional(),
})

export const Route = createFileRoute('/__main/reservations')({
    validateSearch: searchSchema,
    component: RouteComponent,
})

/** Form schema — mirrors the backend's `CreateBookingDto` for owners. */
const reservationSchema = z
    .object({
        propertyId: z.string().min(1, 'Select a property'),
        roomTypeId: z.string().min(1, 'Select a room type'),
        unitId: z.string().min(1, 'Select a room'),
        checkInDate: z.string().min(1, 'Pick a check-in date'),
        checkOutDate: z.string().min(1, 'Pick a check-out date'),
        adults: z.number().int().min(1).max(50),
        children: z.number().int().min(0).max(50),
        addonIds: z.array(z.string()),
        guest: z.object({
            name: z.string().min(2, 'Enter your full name'),
            email: z.email('Enter your email address'),
            phone: z.string().optional(),
        }),
    })
    .refine((d) => new Date(d.checkOutDate) > new Date(d.checkInDate), {
        message: 'Check-out must be after check-in',
        path: ['checkOutDate'],
    })

// Status badge styling per BookingStatus (mirrors Admin Panel palette)
const STATUS_BADGE: Record<BookingStatus, string> = {
    PENDING: 'text-amber-600 bg-amber-500/10',
    CONFIRMED: 'text-emerald-600 bg-emerald-500/10',
    CHECKED_IN: 'text-blue-600 bg-blue-500/10',
    CHECKED_OUT: 'text-slate-600 bg-slate-500/10',
    CANCELLED: 'text-red-600 bg-red-500/10',
    NO_SHOW: 'text-rose-600 bg-rose-500/10',
}

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatPrice(amount: string | number, currency?: string | null) {
    const value = typeof amount === 'string' ? parseFloat(amount) : amount
    if (!Number.isFinite(value)) return currency ? `${currency} ${amount}` : String(amount)
    if (currency) {
        try {
            return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value)
        } catch {
            return `${currency} ${value.toFixed(2)}`
        }
    }
    return value.toFixed(2)
}

function nightsBetween(checkIn: string, checkOut: string): number {
    if (!checkIn || !checkOut) return 0
    const ms = new Date(checkOut).getTime() - new Date(checkIn).getTime()
    const nights = Math.round(ms / 86_400_000)
    return Number.isFinite(nights) && nights > 0 ? nights : 0
}

function todayStr() {
    return new Date().toISOString().split('T')[0]
}

function tomorrowStr() {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return d.toISOString().split('T')[0]
}

type ReservationFormValues = z.infer<typeof reservationSchema>

const defaultFormValues: ReservationFormValues = {
    propertyId: '',
    roomTypeId: '',
    unitId: '',
    checkInDate: todayStr(),
    checkOutDate: tomorrowStr(),
    adults: 2,
    children: 0,
    addonIds: [],
    guest: {
        name: '',
        email: '',
        phone: '',
    },
}

function RouteComponent() {
    const { t } = useTranslation()
    const query = Route.useSearch()
    const mergeSearch = useSearchParams()
    const navigate = useNavigate()
    const properties = GetProperties()

    const [isOpen, setIsOpen] = useState(false)

    // Fetch dynamic reservations for the current owner
    const { data, isLoading, refetch } = useQuery({
        queryKey: ['reservations', query],
        queryFn: () => bookingApi.list(query),
    })

    // ── Create mutation ─────────────────────────────────────────────
    const createMutation = useMutation({
        mutationFn: (payload: CreateBookingPayload) => bookingApi.create(payload),
        onSuccess: () => {
            toast.success(t('reservations.createdSuccess', 'Reservation created successfully'))
            refetch()
            setIsOpen(false)
        },
        onError: (error: Error) => {
            toast.error(error.message || t('reservations.createFailed', 'Failed to create reservation'))
        },
    })

    // Table columns definition
    const columns: DataTableColumn<Booking>[] = [
        {
            key: 'user',
            header: t('reservations.user', 'User'),
            render: (res) => (
                <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full overflow-hidden bg-muted shrink-0">
                        {res.guest.user.image ? (
                            <img
                                src={resolveImage(res.guest.user.image)}
                                alt={res.guest.user.name}
                                crossOrigin="anonymous"
                                className="size-full object-cover"
                            />
                        ) : (
                            <div className="size-full flex items-center justify-center text-muted-foreground text-xs font-semibold">
                                {res.guest.user.name.slice(0, 2).toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{res.guest.user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{res.guest.user.email}</p>
                    </div>
                </div>
            ),
        },
        {
            key: 'property',
            header: t('reservations.property', 'Property'),
            render: (res) => (
                <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">{res.property.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                        {res.roomType.name}
                        {res.unit.roomNumber ? ` · Room ${res.unit.roomNumber}` : ''}
                    </p>
                </div>
            ),
        },
        {
            key: 'dates',
            header: t('reservations.dates', 'Dates'),
            render: (res) => (
                <div className="min-w-0">
                    <p className="text-sm text-foreground">
                        {formatDate(res.checkInDate)} — {formatDate(res.checkOutDate)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {res.nights} {res.nights === 1 ? 'night' : 'nights'}
                    </p>
                </div>
            ),
        },
        {
            key: 'amount',
            header: t('reservations.amount', 'Amount'),
            render: (res) => (
                <div className="min-w-0">
                    <p className="font-semibold text-foreground">{formatPrice(res.grandTotal, res.currency)}</p>
                    <p className="text-xs text-muted-foreground">{formatPrice(res.nightlyRate, res.currency)}/night</p>
                </div>
            ),
        },
        {
            key: 'status',
            header: t('reservations.status', 'Status'),
            render: (res) => (
                <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full capitalize', STATUS_BADGE[res.status])}>
                    {res.status.toLowerCase().replace(/_/g, ' ')}
                </span>
            ),
        },
        {
            key: 'action',
            header: t('reservations.action', 'Action'),
            render: (res) => (
                <div onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="sm">
                                {t('reservations.actionBtn', 'Action')} <ChevronDown className="size-3.5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white">
                            <DropdownMenuItem onClick={() => navigate({ to: '/reservations/$id', params: { id: res.id } })}>
                                <Eye className="size-3.5" />
                                {t('reservations.view', 'View Details')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => navigate({ to: '/reservations/$id', params: { id: res.id }, search: { edit: 1 } })}
                            >
                                <Edit className="size-3.5" />
                                {t('reservations.edit', 'Edit Details')}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            ),
        },
    ]

    const handleSubmit = async (values: ReservationFormValues) => {
        await createMutation.mutateAsync({
            propertyId: values.propertyId,
            roomTypeId: values.roomTypeId,
            unitId: values.unitId,
            checkInDate: values.checkInDate,
            checkOutDate: values.checkOutDate,
            adults: values.adults,
            children: values.children,
            addonIds: values.addonIds,
            guest: values.guest,
        })
    }

    return (
        <>
            <PageHeader
                title={t('reservations.title', 'Reservations')}
                description={t('reservations.description', 'Track upcoming, current, and past reservations across your properties.')}
            />

            {/* Controls row: search + status + property filters + add button */}
            <div className="flex flex-wrap items-center gap-3">
                <SearchInput
                    value={query.search ?? ''}
                    placeholder={t('reservations.searchPlaceholder', 'Search by user, property or reservation ID')}
                    className="sm:w-80"
                />

                <Select
                    value={query.status ?? 'all'}
                    onValueChange={(value) => mergeSearch({ status: value === 'all' ? undefined : value, page: 1 })}
                >
                    <SelectTrigger className="min-w-40">
                        <SelectValue placeholder={t('reservations.status', 'Status')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t('reservations.allStatuses', 'All statuses')}</SelectItem>
                        {BookingStatusOptions.map((s) => (
                            <SelectItem key={s} value={s}>
                                {capitalize(s)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select
                    value={query.propertyId ?? 'all'}
                    onValueChange={(value) => mergeSearch({ propertyId: value === 'all' ? undefined : value, page: 1 })}
                >
                    <SelectTrigger className="min-w-40">
                        <SelectValue placeholder={t('reservations.property', 'Property')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t('reservations.allProperties', 'All properties')}</SelectItem>
                        {properties.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                                {p.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Button onClick={() => setIsOpen(true)} className="ml-auto">
                    <Plus className="size-4" />
                    {t('reservations.add', 'Add Reservation')}
                </Button>
            </div>

            {/* Data Table */}
            <DataTable
                loading={isLoading}
                columns={columns}
                data={data?.data ?? []}
                noun={t('reservations.noun', 'reservations')}
                emptyIcon={<Calendar className="h-6 w-6" />}
                page={query.page}
                limit={query.limit}
                total={data?.meta.total ?? 0}
                onReset={() => mergeSearch({ search: undefined, status: undefined, propertyId: undefined, page: 1, limit: 10 })}
                onRowClick={(res) => navigate({ to: '/reservations/$id', params: { id: res.id } })}
            />

            <Dialog
                open={isOpen}
                onOpenChange={(open) => {
                    if (!open) setIsOpen(false)
                }}
            >
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{t('reservations.addTitle', 'Add Reservation')}</DialogTitle>
                        <DialogDescription>
                            {t('reservations.addDesc', 'Enter reservation details to add a new booking.')}
                        </DialogDescription>
                    </DialogHeader>

                    <ReservationForm
                        key="add"
                        defaultValues={defaultFormValues}
                        onSubmit={handleSubmit}
                        onCancel={() => setIsOpen(false)}
                        submitLabel={t('reservations.form.submit', 'Add reservation')}
                    />
                </DialogContent>
            </Dialog>
        </>
    )
}

function ReservationForm({
    defaultValues,
    onSubmit,
    onCancel,
    submitLabel,
}: {
    defaultValues: ReservationFormValues
    onSubmit: (values: ReservationFormValues) => Promise<void> | void
    onCancel: () => void
    submitLabel: string
}) {
    const { t } = useTranslation()
    const guests = GetGuests()
    const properties = GetProperties()
    const roomTypes = GetRoomTypes()

    const form = useAppForm({
        defaultValues,
        validators: { onChange: reservationSchema },
        onSubmit: async ({ value }) => {
            await onSubmit(value)
        },
    })

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault()
                form.handleSubmit()
            }}
            className="space-y-4"
        >
            {/* Property */}
            <form.Subscribe
                selector={(state) => state.values.guest}
                children={(selectedGuest) => {
                    const guest = guests.find((rt) => rt.user.email === selectedGuest.email)
                    const propertyOptions = properties
                        .filter((p) => (guest ? p.websiteId === guest.websiteId : true))
                        .map((p) => ({
                            value: p.id,
                            label: p.name,
                        }))

                    return (
                        <form.AppField
                            name="propertyId"
                            listeners={{
                                onChange: () => {
                                    form.setFieldValue('roomTypeId', '')
                                    form.setFieldValue('unitId', '')
                                    form.setFieldValue('addonIds', [])
                                },
                            }}
                        >
                            {(field) => (
                                <field.FormSelect
                                    label={t('reservations.form.property', 'Property')}
                                    placeholder={t('reservations.form.propertyPlaceholder', 'Select property')}
                                    options={propertyOptions}
                                />
                            )}
                        </form.AppField>
                    )
                }}
            />

            {/* Room type (filtered by property) */}
            <form.Subscribe
                selector={(state) => state.values.propertyId}
                children={(selectedPropertyId) => {
                    const roomTypeOptions = roomTypes
                        .filter((rt) => rt.propertyId === selectedPropertyId)
                        .map((rt) => ({
                            value: rt.id,
                            label: rt.name,
                        }))

                    return (
                        <form.AppField
                            name="roomTypeId"
                            listeners={{
                                onChange: () => {
                                    form.setFieldValue('unitId', '')
                                },
                            }}
                        >
                            {(field) => (
                                <field.FormSelect
                                    label={t('reservations.form.roomType', 'Room type')}
                                    placeholder={t('reservations.form.roomTypePlaceholder', 'Select room type')}
                                    options={roomTypeOptions}
                                    disabled={!selectedPropertyId}
                                />
                            )}
                        </form.AppField>
                    )
                }}
            />

            {/* Unit (filtered by room type) */}
            <form.Subscribe
                selector={(state) => state.values.roomTypeId}
                children={(selectedRoomTypeId) => {
                    const unitOptions =
                        roomTypes
                            .find((rt) => rt.id === selectedRoomTypeId)
                            ?.units.map((u) => ({
                                value: u.id,
                                label: `Room ${u.roomNumber}${u.floor ? ` · Floor ${u.floor}` : ''}`,
                            })) ?? []

                    return (
                        <form.AppField name="unitId">
                            {(field) => (
                                <field.FormSelect
                                    label={t('reservations.form.unit', 'Room')}
                                    placeholder={t('reservations.form.unitPlaceholder', 'Select room')}
                                    options={unitOptions}
                                    disabled={!selectedRoomTypeId}
                                />
                            )}
                        </form.AppField>
                    )
                }}
            />

            {/* Guest */}
            <form.Subscribe
                selector={(state) => state.values.propertyId}
                children={(selectedPropertyId) => {
                    const selectedProperty = properties.find((rt) => rt.id === selectedPropertyId)
                    const guestOptions = guests
                        .filter((guest) => (selectedProperty ? guest.websiteId === selectedProperty.websiteId : true))
                        .map((guest) => ({
                            value: guest.user.email,
                            label: `${guest.user.name} (${guest.user.email})`,
                        }))

                    return (
                        <form.AppField name="guest.email">
                            {(field) => (
                                <field.FormSearchableSelect
                                    label={t('reservations.form.guest', 'Guest')}
                                    placeholder={t('reservations.form.guestPlaceholder', 'Select a guest...')}
                                    searchPlaceholder={t('reservations.form.guestSearch', 'Search guests...')}
                                    options={guestOptions}
                                    disabled={!selectedPropertyId}
                                    allowAddNew
                                    addNewLabel={t('reservations.form.guestAddNew', 'Add new guest')}
                                    onSelect={(option) => {
                                        const picked = guests.find((g) => g.user.email === option.value)
                                        if (picked) {
                                            form.setFieldValue('guest', {
                                                name: picked.user.name,
                                                email: picked.user.email,
                                                phone: picked.user.phone ?? '',
                                            })
                                        }
                                    }}
                                    onCreateNew={async (value) => {
                                        form.setFieldValue('guest', {
                                            name: value.name,
                                            email: value.email,
                                            phone: '',
                                        })
                                    }}
                                />
                            )}
                        </form.AppField>
                    )
                }}
            />

            {/* Dates + occupancy */}
            <div className="grid grid-cols-2 gap-3">
                <form.AppField name="checkInDate">
                    {(field) => <field.FormInput type="date" label={t('reservations.form.checkIn', 'Check-in')} min={todayStr()} />}
                </form.AppField>
                <form.AppField name="checkOutDate">
                    {(field) => (
                        <field.FormInput
                            type="date"
                            label={t('reservations.form.checkOut', 'Check-out')}
                            min={form.state.values.checkInDate || todayStr()}
                        />
                    )}
                </form.AppField>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <form.AppField name="adults">
                    {(field) => <field.FormInputNumber label={t('reservations.form.adults', 'Adults')} placeholder="2" min={1} max={50} />}
                </form.AppField>
                <form.AppField name="children">
                    {(field) => (
                        <field.FormInputNumber label={t('reservations.form.children', 'Children')} placeholder="0" min={0} max={50} />
                    )}
                </form.AppField>
            </div>

            {/* Addons (only shown when a property is selected and the property has any active addons) */}
            <form.Subscribe
                selector={(state) => ({
                    propertyId: state.values.propertyId,
                    addonIds: state.values.addonIds,
                })}
                children={({ propertyId, addonIds }) => {
                    if (!propertyId) return null

                    const property = properties.find((p) => p.id === propertyId)
                    if (!property?.addons.length) return null

                    return (
                        <div className="space-y-2">
                            <div className="text-foreground flex items-center gap-1.5 text-sm font-semibold">
                                <Sparkles className="size-4 text-primary" />
                                {t('reservations.form.addons', 'Extras')}
                            </div>
                            <div className="space-y-2">
                                {property.addons.map((a) => {
                                    const checked = addonIds.includes(a.id)
                                    return (
                                        <button
                                            key={a.id}
                                            type="button"
                                            onClick={() => {
                                                const next = checked ? addonIds.filter((id) => id !== a.id) : [...addonIds, a.id]
                                                form.setFieldValue('addonIds', next)
                                            }}
                                            className={cn(
                                                'flex w-full items-start gap-2.5 rounded-md border p-2.5 text-left transition',
                                                checked ? 'border-primary bg-primary/5' : 'border-input hover:border-muted-foreground/40',
                                            )}
                                        >
                                            <span
                                                className={cn(
                                                    'mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border',
                                                    checked
                                                        ? 'border-primary bg-primary text-primary-foreground'
                                                        : 'border-muted-foreground/40',
                                                )}
                                            >
                                                {checked && <Check className="size-3" />}
                                            </span>
                                            <span className="min-w-0 flex-1">
                                                <span className="flex items-center justify-between gap-2">
                                                    <span className="text-sm font-medium">{a.name}</span>
                                                    <span className="text-muted-foreground text-xs font-semibold">
                                                        +{formatPrice(a.price, property.currency)}
                                                    </span>
                                                </span>
                                                {a.description && (
                                                    <span className="text-muted-foreground mt-0.5 block text-xs leading-relaxed">
                                                        {a.description}
                                                    </span>
                                                )}
                                            </span>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    )
                }}
            />

            {/* Live price summary */}
            <form.Subscribe
                selector={(state) => ({
                    propertyId: state.values.propertyId,
                    roomTypeId: state.values.roomTypeId,
                    checkInDate: state.values.checkInDate,
                    checkOutDate: state.values.checkOutDate,
                    addonIds: state.values.addonIds,
                })}
                children={({ propertyId, roomTypeId, checkInDate, checkOutDate, addonIds }) => {
                    if (!propertyId || !roomTypeId || !checkInDate || !checkOutDate) return null
                    const property = properties.find((p) => p.id === propertyId)
                    if (!property) return null
                    const room = roomTypes.find((rt) => rt.id === roomTypeId)
                    if (!room) return null
                    const nights = nightsBetween(checkInDate, checkOutDate)
                    if (nights <= 0) return null

                    const nightly = (() => {
                        const raw = room.ratePlans.at(0)?.defaultPrice ?? null
                        if (raw == null) return 0
                        const num = typeof raw === 'string' ? Number(raw) : raw
                        return Number.isFinite(num) ? num : 0
                    })()
                    const roomTotal = nightly * nights
                    const selectedAddons = property.addons.filter((a) => addonIds.includes(a.id))
                    const addonTotal = selectedAddons.reduce((sum, a) => sum + (Number(a.price) || 0), 0)
                    const grandTotal = roomTotal + addonTotal
                    const currency = property.currency

                    return (
                        <div className="text-muted-foreground space-y-1.5 rounded-lg border bg-muted/40 p-3 text-sm">
                            <div className="flex items-center justify-between">
                                <span>
                                    {formatPrice(nightly, currency)} × {nights} {nights === 1 ? 'night' : 'nights'}
                                </span>
                                <span className="text-foreground font-medium">{formatPrice(roomTotal, currency)}</span>
                            </div>
                            {addonTotal > 0 && (
                                <div className="flex items-center justify-between">
                                    <span>{t('reservations.form.addonsTotal', 'Extras')}</span>
                                    <span className="text-foreground font-medium">{formatPrice(addonTotal, currency)}</span>
                                </div>
                            )}
                            <div className="text-foreground flex items-center justify-between border-t pt-1.5 font-semibold">
                                <span>{t('reservations.form.summary', 'Total Price')}</span>
                                <span>{formatPrice(grandTotal, currency)}</span>
                            </div>
                        </div>
                    )
                }}
            />

            <DialogFooter>
                <Button type="button" variant="outline" onClick={onCancel} className="px-4 py-2 text-sm cursor-pointer">
                    {t('properties.cancel', 'Cancel')}
                </Button>
                <form.AppForm>
                    <form.FormSubmit label={submitLabel} />
                </form.AppForm>
            </DialogFooter>
        </form>
    )
}
