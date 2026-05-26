import { useAppForm } from '@/components/form/form-context'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import type { DataTableColumn } from '@/components/ui/data-table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import { PageHeader } from '@/components/ui/page-header'
import { SearchInput } from '@/components/ui/search-input'
import { StatusConfirm } from '@/components/ui/status-confirm'
import { TrashConfirm } from '@/components/ui/trash-confirm'
import { createFileRoute } from '@tanstack/react-router'
import { Check, ChevronDown, Edit, Plus, Trash2, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import * as z from 'zod'

export const Route = createFileRoute('/__main/payments')({
    component: RouteComponent,
})

const reservationSchema = z.object({
    userName: z.string().min(1, 'User name is required'),
    property: z.string().min(1, 'Property is required'),
    channel1: z.string(),
    channel2: z.string(),
    dates: z.string(),
    payment: z.string(),
    image: z.string().optional(),
    status: z.enum(['Confirmed', 'Cancelled']),
})

type Reservation = {
    id: number
    userName: string
    property: string
    channel1: string
    channel2: string
    dates: string
    payment: string
    image?: string
    status: 'Confirmed' | 'Cancelled'
}

const INITIAL_RESERVATIONS: Reservation[] = [
    {
        id: 1,
        userName: 'Jane Cooper',
        image: 'https://api.dicebear.com/7.x/notionists/svg?seed=Jane',
        property: 'Oceanview Apartment #12',
        channel1: 'Website',
        channel2: 'Direct',
        dates: 'Jun 1, 2026 - Jun 5, 2026',
        payment: '$480 (Paid)',
        status: 'Confirmed',
    },
    {
        id: 2,
        userName: 'Wade Warren',
        image: 'https://api.dicebear.com/7.x/notionists/svg?seed=Wade',
        property: 'Downtown Loft #3B',
        channel1: 'Airbnb',
        channel2: 'Channel Manager',
        dates: 'Jun 10, 2026 - Jun 12, 2026',
        payment: '$220 (Pending)',
        status: 'Confirmed',
    },
    {
        id: 3,
        userName: 'Dianne Russell',
        image: 'https://api.dicebear.com/7.x/notionists/svg?seed=Dianne',
        property: 'Suburban House #7',
        channel1: 'Booking.com',
        channel2: 'OTA',
        dates: 'Jul 2, 2026 - Jul 6, 2026',
        payment: '$640 (Paid)',
        status: 'Cancelled',
    },
    {
        id: 4,
        userName: 'Eleanor Pena',
        image: 'https://api.dicebear.com/7.x/notionists/svg?seed=Eleanor',
        property: 'City Studio #101',
        channel1: 'Direct',
        channel2: 'Website',
        dates: 'Aug 15, 2026 - Aug 17, 2026',
        payment: '$180 (Paid)',
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
        if (isEditMode) {
            setReservations((prev) => prev.map((r) => (r.id === editingReservation.id ? { ...r, ...values } : r)))
        } else {
            const newRes: Reservation = {
                id: Date.now(),
                ...values,
                image: values.userName ? `https://api.dicebear.com/7.x/notionists/svg?seed=${values.userName.replace(/\s+/g, '')}` : undefined,
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
                r.userName.toLowerCase().includes(query) ||
                r.property.toLowerCase().includes(query) ||
                r.channel1.toLowerCase().includes(query) ||
                r.channel2.toLowerCase().includes(query) ||
                r.dates.toLowerCase().includes(query) ||
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
                header: 'User Name',
                className: 'flex items-center gap-3',
                render: (r) => (
                    <>
                        <div className="size-8 rounded-full overflow-hidden">
                            {r.image ? <img src={r.image} alt={r.userName} className="size-full object-cover" /> : null}
                        </div>
                        {r.userName}
                    </>
                ),
            },
            { key: 'property', header: 'Property', render: (r) => <span className="text-muted-foreground">{r.property}</span> },
            { key: 'channel1', header: 'Channel', render: (r) => <span className="text-muted-foreground">{r.channel1}</span> },
            { key: 'channel2', header: 'Channel', render: (r) => <span className="text-muted-foreground">{r.channel2}</span> },
            { key: 'dates', header: 'Dates', render: (r) => <span className="text-muted-foreground">{r.dates}</span> },
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
                                name={r.userName}
                                currentStatus={r.status}
                                newStatus={r.status === 'Confirmed' ? 'Cancelled' : 'Confirmed'}
                                onConfirm={() => handleToggleStatus(r.id)}
                            >
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <Check className="size-3.5" /> Toggle Status
                                </DropdownMenuItem>
                            </StatusConfirm>
                            <TrashConfirm name={r.userName} onConfirm={() => handleDeleteReservation(r.id)}>
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
            <PageHeader title="Reservations" description="Manage reservations and bookings" />

            <div className="flex items-center justify-between gap-4">
                <SearchInput value={searchQuery} onValueChange={setSearchQuery} placeholder="Search reservations" className="sm:w-80" />
                <Button onClick={openAdd}>
                    <Plus className="h-4 w-4" />
                    Add Reservation
                </Button>
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
                        <DialogTitle className="text-lg font-semibold">{isEditMode ? 'Edit Reservation' : 'Add Reservation'}</DialogTitle>
                        <DialogDescription className="text-sm text-slate-500">
                            {isEditMode
                                ? `Modify reservation for ${editingReservation.userName || 'Guest'}.`
                                : 'Enter reservation details to add a new booking.'}
                        </DialogDescription>
                    </DialogHeader>

                    <ReservationForm
                        key={editingReservation?.id ?? 'add'}
                        defaultValues={
                            editingReservation
                                ? {
                                    userName: editingReservation.userName,
                                    property: editingReservation.property,
                                    channel1: editingReservation.channel1,
                                    channel2: editingReservation.channel2,
                                    dates: editingReservation.dates,
                                    payment: editingReservation.payment,
                                    image: editingReservation.image,
                                    status: editingReservation.status,
                                }
                                : { userName: '', property: '', channel1: 'Website', channel2: '', dates: '', payment: '', image: '', status: 'Confirmed' }
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
            <form.AppField name="image">{(field) => <field.FormAvatar folder="reservations" />}</form.AppField>

            <form.AppField name="userName">{(field) => <field.FormInput label="Guest Name" placeholder="e.g. Jane Cooper" />}</form.AppField>

            <form.AppField name="property">
                {(field) => <field.FormInput label="Property" placeholder="e.g. Oceanview Apartment #12" />}
            </form.AppField>

            <form.AppField name="channel1">
                {(field) => <field.FormInput label="Channel" placeholder="e.g. Airbnb" />}
            </form.AppField>

            <form.AppField name="channel2">
                {(field) => <field.FormInput label="Channel (secondary)" placeholder="e.g. Direct" />}
            </form.AppField>

            <form.AppField name="dates">
                {(field) => <field.FormInput label="Dates" placeholder="e.g. Jun 1, 2026 - Jun 5, 2026" />}
            </form.AppField>

            <form.AppField name="payment">
                {(field) => <field.FormInput label="Payment" placeholder="e.g. $480 (Paid)" />}
            </form.AppField>

            <form.AppField name="status">
                {(field) => (
                    <div className="space-y-1.5">
                        <Label>Status</Label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <input
                                    type="radio"
                                    checked={field.state.value === 'Confirmed'}
                                    onChange={() => field.handleChange('Confirmed')}
                                    className="h-4 w-4 accent-primary"
                                />
                                Confirmed
                            </label>
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <input
                                    type="radio"
                                    checked={field.state.value === 'Cancelled'}
                                    onChange={() => field.handleChange('Cancelled')}
                                    className="h-4 w-4 accent-primary"
                                />
                                Cancelled
                            </label>
                        </div>
                    </div>
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
