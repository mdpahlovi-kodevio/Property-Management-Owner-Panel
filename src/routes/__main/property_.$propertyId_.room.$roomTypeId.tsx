import { createFileRoute, Link, notFound, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { ArrowLeft, BedDouble, Bath, Maximize2, Users, Cigarette, Baby, Shield, CheckCircle2, Calendar, Activity, Key, CreditCard, Plus } from 'lucide-react'
import { getPropertyById, formatPrice } from '@/lib/properties'
import { getRoomMetrics, getUnitStatus, UNIT_STATUS_COLORS } from '@/lib/property-rooms'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'

import { cn } from '@/lib/utils'

export const Route = createFileRoute('/__main/property_/$propertyId_/room/$roomTypeId')({
    loader: async ({ params }) => {
        const propId = (params as any).propertyId_ || (params as any).propertyId
        const property = getPropertyById(propId)
        if (!property) throw notFound()
        const roomType = property.roomTypes.find((rt) => rt.id === params.roomTypeId)
        if (!roomType) throw notFound()
        return { property, roomType }
    },
    notFoundComponent: () => (
        <div className="mx-auto max-w-xl px-4 py-24 text-center">
            <div className="mb-6 flex justify-center">
                <div className="flex size-16 items-center justify-center rounded-lg bg-slate-100">
                    <BedDouble className="size-8 text-slate-400" />
                </div>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Room type not found</h1>
            <p className="mt-3 text-slate-500">
                The room type you're looking for doesn't exist or has been removed.
            </p>
            <Link
                to="/property"
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-[#243E8B] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#1D3270] transition-colors"
            >
                Browse all properties
            </Link>
        </div>
    ),
    component: RoomAdminDashboardComponent,
})

function RoomAdminDashboardComponent() {
    const { property, roomType } = Route.useLoaderData()
    return <RoomTypeAdminDetails property={property} roomType={roomType} />
}

type Property = NonNullable<ReturnType<typeof getPropertyById>>
type RoomType = Property['roomTypes'][number]

function RoomTypeAdminDetails({ property, roomType: rt }: { property: Property; roomType: RoomType }) {
    const p = property.property
    const currency = p.currency
    const navigate = useNavigate()

    const allImages = [rt.images.thumbnail, ...rt.images.gallery]
    const [activeImage, setActiveImage] = useState(0)

    const bedsCount = rt.beds.reduce((s, b) => s + b.quantity, 0)
    const floors = rt.units.length > 0
        ? Array.from(new Set(rt.units.map((u) => u.floor))).join(', ')
        : '—'
    const metrics = getRoomMetrics(rt.id, rt.basePrice)

    return (
        <>
            {/* ── Top Navigation & Header ── */}
            <div>
                <Button
                    variant="default"
                    size="sm"
                    onClick={() => navigate({ to: '/property/$propertyId', params: { propertyId: p.id } })}
                >
                    <ArrowLeft className="mr-2 size-4" />
                    Back to Room Types
                </Button>
            </div>

            {/* ── Key Metrics ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Base Price"
                    value={formatPrice(rt.basePrice, currency)}
                    subtitle="Per night rate"
                    icon={<CreditCard className="size-4 text-[#243E8B]" />}
                />
                <MetricCard
                    title="Total Units"
                    value={rt.units.length.toString()}
                    subtitle={`Across floor(s) ${floors}`}
                    icon={<Key className="size-4 text-[#243E8B]" />}
                />
                <MetricCard
                    title="Avg. Occupancy"
                    value={`${metrics.occupancy}%`}
                    subtitle="Last 30 days"
                    icon={<Activity className="size-4 text-[#243E8B]" />}
                    trend={metrics.trendOccupancy}
                />
                <MetricCard
                    title="Est. Revenue"
                    value={formatPrice(metrics.revenue, currency)}
                    subtitle="Last 30 days"
                    icon={<Calendar className="size-4 text-[#243E8B]" />}
                    trend={metrics.trendRevenue}
                />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* ── Left Column: Configuration & Setup ── */}
                <div className="xl:col-span-2 space-y-8">
                    {/* Gallery & Quick Info */}
                    <Card className="overflow-hidden border-slate-200 shadow-sm">
                        <div className="flex flex-col md:flex-row">
                            <div className="md:w-1/3 bg-slate-100 relative min-h-[250px]">
                                <img
                                    src={allImages[activeImage]}
                                    alt={rt.name}
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                                <Badge className="absolute top-3 left-3 bg-emerald-500 hover:bg-emerald-600">
                                    Active
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
                                                    i === activeImage ? 'border-white' : 'border-transparent opacity-70 hover:opacity-100'
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
                                    <Badge variant="outline" className="text-xs font-mono font-bold text-slate-500 bg-slate-50">
                                        {rt.internalCode}
                                    </Badge>
                                    <Badge variant="secondary" className="text-xs">
                                        {rt.viewType || 'Standard View'}
                                    </Badge>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">{rt.name}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed mb-6">
                                    {rt.description}
                                </p>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    <MiniStat icon={<Maximize2 />} label="Size" value={`${rt.roomSize} ${rt.roomSizeUnit}`} />
                                    <MiniStat icon={<Users />} label="Capacity" value={`${rt.maxOccupancy} Max`} />
                                    <MiniStat icon={<BedDouble />} label="Beds" value={`${bedsCount}`} />
                                    <MiniStat icon={<Bath />} label="Bath" value={rt.privateBathroom ? 'Private' : 'Shared'} />
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Features & Configuration */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Card className="border-slate-200 shadow-sm">
                            <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
                                <CardTitle className="text-base font-bold flex items-center gap-2">
                                    <CheckCircle2 className="size-4 text-[#243E8B]" />
                                    Room Amenities
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <div className="flex flex-wrap gap-2">
                                    {rt.amenities.map(amenity => (
                                        <Badge key={amenity} variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium px-3 py-1.5">
                                            {amenity}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-slate-200 shadow-sm">
                            <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
                                <CardTitle className="text-base font-bold flex items-center gap-2">
                                    <BedDouble className="size-4 text-[#243E8B]" />
                                    Bed Configuration
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <div className="space-y-3">
                                    {rt.beds.map((bed, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-white p-2 rounded-md shadow-sm border border-slate-100">
                                                    <BedDouble className="size-4 text-[#243E8B]" />
                                                </div>
                                                <span className="font-semibold text-slate-700 text-sm">{bed.bedType}</span>
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
                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <Shield className="size-4 text-[#243E8B]" />
                                Policy Overrides & Features
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <StatusToggle label="Smoking Allowed" active={rt.smokingRoom} icon={<Cigarette />} />
                                <StatusToggle label="Accessible" active={rt.accessibleRoom} icon={<Shield />} />
                                <StatusToggle label="Private Bath" active={rt.privateBathroom} icon={<Bath />} />
                                <StatusToggle label="Extra Beds" active={rt.maxOccupancy > rt.maxAdults} icon={<Baby />} />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* ── Right Column: Units Management ── */}
                <div className="space-y-8">
                    <Card className="border-slate-200 shadow-sm flex flex-col h-full">
                        <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base font-bold flex items-center gap-2">
                                    <Key className="size-4 text-[#243E8B]" />
                                    Physical Units
                                </CardTitle>
                                <Badge className="bg-[#243E8B] hover:bg-[#1D3270]">
                                    {rt.units.length} Total
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 flex-1 overflow-hidden">
                            {rt.units.length > 0 ? (
                                <div className="divide-y divide-slate-100">
                                    {rt.units.map((unit) => {
                                        const status = getUnitStatus(unit.id)

                                        return (
                                            <div key={unit.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-10 rounded-xl bg-[#EEF3FF] text-[#243E8B] flex items-center justify-center font-bold text-sm border border-[#243E8B]/10">
                                                        {unit.roomNumber}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-semibold text-slate-900">Room {unit.roomNumber}</div>
                                                        <div className="text-xs text-slate-500">Floor {unit.floor}</div>
                                                    </div>
                                                </div>
                                                <Badge variant="outline" className={cn("text-[10px] uppercase font-bold tracking-wider", UNIT_STATUS_COLORS[status])}>
                                                    {status}
                                                </Badge>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="p-8 text-center flex flex-col items-center justify-center h-full text-slate-500">
                                    <Key className="size-12 text-slate-200 mb-3" />
                                    <p className="font-medium text-slate-900">No units assigned</p>
                                    <p className="text-sm mt-1 mb-4">Create physical rooms for this type.</p>
                                    <Button size="sm" variant="outline" className="gap-2">
                                        <Plus className="size-4" />
                                        Add Unit
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="p-4 border-t border-slate-100 bg-slate-50/50">
                            <Button className="w-full gap-2 bg-white text-slate-700 border-slate-200 hover:bg-slate-100" variant="outline">
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

function MetricCard({ title, value, subtitle, icon, trend }: { title: string, value: string, subtitle: string, icon: React.ReactNode, trend?: string }) {
    const isPositive = trend?.startsWith('+')
    return (
        <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">{title}</h4>
                    <div className="p-2 bg-[#EEF3FF] rounded-lg">
                        {icon}
                    </div>
                </div>
                <div className="flex items-end justify-between">
                    <div>
                        <div className="text-3xl font-black text-slate-900 tracking-tight">{value}</div>
                        <div className="text-sm text-slate-400 font-medium mt-1">{subtitle}</div>
                    </div>
                    {trend && (
                        <div className={cn("text-sm font-bold flex items-center gap-1", isPositive ? "text-emerald-600" : "text-rose-600")}>
                            {trend}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

function MiniStat({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
    return (
        <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs uppercase font-bold tracking-wider">
                <div className="[&>svg]:size-3.5">{icon}</div>
                {label}
            </div>
            <div className="text-sm font-bold text-slate-800">{value}</div>
        </div>
    )
}

function StatusToggle({ label, active, icon }: { label: string, active: boolean, icon: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-slate-500">
                <div className="[&>svg]:size-4">{icon}</div>
                <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
            </div>
            <div>
                {active ? (
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 transition-colors text-xs py-1">
                        <CheckCircle2 className="size-3 mr-1" />
                        Enabled
                    </Badge>
                ) : (
                    <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 transition-colors text-xs py-1">
                        Disabled
                    </Badge>
                )}
            </div>
        </div>
    )
}
