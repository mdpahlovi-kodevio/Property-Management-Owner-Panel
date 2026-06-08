import { useAppForm } from '@/components/form/form-context'
import { Button } from '@/components/ui/button'
import { DataTableFooter } from '@/components/ui/data-table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PageHeader } from '@/components/ui/page-header'
import { SearchInput } from '@/components/ui/search-input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { getPropertyById, type Property } from '@/lib/properties'
import { cn } from '@/lib/utils'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
    Accessibility,
    ArrowLeft,
    Car,
    Clock,
    Dumbbell,
    Edit,
    Eye,
    MapPin,
    ParkingCircle,
    Plus,
    Star,
    Trash2,
    UtensilsCrossed,
    Waves,
    Wifi,
    X
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import * as z from 'zod'

export const Route = createFileRoute('/__main/property_/$propertyId')({
    component: PropertyUnitComponent,
})

// ─── Card shape derived from PROPERTIES roomTypes ──────────────────
type RoomTypeCard = {
    id: string
    title: string
    location: string
    details: string
    basePrice: number
    currency: string
    totalUnits: number
    capacity: string
    status: 'Active' | 'Maintenance'
    imageUrl: string
    units: string[]
    propertyId: string
    viewType: string
    bedsCount: number
    bathsCount: number
    maxGuests: number
    roomSizeLabel: string
    privateBathroom: boolean
}

function buildRoomTypeCards(property: Property | undefined): RoomTypeCard[] {
    if (!property) return []
    const currency = property.property.currency
    return property.roomTypes.map((rt) => {
        const bedsCount = rt.beds.reduce((s, b) => s + b.quantity, 0)
        const floorLabel = rt.units.length > 0
            ? Array.from(new Set(rt.units.map((u) => u.floor))).join(', ')
            : '—'
        return {
            id: rt.id,
            title: rt.name,
            location: `Floor ${floorLabel}`,
            details: `${bedsCount} Bed${bedsCount === 1 ? '' : 's'} • 1 Bath • ${rt.roomSize}${rt.roomSizeUnit}`,
            basePrice: rt.basePrice,
            currency,
            totalUnits: rt.units.length,
            capacity: `${rt.maxAdults} Adult${rt.maxAdults === 1 ? '' : 's'}${rt.maxChildren > 0 ? `, ${rt.maxChildren} Child${rt.maxChildren === 1 ? '' : 'ren'}` : ''}`,
            status: 'Active' as const,
            imageUrl: rt.images.thumbnail,
            units: rt.units.map((u) => u.roomNumber),
            propertyId: rt.propertyId,
            viewType: rt.viewType,
            bedsCount,
            bathsCount: rt.privateBathroom ? 1 : 0,
            maxGuests: rt.maxOccupancy,
            roomSizeLabel: `${rt.roomSize} ${rt.roomSizeUnit}`,
            privateBathroom: rt.privateBathroom,
        }
    })
}

const BED_TYPES = ['King', 'Queen', 'Double', 'Twin', 'Single', 'Bunk', 'Sofa Bed', 'Murphy Bed', 'Futon']
const ROOM_AMENITIES = [
    { label: 'Air conditioning', icon: null },
    { label: 'TV', icon: null },
    { label: 'Mini bar', icon: null },
    { label: 'Coffee machine', icon: null },
    { label: 'Desk', icon: null },
    { label: 'Balcony', icon: null },
    { label: 'Kitchen', icon: null },
    { label: 'Microwave', icon: null },
    { label: 'Refrigerator', icon: null },
    { label: 'Safe', icon: null },
    { label: 'Hair dryer', icon: null },
    { label: 'Bathtub', icon: null },
    { label: 'WiFi', icon: Wifi },
    { label: 'Parking', icon: ParkingCircle },
    { label: 'Pool access', icon: Waves },
    { label: 'Gym access', icon: Dumbbell },
    { label: 'Breakfast', icon: UtensilsCrossed },
    { label: 'Airport shuttle', icon: Car },
    { label: 'Wheelchair accessible', icon: Accessibility },
    { label: '24-hr service', icon: Clock },
    { label: 'Concierge', icon: Star },
]
const VIEW_TYPES = ['Ocean view', 'Garden view', 'Pool view', 'Mountain view', 'City view', 'Courtyard view']
const ROOM_TABS = ['Identity', 'Pricing', 'Capacity & Inventory', 'Presentation'] as const
type RoomTab = typeof ROOM_TABS[number]

