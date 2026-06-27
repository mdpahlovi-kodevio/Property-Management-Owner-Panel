import { useAppForm, useFieldContext } from '@/components/form/form-context'
import { Button } from '@/components/ui/button'
import { DataTableFooter } from '@/components/ui/data-table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FieldLabel, FieldSeparator } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { SearchInput } from '@/components/ui/search-input'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { useSearchParams } from '@/hooks/use-search-params'
import {
    BathroomTypeOptions,
    BedTypeOptions,
    propertyApi,
    resolveImage,
    roomTypeApi,
    RoomTypeStatusOptions,
    type BathroomType,
    type BedType,
    type CreateRoomTypePayload,
    type RoomType,
    type RoomTypeStatus,
    type UpdateRoomTypePayload,
} from '@/lib/api'
import { capitalize, cn, GetRoomAmenities } from '@/lib/utils'
import { useMutation, useQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Edit, Eye, MapPin, Plus, RotateCw, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import * as z from 'zod'

const searchSchema = z.object({
    page: z.number().default(1),
    limit: z.number().default(12),
    search: z.string().optional(),
})

export const Route = createFileRoute('/__main/property_/$propertySlug')({
    validateSearch: searchSchema,
    component: RouteComponent,
})

// ─── Card shape used by the grid ────────────────────────────────────
type RoomTypeCard = {
    id: string
    propertyId: string
    title: string
    location: string
    details: string
    basePrice: number
    totalUnits: number
    capacity: string
    status: RoomTypeStatus
    imageUrl: string
    units: string[]
    viewType: string
    bedsCount: number
    bathroomType: BathroomType
    maxGuests: number
    roomSizeLabel: string
}

const ROOM_TABS = ['Details', 'Capacity', 'Policies', 'Photos'] as const
type RoomTab = (typeof ROOM_TABS)[number]

// ─── Zod schema mirroring the create/update payload ─────────────────
const roomTypeFormSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(128),
    internalCode: z.string().max(64),
    description: z.string().max(5000),
    maxAdults: z.number().int().min(1).max(50),
    maxChildren: z.number().int().min(0).max(50),
    maxOccupancy: z.number().int().min(1).max(100),
    basePrice: z.number().min(0),
    roomSize: z.number().min(0),
    smokingRoom: z.boolean(),
    accessibleRoom: z.boolean(),
    bathroomType: z.enum(BathroomTypeOptions),
    viewType: z.string().max(64),
    status: z.enum(RoomTypeStatusOptions),
    beds: z.array(z.object({ bedType: z.enum(BedTypeOptions), quantity: z.number().int().min(1).max(20) })),
    units: z.array(
        z.object({
            roomNumber: z.string().min(1, 'Room number is required').max(64),
            floor: z.string().max(64),
        }),
    ),
    amenities: z.array(z.string()),
    images: z.array(
        z.object({
            url: z.string(),
            thumbnail: z.boolean(),
            sortOrder: z.number(),
        }),
    ),
})

type RoomTypeFormValues = z.infer<typeof roomTypeFormSchema>

// ─── Room units helpers ─────────────────────────────────────────────
/** Shape of a single unit in the form's `units` array. */
type RoomUnitValue = { roomNumber: string; floor: string }

/**
 * Guess the floor from a room number's leading digit(s) — the common hotel
 * convention is that room 201–210 are on floor 2, 301–310 on floor 3, etc.
 * Returns '' for non-numeric room numbers (e.g. "Basement-A").
 */
function deriveFloor(roomNumber: string): string {
    const match = roomNumber.trim().match(/^(\d+)/)
    return match ? match[1].charAt(0) : ''
}

const ROOM_FORM_DEFAULTS: RoomTypeFormValues = {
    name: '',
    internalCode: '',
    description: '',
    maxAdults: 2,
    maxChildren: 0,
    maxOccupancy: 2,
    basePrice: 100,
    roomSize: 28,
    smokingRoom: false,
    accessibleRoom: false,
    bathroomType: 'PRIVATE',
    viewType: '',
    status: 'DRAFT',
    beds: [{ bedType: 'KING', quantity: 1 }],
    units: [],
    amenities: [],
    images: [],
}

