import { useAppForm } from '@/components/form/form-context';
import { Button } from '@/components/ui/button';
import type { DataTableColumn } from '@/components/ui/data-table';
import { DataTable } from '@/components/ui/data-table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PageHeader } from '@/components/ui/page-header';
import { SearchInput } from '@/components/ui/search-input';
import { StatusConfirm } from '@/components/ui/status-confirm';
import { TrashConfirm } from '@/components/ui/trash-confirm';
import { PROPERTIES, formatPrice, getPropertyById } from '@/lib/properties';
import { createFileRoute } from '@tanstack/react-router';
import { Check, ChevronDown, Edit, Plus, Trash2, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import * as z from 'zod';

export const Route = createFileRoute('/__main/reservations')({
    component: RouteComponent,
})

const reservationSchema = z.object({
    userEmail: z.email("Please enter a valid email").toLowerCase(),
    property: z.string().min(1, 'Property is required'),
    unit: z.string().min(1, 'unit is required'),
    checkIn: z.string().min(1, 'Check in date is required'),
    checkOut: z.string().min(1, 'Check out date is required'),
    paymentMethod: z.string(),
    image: z.string().optional(),
    status: z.enum(['Pending', 'Confirmed']),
})

type Reservation = {
    id: number
    userEmail: string
    property: string
    unit: string
    checkIn: string
    checkOut: string
    payment: string
    paymentMethod: string
    image?: string
    status: 'Pending' | 'Confirmed' | 'Cancelled'
}

const INITIAL_RESERVATIONS: Reservation[] = [
    {
        id: 1,
        userEmail: 'jane.cooper@example.com',
        image: 'https://api.dicebear.com/7.x/notionists/svg?seed=Jane',
        property: 'prop_001',
        unit: 'unit_001_01_01',
        checkIn: '2026-06-01',
        checkOut: '2026-06-05',
        payment: '$480.00 (Paid)',
        paymentMethod: 'Credit Card',
        status: 'Confirmed',
    },
    {
        id: 2,
        userEmail: 'wade.warren@example.com',
        image: 'https://api.dicebear.com/7.x/notionists/svg?seed=Wade',
        property: 'prop_002',
        unit: 'unit_002_01_01',
        checkIn: '2026-06-10',
        checkOut: '2026-06-12',
        payment: '$220.00 (Pending)',
        paymentMethod: 'PayPal',
        status: 'Confirmed',
    },
    {
        id: 3,
        userEmail: 'dianne.russell@example.com',
        image: 'https://api.dicebear.com/7.x/notionists/svg?seed=Dianne',
        property: 'prop_003',
        unit: 'unit_003_01_01',
        checkIn: '2026-07-02',
        checkOut: '2026-07-06',
        payment: '$640.00 (Paid)',
        paymentMethod: 'Credit Card',
        status: 'Cancelled',
    },
    {
        id: 4,
        userEmail: 'eleanor.pena@example.com',
        image: 'https://api.dicebear.com/7.x/notionists/svg?seed=Eleanor',
        property: 'prop_004',
        unit: 'unit_004_01_01',
        checkIn: '2026-08-15',
        checkOut: '2026-08-17',
        payment: '$180.00 (Paid)',
        paymentMethod: 'Cash',
        status: 'Confirmed',
    },
]

function RouteComponent() {
    const [reservations, setReservations] = useState<Reservation[]>(INITIAL_RESERVATIONS)
    const [searchQuery, setSearchQuery] = useState('')
    const [isOpen, setIsOpen] = useState(false)
    const [editingReservation, setEditingReservation] = useState<Reservation | null>(null)

    const isEditMode = editingReservation !== null

    const openAdd = () => {
        setEditingReservation(null)
        setIsOpen(true)
    }

    const openEdit = (res: Reservation) => {
        setEditingReservation(res)
        setIsOpen(true)
    }

    const closeDialog = () => {
        setIsOpen(false)
        setEditingReservation(null)
    }

    const handleSave = (values: z.infer<typeof reservationSchema>) => {
        let payment = '$0.00';
        const property = getPropertyById(values.property);
        if (property && values.unit && values.checkIn && values.checkOut) {
            const roomType = property.roomTypes.find(rt => rt.units.some(u => u.id === values.unit));
            if (roomType) {
                const checkInDate = new Date(values.checkIn);
                const checkOutDate = new Date(values.checkOut);
                let nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 3600 * 24));
                if (nights <= 0 || isNaN(nights)) nights = 1;
                const total = roomType.basePrice * nights;
                payment = `${formatPrice(total, property.property.currency)} (${values.paymentMethod === 'Cash' ? 'Pending' : 'Paid'})`;
            }
        }

        if (isEditMode) {
            setReservations((prev) => prev.map((r) => (r.id === editingReservation.id ? { ...r, ...values, payment } : r)))
        } else {
            const newRes: Reservation = {
                id: Date.now(),
                ...values,
                payment,
                image: values.userEmail ? `https://api.dicebear.com/7.x/notionists/svg?seed=${values.userEmail.replace(/[^a-zA-Z]/g, '')}` : undefined,
            }
            setReservations((prev) => [...prev, newRes])
        }
        closeDialog()
    }

    const filteredReservations = useMemo(() => {
        if (!searchQuery.trim()) return reservations
        const query = searchQuery.toLowerCase()
        return reservations.filter(
            (r) =>
                r.userEmail.toLowerCase().includes(query) ||
                getPropertyById(r.property)?.property.name.toLowerCase().includes(query) ||
                r.checkIn.toLowerCase().includes(query) ||
                r.checkOut.toLowerCase().includes(query) ||
                r.payment.toLowerCase().includes(query),
        )
    }, [reservations, searchQuery])

    const handleToggleStatus = (id: number) => {
        setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, status: r.status === 'Confirmed' ? 'Cancelled' : 'Confirmed' } : r)))
    }

    const handleDeleteReservation = (id: number) => {
        setReservations((prev) => prev.filter((r) => r.id !== id))
    }

    const columns: DataTableColumn<Reservation>[] = useMemo(
        () => [
            {
                key: 'user',
                header: 'Guest Email',
                className: 'flex items-center gap-3',
                render: (r) => (
                    <>
                        <div className="size-8 rounded-full overflow-hidden shrink-0">
                            {r.image ? <img src={r.image} alt={r.userEmail} className="size-full object-cover" /> : null}
                        </div>
                        {r.userEmail}
                    </>
                ),
            },
            { key: 'property', header: 'Property', render: (r) => <span className="text-muted-foreground">{getPropertyById(r.property)?.property.name || r.property}</span> },
            { key: 'dates', header: 'Dates', render: (r) => <span className="text-muted-foreground">{r.checkIn} to {r.checkOut}</span> },
            { key: 'payment', header: 'Payment', render: (r) => <span className="text-muted-foreground">{r.payment}</span> },
            {
                key: 'status',
                header: 'Status',
                render: (r) =>
                    r.status === 'Confirmed' ? (
                        <span className="text-xs font-semibold text-green-600 bg-green-500/10 px-2.5 py-1 rounded-full">Confirmed</span>
                    ) : (
                        <span className="text-xs font-semibold text-red-600 bg-red-500/10 px-2.5 py-1 rounded-full">Cancelled</span>
                    ),
            },
            {
                key: 'action',
                header: 'Action',
                render: (r) => (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="sm">
                                Action <ChevronDown className="h-3.5 w-3.5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white">
                            <DropdownMenuItem onClick={() => openEdit(r)}>
                                <Edit className="size-3.5" /> Edit
                            </DropdownMenuItem>
                            <StatusConfirm
                                name={r.userEmail}
                                currentStatus={r.status}
                                newStatus={r.status === 'Confirmed' ? 'Cancelled' : 'Confirmed'}
                                onConfirm={() => handleToggleStatus(r.id)}
                            >
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <Check className="size-3.5" /> Toggle Status
                                </DropdownMenuItem>
                            </StatusConfirm>
                            <TrashConfirm name={r.userEmail} onConfirm={() => handleDeleteReservation(r.id)}>
                                <DropdownMenuItem variant="destructive" onSelect={(e) => e.preventDefault()}>
                                    <Trash2 className="size-3.5" /> Delete
                                </DropdownMenuItem>
                            </TrashConfirm>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ),
            },
        ],
        [],
    )

    return (
        <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <PageHeader title="Reservations" description="Manage reservations and bookings" />
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <SearchInput value={searchQuery} onValueChange={setSearchQuery} placeholder="Search reservations" className="w-full sm:w-[320px]" />
                    <Button onClick={openAdd} className="w-full sm:w-auto">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Reservation
                    </Button>
                </div>
            </div>

            <DataTable
                columns={columns}
                data={filteredReservations}
                noun="reservations"
                emptyIcon={<Users className="h-6 w-6" />}
                onReset={() => setSearchQuery('')}
            />

            <Dialog
                open={isOpen}
                onOpenChange={(open) => {
                    if (!open) closeDialog()
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle >{isEditMode ? 'Edit Reservation' : 'Add Reservation'}</DialogTitle>
                        <DialogDescription >
                            {isEditMode
                                ? `Modify reservation for ${editingReservation.userEmail || 'Guest'}.`
                                : 'Enter reservation details to add a new booking.'}
                        </DialogDescription>
                    </DialogHeader>

                    <ReservationForm
                        key={editingReservation?.id ?? 'add'}
                        defaultValues={
                            editingReservation
                                ? {
                                    userEmail: editingReservation.userEmail,
                                    property: editingReservation.property,
                                    unit: editingReservation.unit,
                                    checkIn: editingReservation.checkIn,
                                    checkOut: editingReservation.checkOut,
                                    paymentMethod: editingReservation.paymentMethod,
                                    image: editingReservation.image,
                                    status: editingReservation.status as 'Pending' | 'Confirmed',
                                }
                                : { userEmail: '', property: '', unit: '', checkIn: '', checkOut: '', paymentMethod: 'Credit Card', image: '', status: 'Confirmed' }
                        }
                        onSubmit={handleSave}
                        onCancel={closeDialog}
                        submitLabel={isEditMode ? 'Save Changes' : 'Add Reservation'}
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
    defaultValues: z.infer<typeof reservationSchema>
    onSubmit: (values: z.infer<typeof reservationSchema>) => void
    onCancel: () => void
    submitLabel: string
}) {
    const form = useAppForm({
        defaultValues,
        validators: { onChange: reservationSchema },
        onSubmit: async ({ value }) => onSubmit(value),
    })

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault()
                form.handleSubmit()
            }}
            className="space-y-4"
        >
            <form.AppField name="userEmail">
                {(field) => (
                    <field.FormSelect
                        label="Guest Email"
                        placeholder="Select Guest"
                        options={[
                            { value: 'jane.cooper@example.com', label: 'Jane Cooper (jane.cooper@example.com)' },
                            { value: 'wade.warren@example.com', label: 'Wade Warren (wade.warren@example.com)' },
                            { value: 'dianne.russell@example.com', label: 'Dianne Russell (dianne.russell@example.com)' },
                            { value: 'eleanor.pena@example.com', label: 'Eleanor Pena (eleanor.pena@example.com)' },
                        ]}
                    />
                )}
            </form.AppField>

            <form.AppField name="property">
                {(field) => (
                    <field.FormSelect
                        label="Property"
                        placeholder="Select Property"
                        options={PROPERTIES.map(p => ({
                            value: p.property.id,
                            label: p.property.name,
                        }))}
                    />
                )}
            </form.AppField>

            <form.Subscribe
                selector={(state) => state.values.property}
                children={(selectedPropertyId) => {
                    const selectedProperty = getPropertyById(selectedPropertyId);
                    const unitOptions = selectedProperty ? selectedProperty.roomTypes.flatMap(rt => rt.units.map(u => ({
                        value: u.id,
                        label: `${u.roomNumber} (${rt.name})`
                    }))) : [];

                    return (
                        <form.AppField name="unit">
                            {(field) => (
                                <field.FormSelect
                                    label="Unit"
                                    placeholder="Select Unit"
                                    options={unitOptions}
                                />
                            )}
                        </form.AppField>
                    );
                }}
            />

            <form.Subscribe
                selector={(state) => ({ propertyId: state.values.property, unitId: state.values.unit, checkIn: state.values.checkIn, checkOut: state.values.checkOut })}
                children={({ propertyId, unitId, checkIn, checkOut }) => {
                    const property = getPropertyById(propertyId);
                    let priceDisplay = '';
                    if (property && unitId && checkIn && checkOut) {
                        const roomType = property.roomTypes.find(rt => rt.units.some(u => u.id === unitId));
                        if (roomType) {
                            const checkInDate = new Date(checkIn);
                            const checkOutDate = new Date(checkOut);
                            let nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 3600 * 24));
                            if (nights <= 0 || isNaN(nights)) nights = 1;
                            const total = roomType.basePrice * nights;
                            priceDisplay = `${formatPrice(total, property.property.currency)} (${nights} night${nights > 1 ? 's' : ''})`;
                        }
                    }
                    if (!priceDisplay) return null;
                    return (
                        <div className="text-sm font-medium text-slate-700 bg-[#EEF3FF] p-3 rounded-xl border border-[#243E8B]/20">
                            Total Price: <span className="font-bold text-[#243E8B]">{priceDisplay}</span>
                        </div>
                    );
                }}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <form.AppField name="checkIn">
                    {(field) => <field.FormInput type="date" label="Check In" />}
                </form.AppField>
                <form.AppField name="checkOut">
                    {(field) => <field.FormInput type="date" label="Check Out" />}
                </form.AppField>
            </div>
            <form.AppField name="paymentMethod">
                {(field) => (
                    <field.FormSelect
                        label="Payment Method"
                        placeholder="Select Payment Method"
                        options={[
                            { value: 'Cash', label: 'Cash' },
                            { value: 'Credit Card', label: 'Credit Card' },
                            { value: 'Debit Card', label: 'Debit Card' },
                            { value: 'Stripe', label: 'Stripe' },
                            { value: 'Square', label: 'Square' },
                            { value: 'PayPal', label: 'PayPal' },
                        ]}
                    />
                )}
            </form.AppField>

            <form.AppField name="status">
                {(field) => (
                    <field.FormRadio
                        label="Status"
                        options={[
                            { value: 'Pending', label: 'Pending' },
                            { value: 'Confirmed', label: 'Confirmed' },

                        ]}
                    />
                )}
            </form.AppField>

            <DialogFooter>
                <Button type="button" variant="outline" onClick={onCancel} className="px-4 py-2 text-sm cursor-pointer">
                    Cancel
                </Button>
                <form.AppForm>
                    <form.FormSubmit label={submitLabel} />
                </form.AppForm>
            </DialogFooter>
        </form>
    )
}