// ─── Zod schema mirroring the lib roomTypes shape ──────────────────
const roomTypeFormSchema = z.object({
    id: z.string(),
    propertyId: z.string(),
    name: z.string().min(1, 'Name is required'),
    internalCode: z.string().min(1, 'Internal code is required'),
    description: z.string().min(1, 'Description is required'),
    maxAdults: z.number().min(1),
    maxChildren: z.number().min(0),
    maxOccupancy: z.number().min(1),
    basePrice: z.number().min(0),
    roomSize: z.number().min(1),
    roomSizeUnit: z.enum(['sqm', 'sqft']),
    beds: z.array(z.object({ id: z.string(), bedType: z.string(), quantity: z.number().min(1) })),
    amenities: z.array(z.string()),
    units: z.array(z.object({ id: z.string(), roomNumber: z.string(), floor: z.string() })),
    smokingRoom: z.boolean(),
    accessibleRoom: z.boolean(),
    privateBathroom: z.boolean(),
    sharedBathroom: z.boolean(),
    viewType: z.string(),
    thumbnail: z.string(),
    gallery: z.array(z.string()),
})

type RoomTypeFormValues = z.infer<typeof roomTypeFormSchema>

const ROOM_FORM_DEFAULTS: RoomTypeFormValues = {
    id: '',
    propertyId: '',
    name: '',
    internalCode: '',
    description: '',
    maxAdults: 2,
    maxChildren: 0,
    maxOccupancy: 2,
    basePrice: 100,
    roomSize: 28,
    roomSizeUnit: 'sqm',
    beds: [{ id: 'bed_init_1', bedType: 'King', quantity: 1 }],
    amenities: [],
    units: [{ id: 'unit_init_1', roomNumber: '101', floor: '1' }],
    smokingRoom: false,
    accessibleRoom: false,
    privateBathroom: true,
    sharedBathroom: false,
    viewType: '',
    thumbnail: '',
    gallery: [],
}

function valuesFromRoomType(rt: Property['roomTypes'][number]): RoomTypeFormValues {
    return {
        id: rt.id,
        propertyId: rt.propertyId,
        name: rt.name,
        internalCode: rt.internalCode,
        description: rt.description,
        maxAdults: rt.maxAdults,
        maxChildren: rt.maxChildren,
        maxOccupancy: rt.maxOccupancy,
        basePrice: rt.basePrice,
        roomSize: rt.roomSize,
        roomSizeUnit: rt.roomSizeUnit,
        beds: rt.beds.map((b) => ({ ...b })),
        amenities: [...rt.amenities],
        units: rt.units.map((u) => ({ ...u })),
        smokingRoom: rt.smokingRoom,
        accessibleRoom: rt.accessibleRoom,
        privateBathroom: rt.privateBathroom,
        sharedBathroom: rt.sharedBathroom,
        viewType: rt.viewType,
        thumbnail: rt.images.thumbnail,
        gallery: [...rt.images.gallery],
    }
}

