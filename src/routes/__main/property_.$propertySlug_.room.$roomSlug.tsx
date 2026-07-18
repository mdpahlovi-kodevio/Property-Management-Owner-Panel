import { useAppForm } from '@/components/form/form-context'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'
import {
    propertyApi,
    ratePlanApi,
    RatePlanStatusOptions,
    resolveImage,
    roomTypeApi,
    type CreateRatePlanPayload,
    type FillDailyRatePlanPayload,
    type RatePlan,
    type RatePlanListItem,
    type RatePlanStatus,
    type RoomType,
    type RoomTypeStatus,
    type UpdateRatePlanPayload,
} from '@/lib/api'
import { formatPrice } from '@/lib/properties'
import { capitalize, cn } from '@/lib/utils'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, Link, notFound, useNavigate } from '@tanstack/react-router'
import {
    ArrowLeft,
    Bath,
    BedDouble,
    Calendar,
    CheckCircle2,
    CreditCard,
    Edit,
    Key,
    Maximize2,
    Plus,
    Shield,
    Tag,
    Trash2,
    Users,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import * as z from 'zod'

export const Route = createFileRoute('/__main/property_/$propertySlug_/room/$roomSlug')({
    loader: async ({ params }) => {
        const propertySlug = (params as any).propertySlug_ || (params as any).propertySlug
        const roomSlug = params.roomSlug

        try {
            const propertyRes = await propertyApi.getBySlug(propertySlug)
            const property = propertyRes.data
            if (!property) throw notFound()

            const roomTypeRes = await roomTypeApi.getBySlug(property.id, roomSlug)
            const roomType = roomTypeRes.data
            if (!roomType) throw notFound()

            return { property, roomType }
        } catch {
            throw notFound()
        }
    },
    notFoundComponent: () => (
        <div className="mx-auto max-w-xl px-4 py-24 text-center">
            <div className="mb-6 flex justify-center">
                <div className="flex size-16 items-center justify-center rounded-lg bg-muted">
                    <BedDouble className="size-8 text-muted-foreground" />
                </div>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Room type not found</h1>
            <p className="mt-3 text-muted-foreground">The room type you're looking for doesn't exist or has been removed.</p>
            <Link
                to="/property"
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary transition-colors"
            >
                Browse all properties
            </Link>
        </div>
    ),
    pendingComponent: () => (
        <div className="flex justify-center py-24">
            <Spinner className="size-6" />
        </div>
    ),
    component: RoomAdminDashboardComponent,
})

function RoomAdminDashboardComponent() {
    const { property, roomType } = Route.useLoaderData()
    return <RoomTypeAdminDetails property={property} roomType={roomType} />
}

// Status badge styling per RoomTypeStatus
const ROOM_STATUS_BADGE: Record<RoomTypeStatus, string> = {
    ACTIVE: 'bg-emerald-500 hover:bg-emerald-600',
    DRAFT: 'bg-amber-500 hover:bg-amber-600',
    INACTIVE: 'bg-slate-500 hover:bg-slate-600',
    ARCHIVED: 'bg-rose-500 hover:bg-rose-600',
}

// Status badge styling per RatePlanStatus
const RATE_PLAN_STATUS_BADGE: Record<RatePlanStatus, string> = {
    ACTIVE: 'bg-emerald-500/90 text-white border-white/20',
    DRAFT: 'bg-amber-500/90 text-white border-white/20',
    INACTIVE: 'bg-slate-500/90 text-white border-white/20',
    ARCHIVED: 'bg-rose-500/90 text-white border-white/20',
}

function RoomTypeAdminDetails({ property, roomType: rt }: { property: any; roomType: RoomType }) {
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    // Images come back as a flat array with a `thumbnail` flag.
    const sortedImages = [...rt.images].sort((a, b) => a.sortOrder - b.sortOrder)
    const allImages = sortedImages.map((i) => resolveImage(i.url))
    const thumbnailIndex = Math.max(
        0,
        sortedImages.findIndex((i) => i.thumbnail),
    )
    const [activeImage, setActiveImage] = useState(thumbnailIndex)

    const bedsCount = rt.beds.reduce((s, b) => s + b.quantity, 0)
    const floors = rt.units.length > 0 ? Array.from(new Set(rt.units.map((u) => u.floor).filter(Boolean))).join(', ') : '—'
    const roomSizeLabel = rt.roomSize != null ? `${rt.roomSize} sqm` : '—'

    const startingPrice = (() => {
        const raw = rt.ratePlans?.[0]?.defaultPrice ?? null
        if (raw == null) return 0
        const num = typeof raw === 'string' ? Number(raw) : raw
        return Number.isFinite(num) ? num : 0
    })()

    // ── Rate plan queries + mutations ────────────────────────────────
    const ratePlansQuery = useQuery({
        queryKey: ['rate-plans', { roomTypeId: rt.id }],
        queryFn: () => ratePlanApi.list({ roomTypeId: rt.id, limit: 100 }),
    })

    const createRatePlan = useMutation({
        mutationFn: (payload: CreateRatePlanPayload) => ratePlanApi.create(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rate-plans', { roomTypeId: rt.id }] })
            // Also invalidate the room type so the new plan shows in the loader data.
            queryClient.invalidateQueries({ queryKey: ['room-type', rt.propertyId, rt.internalCode] })
            queryClient.invalidateQueries({ queryKey: ['room-types', rt.propertyId] })
            toast.success('Rate plan created')
        },
        onError: (error: Error) => toast.error(error.message),
    })

    const updateRatePlan = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdateRatePlanPayload }) => ratePlanApi.update(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rate-plans', { roomTypeId: rt.id }] })
            queryClient.invalidateQueries({ queryKey: ['room-type', rt.propertyId, rt.internalCode] })
            toast.success('Rate plan updated')
        },
        onError: (error: Error) => toast.error(error.message),
    })

    const deleteRatePlan = useMutation({
        mutationFn: (id: string) => ratePlanApi.remove(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rate-plans', { roomTypeId: rt.id }] })
            queryClient.invalidateQueries({ queryKey: ['room-type', rt.propertyId, rt.internalCode] })
            toast.success('Rate plan removed')
        },
        onError: (error: Error) => toast.error(error.message),
    })

    const fillDaily = useMutation({
        mutationFn: (payload: FillDailyRatePlanPayload) => ratePlanApi.fillDaily(payload),
        onSuccess: (res) => {
            toast.success(`Filled ${res.data.days} day(s) of pricing`)
        },
        onError: (error: Error) => toast.error(error.message),
    })

    // ── Local dialog state ───────────────────────────────────────────
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [editingRatePlan, setEditingRatePlan] = useState<RatePlanListItem | null>(null)
    const [fillDailyFor, setFillDailyFor] = useState<RatePlanListItem | null>(null)

    const ratePlans = ratePlansQuery.data?.data ?? []

    return (
        <>
            {/* ── Top Navigation & Header ── */}
            <div>
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate({ to: '/property/$propertySlug', params: { propertySlug: property.slug } })}
                >
                    <ArrowLeft className="mr-2 size-4" />
                    Back to Room Types
                </Button>
            </div>

            {/* ── Key Metrics ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Starting Rate"
                    value={startingPrice > 0 ? formatPrice(startingPrice) : '—'}
                    subtitle={rt.ratePlans.length ? `From ${rt.ratePlans[0].code}` : 'No rate plan yet'}
                    icon={<CreditCard className="size-4 text-primary" />}
                />
                <MetricCard
                    title="Total Units"
                    value={rt.units.length.toString()}
                    subtitle={`Across floor(s) ${floors}`}
                    icon={<Key className="size-4 text-primary" />}
                />
                <MetricCard
                    title="Rate Plans"
                    value={ratePlans.length.toString()}
                    subtitle={(() => {
                        const active = ratePlans.filter((rp) => rp.status === 'ACTIVE').length
                        return `${active} active`
                    })()}
                    icon={<Tag className="size-4 text-primary" />}
                />
                <MetricCard
                    title="Est. Revenue"
                    value="—"
                    subtitle="Analytics coming soon"
                    icon={<Calendar className="size-4 text-primary" />}
                />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* ── Left Column: Configuration & Setup ── */}
                <div className="xl:col-span-2 space-y-6">
                    {/* Gallery & Quick Info */}
                    <Card className="pb-0">
                        <div className="flex flex-col md:flex-row">
                            <div className="md:w-1/3 bg-muted relative min-h-64">
                                {allImages.length > 0 ? (
                                    <img
                                        src={allImages[activeImage] ?? allImages[0]}
                                        alt={rt.name}
                                        crossOrigin="anonymous"
                                        className="absolute inset-0 w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                                        <BedDouble className="size-10" />
                                    </div>
                                )}
                                <Badge className={cn('absolute top-3 left-3 text-white', ROOM_STATUS_BADGE[rt.status])}>
                                    {capitalize(rt.status)}
                                </Badge>
                                {allImages.length > 1 && (
                                    <div className="absolute bottom-3 left-3 right-3 flex gap-2 overflow-x-auto snap-x scrollbar-hide py-1">
                                        {allImages.map((src, i) => (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => setActiveImage(i)}
                                                className={cn(
                                                    'h-12 w-12 shrink-0 overflow-hidden rounded-md border-2 transition-all shadow-sm snap-start',
                                                    i === activeImage ? 'border-white' : 'border-transparent opacity-70 hover:opacity-100',
                                                )}
                                            >
                                                <img src={src} alt="" className="h-full w-full object-cover" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="md:w-2/3 p-6 flex flex-col justify-center">
                                <div className="flex items-center gap-2 mb-2">
                                    <Badge variant="outline" className="text-xs font-mono font-bold bg-muted text-muted-foreground">
                                        {rt.internalCode}
                                    </Badge>
                                    <Badge variant="secondary" className="text-xs">
                                        {rt.viewType || 'Standard View'}
                                    </Badge>
                                </div>
                                <h3 className="text-xl font-bold mb-2">{rt.name}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                                    {rt.description || 'No description provided.'}
                                </p>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    <MiniStat icon={<Maximize2 />} label="Size" value={roomSizeLabel} />
                                    <MiniStat icon={<Users />} label="Capacity" value={`${rt.maxOccupancy} Max`} />
                                    <MiniStat icon={<BedDouble />} label="Beds" value={`${bedsCount}`} />
                                    <MiniStat icon={<Bath />} label="Bath" value={rt.bathroomType === 'PRIVATE' ? 'Private' : 'Shared'} />
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Features & Configuration */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base font-bold flex items-center gap-2">
                                    <CheckCircle2 className="size-4 text-primary" />
                                    Room Amenities
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {rt.amenities.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {rt.amenities.map(({ amenity }) => (
                                            <Badge
                                                key={amenity.id}
                                                variant="secondary"
                                                className="bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium px-3 py-1.5"
                                            >
                                                {amenity.name}
                                            </Badge>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">No amenities assigned.</p>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base font-bold flex items-center gap-2">
                                    <BedDouble className="size-4 text-primary" />
                                    Bed Configuration
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {rt.beds.map((bed) => (
                                        <div key={bed.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-white p-2 rounded-md shadow-sm border">
                                                    <BedDouble className="size-4 text-primary" />
                                                </div>
                                                <span className="font-semibold text-sm">{capitalize(bed.bedType)}</span>
                                            </div>
                                            <Badge variant="outline" className="font-mono bg-white">
                                                x{bed.quantity}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Operational Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <Shield className="size-4 text-primary" />
                                Policy Overrides & Features
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <StatusToggle label="Smoking Allowed" active={rt.smokingRoom} icon={<Bath />} />
                                <StatusToggle label="Accessible" active={rt.accessibleRoom} icon={<Shield />} />
                                <StatusToggle label="Private Bath" active={rt.bathroomType === 'PRIVATE'} icon={<Bath />} />
                                <StatusToggle label="Extra Beds" active={rt.maxOccupancy > rt.maxAdults} icon={<Users />} />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* ── Right Column: Units & Rate Plans Management ── */}
                <div className="space-y-6">
                    <RatePlansCard
                        ratePlans={ratePlans}
                        isLoading={ratePlansQuery.isLoading}
                        onCreate={() => {
                            setEditingRatePlan(null)
                            setIsCreateOpen(true)
                        }}
                        onEdit={(rp) => {
                            setEditingRatePlan(rp)
                            setIsCreateOpen(true)
                        }}
                        onDelete={(rp) => {
                            if (confirm(`Remove rate plan "${rp.name}"? This archives it (soft delete).`)) {
                                deleteRatePlan.mutate(rp.id)
                            }
                        }}
                        onFillDaily={(rp) => setFillDailyFor(rp)}
                    />

                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base font-bold flex items-center gap-2">
                                    <Key className="size-4 text-primary" />
                                    Physical Units
                                </CardTitle>
                                <Badge className="bg-primary hover:bg-primary">{rt.units.length} Total</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-hidden">
                            {rt.units.length > 0 ? (
                                <div className="divide-y">
                                    {rt.units.map((unit) => (
                                        <div
                                            key={unit.id}
                                            className="p-4 flex items-center justify-between hover:bg-muted transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm border border-primary/10">
                                                    {unit.roomNumber}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-semibold">Room {unit.roomNumber}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {unit.floor ? `Floor ${unit.floor}` : '—'}
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Unit status is a future schema field; no real data yet. */}
                                            <Badge
                                                variant="outline"
                                                className="text-[10px] uppercase font-bold tracking-wider bg-muted text-muted-foreground"
                                            >
                                                Managed via room type
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center flex flex-col items-center justify-center h-full">
                                    <Key className="size-12 text-muted-foreground mb-3" />
                                    <p className="font-medium">No units assigned</p>
                                    <p className="text-sm text-muted-foreground mt-1 mb-4">Add physical rooms from the room type editor.</p>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="gap-2"
                                        onClick={() =>
                                            navigate({
                                                to: '/property/$propertySlug',
                                                params: { propertySlug: property.slug },
                                            })
                                        }
                                    >
                                        <Edit className="size-4" />
                                        Edit room type
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter>
                            <Button
                                variant="outline"
                                onClick={() =>
                                    navigate({
                                        to: '/property/$propertySlug',
                                        params: { propertySlug: property.slug },
                                    })
                                }
                            >
                                <Plus className="size-4" />
                                Manage Units
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>

            {/* ══════════════════════════════════════════════════
                CREATE / EDIT RATE PLAN DIALOG
            ══════════════════════════════════════════════════ */}
            <Dialog
                open={isCreateOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        setIsCreateOpen(false)
                        setEditingRatePlan(null)
                    }
                }}
            >
                <DialogContent className="sm:max-w-140">
                    <DialogHeader>
                        <DialogTitle>{editingRatePlan ? 'Edit rate plan' : 'Create rate plan'}</DialogTitle>
                        <DialogDescription>
                            {editingRatePlan
                                ? `Editing "${editingRatePlan.name}" (${editingRatePlan.code})`
                                : `Add a new rate plan for "${rt.name}"`}
                        </DialogDescription>
                    </DialogHeader>

                    <RatePlanForm
                        key={editingRatePlan?.id ?? 'new'}
                        defaultValues={editingRatePlan ? valuesFromRatePlan(editingRatePlan) : defaultRatePlanValues}
                        onSubmit={async (values) => {
                            const payload: CreateRatePlanPayload | UpdateRatePlanPayload = {
                                propertyId: rt.propertyId,
                                roomTypeId: rt.id,
                                name: values.name,
                                code: values.code,
                                description: values.description?.trim() ? values.description : undefined,
                                status: values.status,
                                defaultPrice: values.defaultPrice,
                                defaultMinLOS: values.defaultMinLOS,
                                defaultMaxLOS: values.defaultMaxLOS,
                                defaultClosedToArrival: values.defaultClosedToArrival,
                                defaultClosedToDeparture: values.defaultClosedToDeparture,
                            }

                            if (editingRatePlan) {
                                await updateRatePlan.mutateAsync({ id: editingRatePlan.id, payload })
                            } else {
                                await createRatePlan.mutateAsync(payload as CreateRatePlanPayload)
                            }
                            setIsCreateOpen(false)
                            setEditingRatePlan(null)
                        }}
                        onCancel={() => {
                            setIsCreateOpen(false)
                            setEditingRatePlan(null)
                        }}
                        submitLabel={
                            createRatePlan.isPending || updateRatePlan.isPending
                                ? 'Saving...'
                                : editingRatePlan
                                  ? 'Save changes'
                                  : 'Create rate plan'
                        }
                    />
                </DialogContent>
            </Dialog>

            {/* ══════════════════════════════════════════════════
                FILL DAILY RATES DIALOG
            ══════════════════════════════════════════════════ */}
            <Dialog
                open={!!fillDailyFor}
                onOpenChange={(open) => {
                    if (!open) setFillDailyFor(null)
                }}
            >
                <DialogContent className="sm:max-w-130">
                    <DialogHeader>
                        <DialogTitle>Configure daily rates</DialogTitle>
                        <DialogDescription>
                            {fillDailyFor
                                ? `Override the price and restrictions for "${fillDailyFor.name}" across a date range. Leave a field blank to keep the plan's default.`
                                : ''}
                        </DialogDescription>
                    </DialogHeader>

                    {fillDailyFor && (
                        <FillDailyForm
                            defaultPrice={
                                typeof fillDailyFor.defaultPrice === 'string'
                                    ? Number(fillDailyFor.defaultPrice)
                                    : fillDailyFor.defaultPrice
                            }
                            onSubmit={async (values) => {
                                await fillDaily.mutateAsync({
                                    ratePlanId: fillDailyFor.id,
                                    fromDate: values.fromDate,
                                    toDate: values.toDate,
                                    ...(values.price !== undefined && { price: values.price }),
                                    ...(values.minLOS !== undefined && { minLOS: values.minLOS }),
                                    ...(values.maxLOS !== undefined && { maxLOS: values.maxLOS }),
                                    ...(values.closedToArrival !== undefined && { closedToArrival: values.closedToArrival }),
                                    ...(values.closedToDeparture !== undefined && { closedToDeparture: values.closedToDeparture }),
                                    ...(values.stopSell !== undefined && { stopSell: values.stopSell }),
                                })
                                setFillDailyFor(null)
                            }}
                            onCancel={() => setFillDailyFor(null)}
                            submitLabel={fillDaily.isPending ? 'Filling...' : 'Apply to range'}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </>
    )
}

// ─── Sub-components ───────────────────────────────────────────────

function MetricCard({ title, value, subtitle, icon }: { title: string; value: string; subtitle: string; icon: React.ReactNode }) {
    return (
        <Card className="pt-5">
            <CardContent>
                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{title}</h4>
                    <div className="p-2 bg-primary/10 rounded-lg">{icon}</div>
                </div>
                <div className="flex items-end justify-between">
                    <div>
                        <div className="text-3xl font-black tracking-tight">{value}</div>
                        <div className="text-sm text-muted-foreground font-medium mt-1">{subtitle}</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function MiniStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-muted-foreground text-xs uppercase font-bold tracking-wider">
                <div className="[&>svg]:size-3.5">{icon}</div>
                {label}
            </div>
            <div className="text-sm font-bold">{value}</div>
        </div>
    )
}

function StatusToggle({ label, active, icon }: { label: string; active: boolean; icon: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-muted-foreground">
                <div className="[&>svg]:size-4">{icon}</div>
                <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
            </div>
            <div>
                {active ? (
                    <Badge
                        variant="outline"
                        className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 transition-colors text-xs py-1"
                    >
                        <CheckCircle2 className="size-3 mr-1" />
                        Enabled
                    </Badge>
                ) : (
                    <Badge
                        variant="outline"
                        className="bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 transition-colors text-xs py-1"
                    >
                        Disabled
                    </Badge>
                )}
            </div>
        </div>
    )
}

// ─── Rate Plans Card (right column) ───────────────────────────────

function RatePlansCard({
    ratePlans,
    isLoading,
    onCreate,
    onEdit,
    onDelete,
    onFillDaily,
}: {
    ratePlans: RatePlanListItem[]
    isLoading: boolean
    onCreate: () => void
    onEdit: (rp: RatePlanListItem) => void
    onDelete: (rp: RatePlanListItem) => void
    onFillDaily: (rp: RatePlanListItem) => void
}) {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                        <Tag className="size-4 text-primary" />
                        Rate Plans
                    </CardTitle>
                    <Button size="sm" onClick={onCreate}>
                        <Plus className="size-4" />
                        Add
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <Spinner className="size-5" />
                    </div>
                ) : ratePlans.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-6 text-center">
                        <Tag className="size-10 text-muted-foreground mx-auto mb-3" />
                        <p className="text-sm font-medium">No rate plans yet</p>
                        <p className="text-xs text-muted-foreground mt-1 mb-4">A rate plan defines a sellable price for this room type.</p>
                        <Button size="sm" variant="outline" onClick={onCreate}>
                            <Plus className="size-4" />
                            Create your first rate plan
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {ratePlans.map((rp) => {
                            const price = typeof rp.defaultPrice === 'string' ? Number(rp.defaultPrice) : rp.defaultPrice
                            return (
                                <div key={rp.id} className="rounded-lg border bg-card p-4 hover:border-primary/30 transition-colors">
                                    <div className="flex items-start justify-between gap-3 mb-2">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                <Badge variant="outline" className="font-mono text-[10px] bg-muted">
                                                    {rp.code}
                                                </Badge>
                                                <span
                                                    className={cn(
                                                        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border',
                                                        RATE_PLAN_STATUS_BADGE[rp.status],
                                                    )}
                                                >
                                                    {rp.status}
                                                </span>
                                            </div>
                                            <div className="font-semibold text-sm leading-tight truncate">{rp.name}</div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <div className="text-lg font-black tracking-tight">{formatPrice(price)}</div>
                                            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                                                per night
                                            </div>
                                        </div>
                                    </div>

                                    {(rp.defaultMinLOS || rp.defaultMaxLOS || rp.defaultClosedToArrival || rp.defaultClosedToDeparture) && (
                                        <div className="flex flex-wrap gap-1.5 mb-3">
                                            {rp.defaultMinLOS && (
                                                <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                                                    Min stay {rp.defaultMinLOS}n
                                                </span>
                                            )}
                                            {rp.defaultMaxLOS && (
                                                <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                                                    Max stay {rp.defaultMaxLOS}n
                                                </span>
                                            )}
                                            {rp.defaultClosedToArrival && (
                                                <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                                                    Closed to arrival
                                                </span>
                                            )}
                                            {rp.defaultClosedToDeparture && (
                                                <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                                                    Closed to departure
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex items-center gap-1.5 -ml-1">
                                        <Button size="sm" variant="ghost" onClick={() => onEdit(rp)}>
                                            <Edit className="size-3.5" />
                                            Edit
                                        </Button>
                                        <Button size="sm" variant="ghost" onClick={() => onFillDaily(rp)}>
                                            <Calendar className="size-3.5" />
                                            Daily rates
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                                            onClick={() => onDelete(rp)}
                                        >
                                            <Trash2 className="size-3.5" />
                                            Remove
                                        </Button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

// ─── Rate Plan Form (create / edit) ───────────────────────────────

const ratePlanFormSchema = z.object({
    name: z.string().min(2, 'Name is required').max(128),
    code: z
        .string()
        .min(1, 'Code is required')
        .max(64)
        .regex(/^[A-Z0-9_-]+$/i, 'Use letters, numbers, hyphens or underscores'),
    description: z.string().max(5000),
    status: z.enum(RatePlanStatusOptions),
    defaultPrice: z.number().min(0, 'Default price is required'),
    defaultMinLOS: z.number().int().min(1).max(365).optional(),
    defaultMaxLOS: z.number().int().min(1).max(365).optional(),
    defaultClosedToArrival: z.boolean(),
    defaultClosedToDeparture: z.boolean(),
})

type RatePlanFormValues = z.infer<typeof ratePlanFormSchema>

const defaultRatePlanValues: RatePlanFormValues = {
    name: '',
    code: 'BAR',
    description: '',
    status: 'ACTIVE',
    defaultPrice: 100,
    defaultMinLOS: undefined,
    defaultMaxLOS: undefined,
    defaultClosedToArrival: false,
    defaultClosedToDeparture: false,
}

function valuesFromRatePlan(rp: RatePlanListItem | RatePlan): RatePlanFormValues {
    return {
        name: rp.name,
        code: rp.code,
        description: rp.description ?? '',
        status: rp.status,
        defaultPrice: typeof rp.defaultPrice === 'string' ? Number(rp.defaultPrice) : rp.defaultPrice,
        defaultMinLOS: rp.defaultMinLOS ?? undefined,
        defaultMaxLOS: rp.defaultMaxLOS ?? undefined,
        defaultClosedToArrival: rp.defaultClosedToArrival,
        defaultClosedToDeparture: rp.defaultClosedToDeparture,
    }
}

function RatePlanForm({
    defaultValues,
    onSubmit,
    onCancel,
    submitLabel,
}: {
    defaultValues: RatePlanFormValues
    onSubmit: (values: RatePlanFormValues) => Promise<void>
    onCancel: () => void
    submitLabel: string
}) {
    const form = useAppForm({
        defaultValues,
        validators: { onChange: ratePlanFormSchema },
        onSubmit: async ({ value }) => await onSubmit(value),
    })

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault()
                e.stopPropagation()
                form.handleSubmit()
            }}
            className="flex flex-col gap-4"
        >
            <form.AppField name="name">
                {(field) => <field.FormInput label="Plan name" placeholder="e.g. Best Available Rate" />}
            </form.AppField>
            <div className="grid grid-cols-2 gap-3">
                <form.AppField name="code">{(field) => <field.FormInput label="Code" placeholder="e.g. BAR" />}</form.AppField>
                <form.AppField name="status">
                    {(field) => (
                        <field.FormSelect label="Status" options={RatePlanStatusOptions.map((v) => ({ value: v, label: capitalize(v) }))} />
                    )}
                </form.AppField>
            </div>
            <form.AppField name="description">
                {(field) => <field.FormTextarea label="Description" placeholder="Internal notes (not shown to guests)..." rows={2} />}
            </form.AppField>

            <form.AppField name="defaultPrice">
                {(field) => <field.FormInputNumber label="Default price / night" placeholder="e.g. 120" min={0} step="0.01" />}
            </form.AppField>

            <div className="grid grid-cols-2 gap-3">
                <form.AppField name="defaultMinLOS">
                    {(field) => (
                        <field.FormInputNumber label="Min length of stay (nights)" placeholder="e.g. 2" min={1} max={365} step="1" />
                    )}
                </form.AppField>
                <form.AppField name="defaultMaxLOS">
                    {(field) => (
                        <field.FormInputNumber label="Max length of stay (nights)" placeholder="Optional" min={1} max={365} step="1" />
                    )}
                </form.AppField>
            </div>
            <form.AppField name="defaultClosedToArrival">
                {(field) => (
                    <field.FormSwitch
                        label="Closed to arrival by default"
                        description="Guests cannot check in on nights using the default price"
                    />
                )}
            </form.AppField>
            <form.AppField name="defaultClosedToDeparture">
                {(field) => (
                    <field.FormSwitch
                        label="Closed to departure by default"
                        description="Guests cannot check out on nights using the default price"
                    />
                )}
            </form.AppField>

            <div className="flex items-center justify-end gap-2">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <form.AppForm>
                    <form.FormSubmit label={submitLabel} />
                </form.AppForm>
            </div>
        </form>
    )
}

// ─── Fill Daily Rates Form ────────────────────────────────────────

const fillDailySchema = z
    .object({
        fromDate: z.string().min(1, 'From date is required'),
        toDate: z.string().min(1, 'To date is required'),
        price: z.number().min(0).optional(),
        minLOS: z.number().int().min(1).max(365).optional(),
        maxLOS: z.number().int().min(1).max(365).optional(),
        closedToArrival: z.boolean().optional(),
        closedToDeparture: z.boolean().optional(),
        stopSell: z.boolean().optional(),
    })
    .refine((v) => new Date(v.toDate) >= new Date(v.fromDate), {
        message: 'To date must be on or after from date',
        path: ['toDate'],
    })

type FillDailyValues = z.infer<typeof fillDailySchema>

function FillDailyForm({
    defaultPrice,
    onSubmit,
    onCancel,
    submitLabel,
}: {
    defaultPrice: number
    onSubmit: (values: FillDailyValues) => Promise<void>
    onCancel: () => void
    submitLabel: string
}) {
    // Default the wizard to a 30-day window starting today.
    const today = new Date()
    const monthOut = new Date(today)
    monthOut.setDate(monthOut.getDate() + 29)
    const isoDate = (d: Date) => d.toISOString().slice(0, 10)

    const form = useAppForm({
        defaultValues: {
            fromDate: isoDate(today),
            toDate: isoDate(monthOut),
            price: defaultPrice,
            minLOS: undefined,
            maxLOS: undefined,
            closedToArrival: false,
            closedToDeparture: false,
            stopSell: false,
        } as FillDailyValues,
        validators: { onChange: fillDailySchema },
        onSubmit: async ({ value }) => await onSubmit(value),
    })

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault()
                e.stopPropagation()
                form.handleSubmit()
            }}
            className="flex flex-col gap-4"
        >
            <form.AppField name="fromDate">{(field) => <field.FormInput type="date" label="From date" />}</form.AppField>
            <form.AppField name="toDate">{(field) => <field.FormInput type="date" label="To date" />}</form.AppField>

            <form.AppField name="price">
                {(field) => (
                    <field.FormInputNumber
                        label={`Price / night (default ${defaultPrice})`}
                        placeholder={String(defaultPrice)}
                        min={0}
                        step="0.01"
                    />
                )}
            </form.AppField>
            <div className="grid grid-cols-2 gap-3">
                <form.AppField name="minLOS">
                    {(field) => <field.FormInputNumber label="Min LOS" placeholder="Optional" min={1} max={365} step="1" />}
                </form.AppField>
                <form.AppField name="maxLOS">
                    {(field) => <field.FormInputNumber label="Max LOS" placeholder="Optional" min={1} max={365} step="1" />}
                </form.AppField>
            </div>
            <form.AppField name="closedToArrival">
                {(field) => <field.FormSwitch label="Closed to arrival" description="Block check-in on these nights" />}
            </form.AppField>
            <form.AppField name="closedToDeparture">
                {(field) => <field.FormSwitch label="Closed to departure" description="Block check-out on these nights" />}
            </form.AppField>
            <form.AppField name="stopSell">
                {(field) => <field.FormSwitch label="Stop-sell" description="Mark these nights as unavailable for sale" />}
            </form.AppField>

            <div className="flex items-center justify-end gap-2">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <form.AppForm>
                    <form.FormSubmit label={submitLabel} />
                </form.AppForm>
            </div>
        </form>
    )
}