// ─── API value → form value ─────────────────────────────────────────
function valuesFromRoomType(rt: RoomType): RoomTypeFormValues {
    return {
        name: rt.name,
        internalCode: rt.internalCode,
        description: rt.description ?? '',
        maxAdults: rt.maxAdults,
        maxChildren: rt.maxChildren,
        maxOccupancy: rt.maxOccupancy,
        basePrice: Number(rt.basePrice),
        roomSize: rt.roomSize ?? 0,
        smokingRoom: rt.smokingRoom,
        accessibleRoom: rt.accessibleRoom,
        bathroomType: rt.bathroomType,
        viewType: rt.viewType ?? '',
        status: rt.status,
        beds: rt.beds.map((b) => ({ bedType: b.bedType, quantity: b.quantity })),
        units: rt.units.map((u) => ({ roomNumber: u.roomNumber, floor: u.floor ?? '' })),
        amenities: rt.amenities.map((a) => a.amenity.id),
        images: rt.images.map((img) => ({
            url: img.url,
            thumbnail: img.thumbnail,
            sortOrder: img.sortOrder,
        })),
    }
}

// ─── Component ───────────────────────────────────────────────────────
function RouteComponent() {
    const navigate = useNavigate()
    const query = Route.useSearch()
    const mergeSearch = useSearchParams()
    const { propertySlug } = Route.useParams()

    // ── Resolve slug → property via the dedicated slug endpoint. ──
    const { data: propertyData, isLoading: isLoadingProperty } = useQuery({
        queryKey: ['property-by-slug', propertySlug],
        queryFn: async () => {
            const res = await propertyApi.getBySlug(propertySlug)
            return res.data
        },
    })
    const propertyId = propertyData?.id
    const propertySlugResolved = propertyData?.slug ?? propertySlug
    const propertyName = propertyData?.name

    const [isAddOpen, setIsAddOpen] = useState(false)
    const [activeTab, setActiveTab] = useState<RoomTab>('Details')
    const [editingRoom, setEditingRoom] = useState<RoomType | null>(null)

    // ── Room-type list query ──
    const { data, isLoading, refetch } = useQuery({
        queryKey: ['room-types', propertyId, query],
        queryFn: () => roomTypeApi.list(propertyId as string, query),
        enabled: !!propertyId,
    })

    // ── Mutations ──
    const createMutation = useMutation({
        mutationFn: (payload: CreateRoomTypePayload) => roomTypeApi.create(propertyId as string, payload),
        onSuccess: () => {
            refetch()
            toast.success('Room type created successfully!')
            closeDialog()
        },
        onError: (error) => toast.error(error.message),
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdateRoomTypePayload }) =>
            roomTypeApi.update(propertyId as string, id, payload),
        onSuccess: () => {
            refetch()
            toast.success('Room type updated successfully!')
            closeDialog()
        },
        onError: (error) => toast.error(error.message),
    })

    const openAdd = () => {
        setEditingRoom(null)
        setActiveTab('Details')
        setIsAddOpen(true)
    }

    const openEdit = (room: RoomType) => {
        setEditingRoom(room)
        setActiveTab('Details')
        setIsAddOpen(true)
    }

    const closeDialog = () => {
        setIsAddOpen(false)
        setEditingRoom(null)
    }

    const formDefaults: RoomTypeFormValues = editingRoom ? valuesFromRoomType(editingRoom) : ROOM_FORM_DEFAULTS

    const handleSave = async (values: RoomTypeFormValues) => {
        // Strip empty optional strings so the backend treats them as omitted.
        const payload: CreateRoomTypePayload = {
            ...values,
            internalCode: values.internalCode.trim() || undefined,
            viewType: values.viewType.trim() || undefined,
        }

        if (editingRoom) {
            await updateMutation.mutateAsync({ id: editingRoom.id, payload })
        } else {
            await createMutation.mutateAsync(payload)
        }
    }

    const isSaving = createMutation.isPending || updateMutation.isPending
    const pageTitle = propertyName
        ? `Room Types — ${propertyName}`
        : `Room Types — ${propertySlug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}`

    return (
        <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <Button variant="secondary" size="sm" className="w-fit" onClick={() => navigate({ to: '/property' })}>
                        <ArrowLeft className="mr-2 w-4" />
                        Back to Properties
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{pageTitle}</h1>
                        <p className="text-muted-foreground text-sm mt-1">Manage room types for this property</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <SearchInput value={query.search ?? ''} placeholder="Search rooms..." className="w-full sm:w-80" />
                    <Button onClick={openAdd} disabled={!propertyId}>
                        <Plus className="size-4" />
                        Add Room Type
                    </Button>
                </div>
            </div>

            {/* ── Grid + pagination ── */}
            {isLoadingProperty || isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4.5">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <RoomTypeCardSkeleton key={i} />
                    ))}
                </div>
            ) : !propertyId ? (
                <div className="rounded-lg border border-dashed p-10 text-center text-muted-foreground mt-6">
                    {`Property "${propertySlug}" not found.`}
                </div>
            ) : (data?.data ?? []).length === 0 ? (
                <div className="rounded-lg border border-dashed p-10 text-center text-muted-foreground mt-6">
                    No room types yet. Click “Add Room Type” to create one.
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4.5">
                        {(data?.data ?? []).map((item) => (
                            <RoomTypeCardItem
                                key={item.id}
                                propertyId={propertyId}
                                propertySlug={propertySlugResolved}
                                item={item}
                                onEdit={openEdit}
                            />
                        ))}
                    </div>

                    <DataTableFooter
                        page={query.page}
                        limit={query.limit}
                        total={data?.meta.total ?? 0}
                        onPageChange={(page) => mergeSearch({ page })}
                        onLimitChange={(limit) => mergeSearch({ page: 1, limit })}
                        limitOptions={[12, 24]}
                        noun="rooms"
                    />
                </>
            )}

            {/* ══════════════════════════════════════════════════
                CREATE / EDIT ROOM TYPE DIALOG
            ══════════════════════════════════════════════════ */}
            <Dialog
                open={isAddOpen}
                onOpenChange={(open) => {
                    if (!open) closeDialog()
                }}
            >
                <DialogContent className="sm:max-w-160">
                    <DialogHeader>
                        <DialogTitle>{editingRoom ? 'Edit room type' : 'Create room type'}</DialogTitle>
                        <DialogDescription>
                            {editingRoom ? `Editing "${editingRoom?.name ?? ''}"` : 'Add a new room type to this property'}
                        </DialogDescription>
                    </DialogHeader>

                    <RoomTypeForm
                        key={editingRoom?.id ?? 'add'}
                        defaultValues={formDefaults}
                        activeTab={activeTab}
                        onActiveTabChange={setActiveTab}
                        onSubmit={handleSave}
                        onCancel={closeDialog}
                        submitLabel={isSaving ? 'Saving...' : editingRoom ? 'Save changes' : 'Save room type'}
                    />
                </DialogContent>
            </Dialog>
        </>
    )
}