function newId(prefix: string) {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`
}

// ─── Component ───────────────────────────────────────────────────────
function PropertyUnitComponent() {
    const { propertyId } = Route.useParams()
    const property = getPropertyById(propertyId)
    const roomCards = buildRoomTypeCards(property)

    const [searchQuery, setSearchQuery] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(4)
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [activeTab, setActiveTab] = useState<RoomTab>('Identity')
    const [editingRoomId, setEditingRoomId] = useState<string | null>(null)

    const isEditMode = editingRoomId !== null

    const openAdd = () => {
        setEditingRoomId(null)
        setActiveTab('Identity')
        setIsAddOpen(true)
    }

    const openEdit = (room: RoomTypeCard) => {
        if (!property?.roomTypes.find((rt) => rt.id === room.id)) return
        setEditingRoomId(room.id)
        setActiveTab('Identity')
        setIsAddOpen(true)
    }

    const closeDialog = () => {
        setIsAddOpen(false)
        setEditingRoomId(null)
    }

    const editingCard = editingRoomId
        ? roomCards.find(r => r.id === editingRoomId) ?? null
        : null

    const formDefaults: RoomTypeFormValues = editingCard
        ? (() => {
            const full = property?.roomTypes.find((rt) => rt.id === editingCard.id)
            return full ? valuesFromRoomType(full) : ROOM_FORM_DEFAULTS
        })()
        : ROOM_FORM_DEFAULTS

    const handleSave = (values: RoomTypeFormValues) => {
        console.log('Submitted room:', values)
        toast.success(isEditMode ? 'Room type updated successfully!' : 'Room type created successfully!')
        closeDialog()
    }

    const pageTitle = property
        ? `Room Types — ${property.property.name}`
        : `Room Types — ${propertyId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}`

    return (
        <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <Button variant="ghost" size="sm" asChild className="w-fit -ml-3 text-slate-500 hover:text-slate-900">
                        <Link to="/property">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Properties
                        </Link>
                    </Button>
                    <PageHeader
                        title={pageTitle}
                        description="Manage room types for this property"
                    />
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <SearchInput
                        placeholder="Search rooms..."
                        value={searchQuery}
                        onValueChange={(val) => { setSearchQuery(val); setCurrentPage(1) }}
                        className="w-full sm:w-80"
                    />
                    <Button
                        onClick={openAdd}
                        className="shrink-0 gap-1.5 rounded-xl font-semibold bg-[#243E8B] hover:bg-[#1D3270] text-white shadow-sm shadow-[#243E8B]/20 hover:shadow-md hover:shadow-[#243E8B]/30 transition-all duration-300"
                    >
                        <Plus className="size-4" />
                        Add Room Type
                    </Button>
                </div>
            </div>

            <div className="flex flex-col gap-8 mt-6">
                {(() => {
                    const filteredRooms = roomCards.filter(room => {
                        const query = searchQuery.toLowerCase()
                        return room.title.toLowerCase().includes(query) || room.location.toLowerCase().includes(query) || room.details.toLowerCase().includes(query)
                    })
                    const paginatedRooms = filteredRooms.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

                    if (paginatedRooms.length === 0) {
                        return (
                            <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center text-slate-500">
                                {property
                                    ? 'No room types match your search.'
                                    : `Property "${propertyId}" not found.`}
                            </div>
                        )
                    }

                    return (
                        <>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4.5">
                                {paginatedRooms.map((room) => (
                                    <div
                                        key={room.id}
                                        className="group h-full flex flex-col bg-card rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06),0_6px_16px_rgba(0,0,0,0.06)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.1),0_12px_28px_rgba(0,0,0,0.08)] border border-border transition-all duration-300 ease-out hover:-translate-y-1 overflow-hidden"
                                    >
                                        {/* Image */}
                                        <div className="relative w-full overflow-hidden bg-muted shrink-0" style={{ paddingTop: '66%' }}>
                                            <img
                                                src={room.imageUrl}
                                                alt={room.title}
                                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
                                            />

                                            {/* View type badge (top-left, Guest-Panel style) */}
                                            {room.viewType && (
                                                <span className="absolute top-3 left-3 bg-primary text-primary-foreground px-3 py-1 rounded-full text-[0.7rem] font-bold uppercase tracking-wide shadow-sm">
                                                    {room.viewType}
                                                </span>
                                            )}

                                            {/* Status badge (top-right) — admin affordance */}
                                            <div className="absolute top-3 right-3">
                                                <span className={cn(
                                                    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md',
                                                    room.status === 'Active'
                                                        ? 'bg-emerald-500/90 text-white border-white/20'
                                                        : 'bg-amber-500/90 text-white border-white/20'
                                                )}>
                                                    <span className="relative inline-flex rounded-full size-1.5 bg-white" />
                                                    {room.status}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Body */}
                                        <div className="p-4 flex flex-col gap-2 grow bg-card">
                                            {/* Title row with viewType chip (mirrors property card rating) */}
                                            <div className="flex justify-between items-center gap-3">
                                                <h3 className="text-[1.05rem] font-semibold text-foreground leading-snug line-clamp-1 m-0 group-hover:text-primary transition-colors duration-300">
                                                    {room.title}
                                                </h3>
                                                {room.viewType && (
                                                    <span className="inline-flex items-center gap-1 text-[0.7rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent text-foreground whitespace-nowrap shrink-0">
                                                        {room.viewType}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Subtitle: floor / beds chip */}
                                            <div className="flex justify-between items-center gap-2 text-muted-foreground text-[0.875rem]">
                                                <span className="inline-flex items-center gap-1">
                                                    <MapPin className="size-3.5" />
                                                    {room.location}
                                                </span>
                                                {room.bedsCount > 0 && (
                                                    <span className="text-[0.75rem] font-medium px-2 py-0.5 rounded-full border border-border text-muted-foreground">
                                                        🛏 {room.bedsCount} bed{room.bedsCount === 1 ? '' : 's'}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Meta: guests / baths / size (border-t) */}
                                            <div className="flex justify-between items-center gap-2 flex-wrap border-t border-border pt-2 text-[0.875rem] text-muted-foreground">
                                                <span className="inline-flex items-center gap-1">👥 {room.maxGuests} Guest{room.maxGuests === 1 ? '' : 's'}</span>
                                                <span className="inline-flex items-center gap-1">🚿 {room.privateBathroom ? 'Private' : 'Shared'}</span>
                                                <span className="inline-flex items-center gap-1">📐 {room.roomSizeLabel}</span>
                                            </div>

                                            {/* Admin info chips (border-y py-2 — matches property card style) */}
                                            <div className="flex justify-between items-center gap-1.5 flex-wrap border-y border-border py-2">
                                                <span className="inline-flex items-center gap-1 text-xs uppercase tracking-wider px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                                                    {room.totalUnits} unit{room.totalUnits === 1 ? '' : 's'}
                                                </span>
                                                <span className="inline-flex items-center gap-1 text-xs uppercase tracking-wider px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                                                    {room.units.length > 0 ? `${room.units.length} room#` : 'No rooms'}
                                                </span>
                                            </div>

                                            <div className="flex justify-between items-center gap-1.5 flex-wrap">
                                                <span className="text-[0.7rem] text-muted-foreground">
                                                    {room.capacity}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2">
                                                <Button
                                                    onClick={() => openEdit(room)}
                                                    variant="outline"

                                                >
                                                    <Edit className="size-3.5" />
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="default"
                                                    asChild
                                                >
                                                    <Link to="/property/$propertyId/room/$roomTypeId" params={{ propertyId, roomTypeId: room.id }}>
                                                        <Eye className="size-3.5" />
                                                        View
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <DataTableFooter
                                page={currentPage}
                                limit={itemsPerPage}
                                total={filteredRooms.length}
                                onPageChange={setCurrentPage}
                                onLimitChange={(limit) => { setItemsPerPage(limit); setCurrentPage(1) }}
                                limitOptions={[4, 8, 12, 24]}
                                noun="rooms"
                            />
                        </>
                    )
                })()}
            </div>

            {/* ══════════════════════════════════════════════════
                CREATE / EDIT ROOM TYPE DIALOG
            ══════════════════════════════════════════════════ */}
            <Dialog open={isAddOpen} onOpenChange={(open) => { if (!open) closeDialog() }}>
                <DialogContent className="sm:max-w-160">
                    <DialogHeader >
                        <DialogTitle>
                            {isEditMode ? 'Edit room type' : 'Create room type'}
                        </DialogTitle>
                        <DialogDescription>
                            {isEditMode
                                ? `Editing "${editingCard?.title ?? ''}"`
                                : 'Add a new room type to this property'}
                        </DialogDescription>
                    </DialogHeader>
                    <RoomTypeForm
                        key={editingRoomId ?? 'add'}
                        defaultValues={formDefaults}
                        activeTab={activeTab}
                        onActiveTabChange={setActiveTab}
                        onSubmit={handleSave}
                        onCancel={closeDialog}
                        submitLabel={isEditMode ? 'Save changes' : 'Save room type'}
                        propertyCurrency={property?.property.currency ?? null}
                    />
                </DialogContent>
            </Dialog>
        </>
    )
}

