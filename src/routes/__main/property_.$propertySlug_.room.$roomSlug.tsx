import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { propertyApi, resolveImage, roomTypeApi, type RoomType, type RoomTypeStatus } from '@/lib/api'
import { formatPrice } from '@/lib/properties'
import { capitalize, cn } from '@/lib/utils'
import { createFileRoute, Link, notFound, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Bath, BedDouble, Calendar, CheckCircle2, CreditCard, Key, Maximize2, Plus, Shield, Users } from 'lucide-react'
import { useState } from 'react'

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

function RoomTypeAdminDetails({ property, roomType: rt }: { property: any; roomType: RoomType }) {
    const navigate = useNavigate()

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
    const basePrice = Number(rt.basePrice)
    const roomSizeLabel = rt.roomSize != null ? `${rt.roomSize} sqm` : '—'

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
                    title="Base Price"
                    value={formatPrice(basePrice)}
                    subtitle="Per night rate"
                    icon={<CreditCard className="size-4 text-primary" />}
                />
                <MetricCard
                    title="Total Units"
                    value={rt.units.length.toString()}
                    subtitle={`Across floor(s) ${floors}`}
                    icon={<Key className="size-4 text-primary" />}
                />
                <MetricCard
                    title="Avg. Occupancy"
                    value="—"
                    subtitle="Analytics coming soon"
                    icon={<Calendar className="size-4 text-primary" />}
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
                                    {rt.internalCode && (
                                        <Badge variant="outline" className="text-xs font-mono font-bold bg-muted text-muted-foreground">
                                            {rt.internalCode}
                                        </Badge>
                                    )}
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

                {/* ── Right Column: Units Management ── */}
                <div className="space-y-6">
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
                                        <Plus className="size-4" />
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
        </>
    )
}

// ─── Sub-components ─────────────────────────────────────────────────

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