// ─── Room-type card (rich render needs the full room type from GET /:id) ──
function RoomTypeCardItem({
    propertyId,
    propertySlug,
    item,
    onEdit,
}: {
    propertyId: string
    propertySlug: string
    item: import('@/lib/api/room-type').RoomTypeListItem
    onEdit: (room: RoomType) => void
}) {
    const { data, isLoading } = useQuery({
        queryKey: ['room-type', propertyId, item.id],
        queryFn: () => roomTypeApi.get(propertyId, item.id),
    })

    if (isLoading || !data) return <RoomTypeCardSkeleton />

    return <RoomTypeCardView room={data.data} propertySlug={propertySlug} onEdit={onEdit} />
}

function RoomTypeCardView({ room, propertySlug, onEdit }: { room: RoomType; propertySlug: string; onEdit: (room: RoomType) => void }) {
    const navigate = useNavigate()

    const card = mapRoomTypeToCard(room)

    return (
        <div
            className="group cursor-pointer h-full flex flex-col bg-card rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06),0_6px_16px_rgba(0,0,0,0.06)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.1),0_12px_28px_rgba(0,0,0,0.08)] border border-border transition-all duration-300 ease-out hover:-translate-y-1 overflow-hidden"
            onClick={() =>
                navigate({
                    to: '/property/$propertySlug/room/$roomSlug',
                    params: { propertySlug, roomSlug: slugifyRoom(card.title) },
                })
            }
        >
            {/* Image */}
            <div className="relative w-full overflow-hidden bg-muted shrink-0" style={{ paddingTop: '66%' }}>
                <img
                    src={card.imageUrl}
                    alt={card.title}
                    crossOrigin="anonymous"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
                />

                {/* View type badge (top-left, Guest-Panel style) */}
                {card.viewType && (
                    <span className="absolute top-3 left-3 bg-primary text-primary-foreground px-3 py-1 rounded-full text-[0.7rem] font-bold uppercase tracking-wide shadow-sm">
                        {card.viewType}
                    </span>
                )}

                {/* Status badge (top-right) — reflects the real RoomTypeStatus. */}
                <div className="absolute top-3 right-3">
                    <span
                        className={cn(
                            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md',
                            ROOM_STATUS_BADGE[card.status],
                        )}
                    >
                        <span className="relative inline-flex rounded-full size-1.5 bg-white" />
                        {card.status}
                    </span>
                </div>
            </div>

            {/* Body */}
            <div className="p-4 flex flex-col gap-2 grow bg-card">
                {/* Title row with viewType chip (mirrors property card rating) */}
                <div className="flex justify-between items-center gap-3">
                    <h3 className="text-[1.05rem] font-semibold text-foreground leading-snug line-clamp-1 m-0 group-hover:text-primary transition-colors duration-300">
                        {card.title}
                    </h3>
                    {card.viewType && (
                        <span className="inline-flex items-center gap-1 text-[0.7rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent text-foreground whitespace-nowrap shrink-0">
                            {card.viewType}
                        </span>
                    )}
                </div>

                {/* Subtitle: floor / beds chip */}
                <div className="flex justify-between items-center gap-2 text-muted-foreground text-[0.875rem]">
                    <span className="inline-flex items-center gap-1">
                        <MapPin className="size-3.5" />
                        {card.location}
                    </span>
                    {card.bedsCount > 0 && (
                        <span className="text-[0.75rem] font-medium px-2 py-0.5 rounded-full border border-border text-muted-foreground">
                            🛏 {card.bedsCount} bed{card.bedsCount === 1 ? '' : 's'}
                        </span>
                    )}
                </div>

                {/* Meta: guests / baths / size (border-t) */}
                <div className="flex justify-between items-center gap-2 flex-wrap border-t border-border pt-2 text-[0.875rem] text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                        👥 {card.maxGuests} Guest{card.maxGuests === 1 ? '' : 's'}
                    </span>
                    <span className="inline-flex items-center gap-1">🚿 {card.bathroomType === 'PRIVATE' ? 'Private' : 'Shared'}</span>
                    <span className="inline-flex items-center gap-1">📐 {card.roomSizeLabel}</span>
                </div>

                {/* Admin info chips (border-y py-2 — matches property card style) */}
                <div className="flex justify-between items-center gap-1.5 flex-wrap border-y border-border py-2">
                    <span className="inline-flex items-center gap-1 text-xs uppercase tracking-wider px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                        {card.totalUnits} unit{card.totalUnits === 1 ? '' : 's'}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs uppercase tracking-wider px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                        {card.units.length > 0 ? `${card.units.length} room#` : 'No rooms'}
                    </span>
                </div>

                <div className="flex justify-between items-center gap-1.5 flex-wrap">
                    <span className="text-[0.7rem] text-muted-foreground">{card.capacity}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <Button
                        onClick={(e) => {
                            e.stopPropagation()
                            onEdit(room)
                        }}
                        variant="outline"
                    >
                        <Edit className="size-3.5" />
                        Edit
                    </Button>
                    <Button
                        variant="default"
                        onClick={(e) => {
                            e.stopPropagation()
                            navigate({
                                to: '/property/$propertySlug/room/$roomSlug',
                                params: { propertySlug, roomSlug: slugifyRoom(card.title) },
                            })
                        }}
                    >
                        <Eye className="size-3.5" />
                        View
                    </Button>
                </div>
            </div>
        </div>
    )
}