// ─── RoomTypeForm sub-component (mirrors PropertyForm pattern) ─────
function RoomTypeForm({
    defaultValues,
    activeTab,
    onActiveTabChange,
    onSubmit,
    onCancel,
    submitLabel,
    propertyCurrency,
}: {
    defaultValues: RoomTypeFormValues
    activeTab: RoomTab
    onActiveTabChange: (tab: RoomTab) => void
    onSubmit: (values: RoomTypeFormValues) => void
    onCancel: () => void
    submitLabel: string
    propertyCurrency: string | null
}) {
    // Unit management local state (input fields, bulk generator)
    const [unitInput, setUnitInput] = useState('')
    const [unitFloor, setUnitFloor] = useState('1')
    const [genCount, setGenCount] = useState(10)
    const [genStart, setGenStart] = useState(201)
    const [genFloor, setGenFloor] = useState('2')

    const form = useAppForm({
        defaultValues,
        validators: { onChange: roomTypeFormSchema },
        onSubmit: async ({ value }) => onSubmit(value),
    })

    const currencySymbol = propertyCurrency === 'USD' ? '$'
        : propertyCurrency === 'EUR' ? '€'
            : propertyCurrency === 'GBP' ? '£'
                : '$'

    return (
        <>
            <div className="flex border-b border-slate-100 bg-slate-50/60 overflow-x-auto shrink-0">
                {ROOM_TABS.map((tab) => (
                    <button
                        key={tab}
                        type="button"
                        onClick={() => onActiveTabChange(tab)}
                        className={cn(
                            'flex-1 min-w-[70px] px-4 py-3 text-[12.5px] font-semibold whitespace-nowrap border-b-2 transition-all duration-200',
                            activeTab === tab
                                ? 'border-[#243E8B] text-[#243E8B] bg-white'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-white/60'
                        )}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <form
                onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); form.handleSubmit() }}
                className="flex flex-col flex-1 min-h-0"
            >
                {/* ════════ IDENTITY ════════ */}
                {activeTab === 'Identity' && (
                    <div className="flex flex-col gap-6">
                        <Section>
                            <SectionLabel>Identity</SectionLabel>
                            <form.AppField name="name">
                                {(field) => <field.FormInput label="Room type name" placeholder="e.g. Deluxe King Room" />}
                            </form.AppField>
                            <form.AppField name="internalCode">
                                {(field) => <field.FormInput label="Internal code" placeholder="e.g. DLX-KNG-01" />}
                            </form.AppField>
                            <div className="grid grid-cols-2 gap-3">
                                <form.AppField name="roomSize">
                                    {(field) => <field.FormInput type="number" label="Room size" placeholder="28" />}
                                </form.AppField>
                                <form.AppField name="roomSizeUnit">
                                    {(field) => (
                                        <field.FormSelect
                                            label="Unit"
                                            placeholder="Select unit"
                                            options={[
                                                { label: 'sqm', value: 'sqm' },
                                                { label: 'sqft', value: 'sqft' },
                                            ]}
                                        />
                                    )}
                                </form.AppField>
                            </div>
                            <form.AppField name="description">
                                {(field) => <field.FormTextarea label="Description" placeholder="Describe the room type for OTA listings..." />}
                            </form.AppField>
                        </Section>
                    </div>
                )}
                {/* ════════ PRICING ════════ */}
                {activeTab === 'Pricing' && (
                    <div className="flex flex-col gap-6">
                        <Section>
                            <SectionLabel>Pricing</SectionLabel>
                            <div className="grid grid-cols-2 gap-3">
                                <form.AppField name="basePrice">
                                    {(field) => (
                                        <div className="flex flex-col gap-1.5">
                                            <Label className="text-[12px] font-medium text-slate-600">
                                                Base price / night
                                            </Label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[13px]">
                                                    {currencySymbol}
                                                </span>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    className="h-9 pl-7 rounded-lg border-slate-200 text-[13px]"
                                                    value={field.state.value}
                                                    onChange={(e) => field.handleChange(parseFloat(e.target.value) || 0)}
                                                    onBlur={field.handleBlur}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </form.AppField>
                                <div className="flex flex-col gap-1.5">
                                    <Label className="text-[12px] font-medium text-slate-600">
                                        Property currency
                                    </Label>
                                    <div className="h-9 px-3 flex items-center rounded-lg border border-slate-200 bg-slate-50 text-[13px] text-slate-600">
                                        {propertyCurrency ?? '—'}
                                        <span className="text-slate-400 ml-1">(inherited from property)</span>
                                    </div>
                                </div>
                            </div>
                        </Section>
                    </div>
                )}
                {/* ════════ CAPACITY & INVENTORY ════════ */}
                {activeTab === 'Capacity & Inventory' && (
                    <div className="flex flex-col gap-6">
                        <Section>
                            <SectionLabel>Guest Capacity</SectionLabel>
                            <div className="grid grid-cols-3 gap-3">
                                <form.AppField name="maxAdults">
                                    {(field) => <field.FormInput type="number" label="Max adults" placeholder="2" />}
                                </form.AppField>
                                <form.AppField name="maxChildren">
                                    {(field) => <field.FormInput type="number" label="Max children" placeholder="0" />}
                                </form.AppField>
                                <form.AppField name="maxOccupancy">
                                    {(field) => <field.FormInput type="number" label="Max occupancy" placeholder="2" />}
                                </form.AppField>
                            </div>
                        </Section>

                        <Section>
                            <SectionLabel>Bed Configuration</SectionLabel>
                            <form.AppField name="beds">
                                {(field) => (
                                    <div className="flex flex-col gap-3">
                                        <div className="grid grid-cols-[1fr_80px_36px] gap-2 px-1">
                                            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wide">Bed type</span>
                                            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wide">Qty</span>
                                            <span />
                                        </div>
                                        {field.state.value.map((_, i) => (
                                            <div key={i} className="grid grid-cols-[1fr_80px_36px] gap-2 items-center">
                                                <form.AppField name={`beds[${i}].bedType`}>
                                                    {(subField) => (
                                                        <Select value={subField.state.value} onValueChange={subField.handleChange}>
                                                            <SelectTrigger className="h-9 rounded-lg border-slate-200 text-[13px] bg-white">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {BED_TYPES.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                </form.AppField>
                                                <form.AppField name={`beds[${i}].quantity`}>
                                                    {(subField) => (
                                                        <Input type="number" min="1" max="10" className="h-9 rounded-lg border-slate-200 text-[13px] text-center" value={subField.state.value} onChange={(e) => subField.handleChange(parseInt(e.target.value) || 1)} onBlur={subField.handleBlur} />
                                                    )}
                                                </form.AppField>
                                                <button
                                                    type="button"
                                                    onClick={() => field.removeValue(i)}
                                                    className="h-9 w-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all"
                                                >
                                                    <Trash2 className="size-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => field.pushValue({ id: newId('bed'), bedType: 'King', quantity: 1 })}
                                            className="flex items-center gap-1.5 text-[12.5px] text-slate-500 hover:text-[#243E8B] border border-dashed border-slate-300 hover:border-[#243E8B]/40 rounded-lg px-3 py-2 w-fit transition-all"
                                        >
                                            <Plus className="size-3.5" />
                                            Add bed type
                                        </button>
                                    </div>
                                )}
                            </form.AppField>
                        </Section>

                        <Section>
                            <SectionLabel>Physical Units</SectionLabel>
                            <form.AppField name="units">
                                {(field) => (
                                    <div className="flex flex-col gap-4">
                                        <div className="flex flex-wrap gap-2 min-h-[36px]">
                                            {field.state.value.map((unit, i) => (
                                                <div key={i} className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-[12.5px] font-semibold text-slate-700">
                                                    <span>{unit.roomNumber}</span>
                                                    <span className="text-slate-400 text-[11px]">· F{unit.floor}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => field.removeValue(i)}
                                                        className="text-slate-400 hover:text-red-500 transition-colors"
                                                    >
                                                        <X className="size-3" />
                                                    </button>
                                                </div>
                                            ))}
                                            {field.state.value.length === 0 && (
                                                <p className="text-[12px] text-slate-400 italic">No units added yet</p>
                                            )}
                                        </div>

                                        <div>
                                            <Label className="text-[12px] font-medium text-slate-600 mb-1.5 block">Add single unit</Label>
                                            <div className="grid grid-cols-[1fr_80px_auto] gap-2 max-w-sm">
                                                <Input
                                                    placeholder="e.g. 104"
                                                    value={unitInput}
                                                    onChange={(e) => setUnitInput(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && unitInput.trim()) {
                                                            e.preventDefault()
                                                            field.pushValue({ id: newId('unit'), roomNumber: unitInput.trim(), floor: unitFloor || '1' })
                                                            setUnitInput('')
                                                        }
                                                    }}
                                                    className="h-9 rounded-lg border-slate-200 text-[13px]"
                                                />
                                                <Input
                                                    placeholder="Floor"
                                                    value={unitFloor}
                                                    onChange={(e) => setUnitFloor(e.target.value)}
                                                    className="h-9 rounded-lg border-slate-200 text-[13px]"
                                                />
                                                <Button
                                                    type="button"
                                                    onClick={() => { if (unitInput.trim()) { field.pushValue({ id: newId('unit'), roomNumber: unitInput.trim(), floor: unitFloor || '1' }); setUnitInput('') } }}
                                                    className="h-9 px-4 bg-[#243E8B] hover:bg-[#1D3270] text-white rounded-lg text-[13px] font-medium"
                                                >
                                                    Add unit
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="border-t border-slate-100 pt-4">
                                            <p className="text-[12px] font-semibold text-slate-600 mb-3">Bulk generate</p>
                                            <div className="grid grid-cols-[1fr_1fr_80px_auto] gap-2 max-w-md items-end">
                                                <div className="flex flex-col gap-1.5">
                                                    <Label className="text-[11px] text-slate-500">Count</Label>
                                                    <Input type="number" min="1" max="200" value={genCount} onChange={(e) => setGenCount(parseInt(e.target.value) || 10)} className="h-9 rounded-lg border-slate-200 text-[13px]" />
                                                </div>
                                                <div className="flex flex-col gap-1.5">
                                                    <Label className="text-[11px] text-slate-500">Start number</Label>
                                                    <Input type="number" value={genStart} onChange={(e) => setGenStart(parseInt(e.target.value) || 201)} className="h-9 rounded-lg border-slate-200 text-[13px]" />
                                                </div>
                                                <div className="flex flex-col gap-1.5">
                                                    <Label className="text-[11px] text-slate-500">Floor</Label>
                                                    <Input value={genFloor} onChange={(e) => setGenFloor(e.target.value)} className="h-9 rounded-lg border-slate-200 text-[13px]" />
                                                </div>
                                                <Button
                                                    type="button"
                                                    onClick={() => {
                                                        const newUnits = Array.from({ length: Math.min(genCount, 200) }, (_, i) => ({
                                                            id: newId('unit'),
                                                            roomNumber: String(genStart + i),
                                                            floor: genFloor || '2',
                                                        }))
                                                        newUnits.forEach(u => field.pushValue(u))
                                                    }}
                                                    className="h-9 px-4 bg-[#243E8B] hover:bg-[#1D3270] text-white rounded-lg text-[13px] font-medium"
                                                >
                                                    Generate
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </form.AppField>
                        </Section>
                    </div>
                )}
                {/* ════════ PRESENTATION ════════ */}
                {activeTab === 'Presentation' && (
                    <div className="flex flex-col gap-6">
                        <Section>
                            <SectionLabel>Room Amenities</SectionLabel>
                            <form.AppField name="amenities">
                                {(field) => (
                                    <div className="flex flex-wrap gap-2">
                                        {ROOM_AMENITIES.map(({ label, icon: Icon }) => {
                                            const isOn = field.state.value.includes(label)
                                            return (
                                                <button
                                                    key={label}
                                                    type="button"
                                                    onClick={() => {
                                                        const cur = field.state.value
                                                        field.handleChange(isOn ? cur.filter(a => a !== label) : [...cur, label])
                                                    }}
                                                    className={cn(
                                                        'flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[12.5px] font-medium transition-all duration-200',
                                                        isOn
                                                            ? 'border-[#243E8B] bg-[#243E8B] text-white shadow-sm shadow-[#243E8B]/20'
                                                            : 'border-slate-200 text-slate-600 bg-white hover:border-slate-300 hover:bg-slate-50'
                                                    )}
                                                >
                                                    {Icon && <Icon className="size-3.5" />}
                                                    {label}
                                                </button>
                                            )
                                        })}
                                    </div>
                                )}
                            </form.AppField>
                        </Section>

                        <Section>
                            <SectionLabel>Room Attributes</SectionLabel>
                            <div className="rounded-2xl border border-slate-100 overflow-hidden divide-y divide-slate-100">
                                {([
                                    { name: 'smokingRoom' as const, label: 'Smoking room', sub: 'Room permits smoking' },
                                    { name: 'accessibleRoom' as const, label: 'Accessible room', sub: 'Wheelchair / mobility accessible' },
                                    { name: 'privateBathroom' as const, label: 'Private bathroom', sub: 'Ensuite or attached bathroom' },
                                    { name: 'sharedBathroom' as const, label: 'Shared bathroom', sub: 'Bathroom shared with other guests' },
                                ] as const).map(attr => (
                                    <form.AppField key={attr.name} name={attr.name}>
                                        {(f) => (
                                            <div className="flex items-center justify-between px-4 py-3.5 bg-white hover:bg-slate-50/70 transition-colors">
                                                <div>
                                                    <p className="text-[13px] font-semibold text-slate-800">{attr.label}</p>
                                                    <p className="text-[11.5px] text-slate-400 mt-0.5">{attr.sub}</p>
                                                </div>
                                                <Switch checked={f.state.value} onCheckedChange={f.handleChange} />
                                            </div>
                                        )}
                                    </form.AppField>
                                ))}
                            </div>
                        </Section>

                        <Section>
                            <SectionLabel>View Type</SectionLabel>
                            <form.AppField name="viewType">
                                {(field) => (
                                    <div className="flex flex-wrap gap-2">
                                        {VIEW_TYPES.map(view => {
                                            const isOn = field.state.value === view
                                            return (
                                                <button
                                                    key={view}
                                                    type="button"
                                                    onClick={() => {
                                                        field.handleChange(isOn ? '' : view)
                                                    }}
                                                    className={cn(
                                                        'flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[12.5px] font-medium transition-all duration-200',
                                                        isOn
                                                            ? 'border-[#243E8B] bg-[#243E8B] text-white shadow-sm shadow-[#243E8B]/20'
                                                            : 'border-slate-200 text-slate-600 bg-white hover:border-slate-300 hover:bg-slate-50'
                                                    )}
                                                >
                                                    {view}
                                                </button>
                                            )
                                        })}
                                    </div>
                                )}
                            </form.AppField>
                        </Section>

                        <Section>
                            <SectionLabel>Room Photos</SectionLabel>
                            <div className="flex flex-col gap-3">
                                <form.AppField name="thumbnail">
                                    {(field) => <field.FormInput label="Thumbnail URL" type="url" placeholder="https://..." />}
                                </form.AppField>
                                <form.AppField name="gallery">
                                    {(field) => (
                                        <div className="flex flex-col gap-1.5">
                                            <Label className="text-[12px] font-medium text-slate-600">Gallery URLs (comma separated)</Label>
                                            <Input type="text" placeholder="https://a..., https://b..." className="h-9 rounded-lg border-slate-200 text-[13px]" value={field.state.value.join(', ')} onChange={(e) => field.handleChange(e.target.value.split(',').map(s => s.trim()).filter(Boolean))} onBlur={field.handleBlur} />
                                        </div>
                                    )}
                                </form.AppField>
                            </div>
                        </Section>
                    </div>
                )}


                <Separator className='mt-5 mb-4' />
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                        {ROOM_TABS.map((tab) => (
                            <button
                                key={tab}
                                type="button"
                                onClick={() => onActiveTabChange(tab)}
                                className={cn(
                                    'size-1.5 rounded-full transition-all duration-200',
                                    activeTab === tab ? 'bg-[#243E8B] w-4' : 'bg-slate-200 hover:bg-slate-300'
                                )}
                            />
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            className="h-9 px-5 rounded-xl font-semibold text-[13px] border-slate-200"
                        >
                            Cancel
                        </Button>
                        <form.AppForm>
                            <form.FormSubmit label={submitLabel} />
                        </form.AppForm>
                    </div>
                </div>
            </form>
        </>
    )
}

// ─── Small visual primitives local to the form (mirror PropertyForm) ──
function Section({ children }: { children: React.ReactNode }) {
    return <div className="flex flex-col gap-3">{children}</div>
}

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex items-center gap-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">{children}</span>
            <div className="flex-1 h-px bg-border" />
        </div>
    )
}