// ─── Status badge styling per RoomTypeStatus ───────────────────────
const ROOM_STATUS_BADGE: Record<RoomTypeStatus, string> = {
    ACTIVE: 'bg-emerald-500/90 text-white border-white/20',
    DRAFT: 'bg-amber-500/90 text-white border-white/20',
    INACTIVE: 'bg-slate-500/90 text-white border-white/20',
    ARCHIVED: 'bg-rose-500/90 text-white border-white/20',
}

// ─── API → card mapping ─────────────────────────────────────────────
function mapRoomTypeToCard(rt: RoomType): RoomTypeCard {
    const bedsCount = rt.beds.reduce((s, b) => s + b.quantity, 0)
    const floorLabel = rt.units.length > 0 ? Array.from(new Set(rt.units.map((u) => u.floor).filter(Boolean))).join(', ') : '—'
    const cover = rt.images.find((i) => i.thumbnail) ?? rt.images[0]
    const roomSizeLabel = rt.roomSize != null ? `${rt.roomSize} sqm` : '—'

    return {
        id: rt.id,
        propertyId: rt.propertyId,
        title: rt.name,
        location: `Floor ${floorLabel}`,
        details: `${bedsCount} Bed${bedsCount === 1 ? '' : 's'} • ${roomSizeLabel}`,
        basePrice: Number(rt.basePrice),
        totalUnits: rt.units.length,
        capacity: `${rt.maxAdults} Adult${rt.maxAdults === 1 ? '' : 's'}${rt.maxChildren > 0 ? `, ${rt.maxChildren} Child${rt.maxChildren === 1 ? '' : 'ren'}` : ''}`,
        status: rt.status,
        imageUrl: resolveImage(cover?.url),
        units: rt.units.map((u) => u.roomNumber),
        viewType: rt.viewType ?? '',
        bedsCount,
        bathroomType: rt.bathroomType,
        maxGuests: rt.maxOccupancy,
        roomSizeLabel,
    }
}

function slugifyRoom(text: string): string {
    return text
        .toString()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '')
}

function RoomTypeCardSkeleton() {
    return (
        <div className="h-full flex flex-col bg-card rounded-xl border border-border overflow-hidden">
            <div className="w-full bg-muted shrink-0 animate-pulse" style={{ paddingTop: '66%' }} />
            <div className="p-4 flex flex-col gap-3 grow">
                <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
                <div className="h-3 w-1/2 rounded bg-muted animate-pulse" />
                <div className="h-3 w-full rounded bg-muted animate-pulse" />
                <div className="grid grid-cols-2 gap-2 mt-auto">
                    <div className="h-8 rounded bg-muted animate-pulse" />
                    <div className="h-8 rounded bg-muted animate-pulse" />
                </div>
            </div>
        </div>
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
}: {
    defaultValues: RoomTypeFormValues
    activeTab: RoomTab
    onActiveTabChange: (tab: RoomTab) => void
    onSubmit: (values: RoomTypeFormValues) => Promise<void>
    onCancel: () => void
    submitLabel: string
}) {
    const amenities = GetRoomAmenities()

    const form = useAppForm({
        defaultValues,
        validators: { onChange: roomTypeFormSchema },
        onSubmit: async ({ value }) => await onSubmit(value),
    })

    return (
        <>
            <div className="flex border-b bg-muted overflow-x-auto shrink-0">
                {ROOM_TABS.map((tab) => (
                    <button
                        key={tab}
                        type="button"
                        onClick={() => onActiveTabChange(tab)}
                        className={cn(
                            'flex-1 min-w-18 px-3 py-2 text-sm font-semibold whitespace-nowrap border-b-2 transition-all duration-200',
                            activeTab === tab ? 'border-primary text-primary' : 'border-transparent',
                        )}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <form
                onSubmit={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    form.handleSubmit()
                }}
                className="flex flex-col flex-1 min-h-0"
            >
                {/* ════════ DETAILS ════════ */}
                {activeTab === 'Details' && (
                    <div className="flex flex-col gap-6">
                        <Section>
                            <SectionLabel>Identity</SectionLabel>
                            <form.AppField name="name">
                                {(field) => <field.FormInput label="Room type name" placeholder="e.g. Deluxe King Room" />}
                            </form.AppField>
                            <div className="grid grid-cols-2 gap-3">
                                <form.AppField name="internalCode">
                                    {(field) => (
                                        <field.FormInput
                                            label="Internal code"
                                            placeholder="e.g. DLX-KNG-01"
                                            hint="Leave blank to auto-generate from the name."
                                        />
                                    )}
                                </form.AppField>
                                <form.AppField name="roomSize">
                                    {(field) => <field.FormInputNumber label="Room size (sqm)" placeholder="28" min={0} step="any" />}
                                </form.AppField>
                            </div>
                            <form.AppField name="description">
                                {(field) => (
                                    <field.FormTextarea label="Description" placeholder="Describe the room type for OTA listings..." />
                                )}
                            </form.AppField>
                        </Section>

                        <Section>
                            <SectionLabel>Pricing</SectionLabel>
                            <form.AppField name="basePrice">
                                {(field) => <field.FormInputNumber label="Base price / night" placeholder="e.g. 100" min={0} step="0.01" />}
                            </form.AppField>
                        </Section>

                        <Section>
                            <SectionLabel>Lifecycle</SectionLabel>
                            <form.AppField name="status">
                                {(field) => (
                                    <field.FormSelect
                                        label="Status"
                                        options={RoomTypeStatusOptions.map((value) => ({
                                            value,
                                            label: capitalize(value),
                                        }))}
                                    />
                                )}
                            </form.AppField>
                        </Section>
                    </div>
                )}

                {/* ════════ CAPACITY ════════ */}
                {activeTab === 'Capacity' && (
                    <div className="flex flex-col gap-6">
                        <Section>
                            <SectionLabel>Guest Capacity</SectionLabel>
                            <div className="grid grid-cols-3 gap-3">
                                <form.AppField name="maxAdults">
                                    {(field) => <field.FormInputNumber label="Max adults" placeholder="2" min={1} max={50} />}
                                </form.AppField>
                                <form.AppField name="maxChildren">
                                    {(field) => <field.FormInputNumber label="Max children" placeholder="0" min={0} max={50} />}
                                </form.AppField>
                                <form.AppField name="maxOccupancy">
                                    {(field) => <field.FormInputNumber label="Max occupancy" placeholder="2" min={1} max={100} />}
                                </form.AppField>
                            </div>
                        </Section>

                        <Section>
                            <SectionLabel>Bed Configuration</SectionLabel>
                            <form.AppField name="beds">
                                {(field) => (
                                    <div className="flex flex-col gap-3">
                                        {field.state.value.map((_, i) => (
                                            <div key={i} className="grid grid-cols-3 gap-3">
                                                <div className="col-span-2">
                                                    <form.AppField name={`beds[${i}].bedType`}>
                                                        {(field) => (
                                                            <field.FormSelect
                                                                label="Bed type"
                                                                placeholder="Select bed type"
                                                                options={BedTypeOptions.map((value) => ({
                                                                    value,
                                                                    label: capitalize(value),
                                                                }))}
                                                            />
                                                        )}
                                                    </form.AppField>
                                                </div>
                                                <div className="flex items-end gap-3">
                                                    <form.AppField name={`beds[${i}].quantity`}>
                                                        {(field) => (
                                                            <field.FormInputNumber
                                                                label="Quantity"
                                                                placeholder="Quantity"
                                                                min={1}
                                                                max={20}
                                                            />
                                                        )}
                                                    </form.AppField>
                                                    <Button
                                                        type="button"
                                                        size="icon"
                                                        variant="destructive"
                                                        onClick={() => field.removeValue(i)}
                                                    >
                                                        <Trash2 />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            onClick={() => field.pushValue({ bedType: 'KING' as BedType, quantity: 1 })}
                                            className="self-start"
                                        >
                                            <Plus className="size-3.5" />
                                            Add bed type
                                        </Button>
                                    </div>
                                )}
                            </form.AppField>
                        </Section>

                        <Section>
                            <SectionLabel>Room Units</SectionLabel>
                            <form.AppField name="units">{() => <RoomUnitsEditor />}</form.AppField>
                        </Section>
                    </div>
                )}

                {/* ════════ POLICIES ════════ */}
                {activeTab === 'Policies' && (
                    <div className="flex flex-col gap-6">
                        <Section>
                            <SectionLabel>Room Amenities</SectionLabel>
                            <form.AppField name="amenities">
                                {(field) => (
                                    <field.FormTags
                                        label=""
                                        options={amenities.map((amenity) => ({
                                            value: amenity.id,
                                            label: amenity.name,
                                            icon: amenity.icon ?? undefined,
                                        }))}
                                    />
                                )}
                            </form.AppField>
                        </Section>

                        <Section>
                            <SectionLabel>Room Policies</SectionLabel>
                            <div className="rounded-lg border overflow-hidden divide-y">
                                {(
                                    [
                                        { name: 'smokingRoom' as const, label: 'Smoking room', sub: 'Room permits smoking' },
                                        {
                                            name: 'accessibleRoom' as const,
                                            label: 'Accessible room',
                                            sub: 'Wheelchair / mobility accessible',
                                        },
                                    ] as const
                                ).map((policy) => (
                                    <form.AppField key={policy.name} name={policy.name}>
                                        {(f) => (
                                            <div className="flex items-center justify-between px-3 py-2">
                                                <div>
                                                    <p className="text-sm font-semibold text-foreground">{policy.label}</p>
                                                    <p className="text-xs text-muted-foreground mt-0.5">{policy.sub}</p>
                                                </div>
                                                <Switch checked={f.state.value} onCheckedChange={f.handleChange} />
                                            </div>
                                        )}
                                    </form.AppField>
                                ))}
                            </div>
                        </Section>

                        <Section>
                            <SectionLabel>Bathroom</SectionLabel>
                            <form.AppField name="bathroomType">
                                {(field) => (
                                    <field.FormSelect
                                        label="Bathroom type"
                                        options={BathroomTypeOptions.map((value) => ({
                                            value,
                                            label: capitalize(value),
                                        }))}
                                    />
                                )}
                            </form.AppField>
                        </Section>
                    </div>
                )}

                {/* ════════ PHOTOS ════════ */}
                {activeTab === 'Photos' && (
                    <div className="flex flex-col gap-6">
                        <Section>
                            <SectionLabel>View Type</SectionLabel>
                            <form.AppField name="viewType">
                                {(field) => <field.FormInput label="View type" placeholder="e.g. Ocean view" />}
                            </form.AppField>
                        </Section>

                        <Section>
                            <SectionLabel>Room Photos</SectionLabel>
                            <form.AppField name="images">{(field) => <field.FormGallery folder="properties" />}</form.AppField>
                        </Section>
                    </div>
                )}

                <Separator className="mt-5 mb-4" />
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                        {ROOM_TABS.map((tab) => (
                            <button
                                key={tab}
                                type="button"
                                onClick={() => onActiveTabChange(tab)}
                                className={cn(
                                    'size-1.5 rounded-full transition-all duration-200',
                                    activeTab === tab ? 'bg-primary w-4' : 'bg-slate-200 hover:bg-slate-300',
                                )}
                            />
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button type="button" variant="outline" onClick={onCancel}>
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

function RoomUnitsEditor() {
    const field = useFieldContext<RoomUnitValue[]>()
    const units = field.state.value

    // ── Local UI state for the three input modes ──
    const [singleRoom, setSingleRoom] = useState('')
    const [singleFloor, setSingleFloor] = useState('')
    const [floorTouched, setFloorTouched] = useState(false)

    const [genCount, setGenCount] = useState(10)
    const [genStart, setGenStart] = useState(201)
    const [genFloor, setGenFloor] = useState('')

    // ── Helpers operating on the field value ──
    const addUnique = (incoming: RoomUnitValue[]) => {
        const existing = new Set(units.map((u) => u.roomNumber))
        const fresh = incoming.filter((u) => !existing.has(u.roomNumber))
        if (fresh.length === 0) return
        const merged = [...units, ...fresh].sort(sortByRoomNumber)
        field.handleChange(merged)
    }

    const removeAt = (i: number) => field.removeValue(i)

    const clearAll = () => field.handleChange([])

    // ── Single add ──
    const commitSingle = () => {
        const rn = singleRoom.trim()
        if (!rn) return
        addUnique([{ roomNumber: rn, floor: singleFloor.trim() }])
        setSingleRoom('')
        setSingleFloor('')
        setFloorTouched(false)
    }

    // ── Bulk generate ──
    const commitGenerate = () => {
        const count = Math.min(Math.max(genCount, 1), 200)
        const generated: RoomUnitValue[] = Array.from({ length: count }, (_, i) => ({
            roomNumber: String(genStart + i),
            floor: genFloor.trim() || deriveFloor(String(genStart + i)),
        }))
        addUnique(generated)
    }

    const genPreviewEnd = genStart + Math.min(Math.max(genCount, 1), 200) - 1

    return (
        <div className="flex flex-col gap-4">
            {/* ═══ Existing units as chips ═══ */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <p className="text-sm leading-none font-medium select-none">
                        {units.length > 0 ? `${units.length} unit${units.length === 1 ? '' : 's'}` : 'Units'}
                    </p>
                    {units.length > 0 && (
                        <button
                            type="button"
                            onClick={clearAll}
                            className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                        >
                            Clear all
                        </button>
                    )}
                </div>
                <div className="flex flex-wrap gap-2 min-h-9">
                    {units.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic self-center">No units added yet</p>
                    ) : (
                        units.map((unit, i) => (
                            <span
                                key={`${unit.roomNumber}-${i}`}
                                className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1 bg-muted border rounded-full text-xs font-semibold"
                            >
                                <span>{unit.roomNumber}</span>
                                {unit.floor && <span className="text-muted-foreground font-normal">· F{unit.floor}</span>}
                                <button
                                    type="button"
                                    onClick={() => removeAt(i)}
                                    aria-label={`Remove unit ${unit.roomNumber}`}
                                    className="text-muted-foreground hover:text-destructive transition-colors rounded-full p-0.5 hover:bg-background"
                                >
                                    <X className="size-3" />
                                </button>
                            </span>
                        ))
                    )}
                </div>
            </div>

            {/* ═══ Single add ═══ */}
            <div>
                <FieldLabel>Add a unit</FieldLabel>
                <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                        <Input
                            placeholder="e.g. 104"
                            value={singleRoom}
                            onChange={(e) => {
                                setSingleRoom(e.target.value)
                                if (!floorTouched) setSingleFloor(deriveFloor(e.target.value))
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault()
                                    commitSingle()
                                }
                            }}
                        />
                    </div>
                    <div className="flex items-end gap-3">
                        <Input
                            placeholder="Floor"
                            value={singleFloor}
                            onChange={(e) => {
                                setSingleFloor(e.target.value)
                                setFloorTouched(true)
                            }}
                        />
                        <Button type="button" size="icon" variant="secondary" onClick={commitSingle} disabled={!singleRoom.trim()}>
                            <Plus />
                        </Button>
                    </div>
                </div>
            </div>

            <FieldSeparator>OR</FieldSeparator>

            {/* ═══ Bulk generate ═══ */}
            <div>
                <FieldLabel>Generate a range</FieldLabel>
                <div className="grid grid-cols-3 gap-3">
                    <Input type="number" min={1} max={200} value={genCount} onChange={(e) => setGenCount(Number(e.target.value) || 1)} />
                    <Input type="number" value={genStart} onChange={(e) => setGenStart(Number(e.target.value) || 1)} />
                    <div className="flex items-end gap-3">
                        <Input placeholder="Floor" value={genFloor} onChange={(e) => setGenFloor(e.target.value)} />
                        <Button type="button" size="icon" variant="secondary" onClick={commitGenerate}>
                            <RotateCw />
                        </Button>
                    </div>
                </div>
                <p className="pt-1 text-xs text-muted-foreground">
                    Will create {genStart}–{genPreviewEnd} on floor {genFloor.trim() || deriveFloor(String(genStart)) || '—'}
                </p>
            </div>
        </div>
    )
}

/** Sort units by room number — numeric-prefix-first, then alphabetic. */
function sortByRoomNumber(a: RoomUnitValue, b: RoomUnitValue): number {
    const an = parseInt(a.roomNumber, 10)
    const bn = parseInt(b.roomNumber, 10)
    const aNum = Number.isNaN(an) ? Infinity : an
    const bNum = Number.isNaN(bn) ? Infinity : bn
    if (aNum !== bNum) return aNum - bNum
    return a.roomNumber.localeCompare(b.roomNumber)
}
