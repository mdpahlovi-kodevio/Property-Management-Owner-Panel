import { createFileRoute, Link, notFound, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { ArrowLeft, BedDouble, Bath, Maximize2, Users, Star, Cigarette, PawPrint, Baby, Music, Shield, Clock, MapPin, CheckCircle2, Eye } from 'lucide-react'
import { getPropertyById, formatPrice } from '@/lib/properties'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/__main/property_/$propertyId/room/$roomTypeId')({
    loader: async ({ params }) => {
        const property = getPropertyById(params.propertyId)
        if (!property) throw notFound()
        const roomType = property.roomTypes.find((rt) => rt.id === params.roomTypeId)
        if (!roomType) throw notFound()
        return { property, roomType }
    },
    notFoundComponent: () => (
        <div className="mx-auto max-w-xl px-4 py-24 text-center">
            <div className="mb-6 flex justify-center">
                <div className="flex size-16 items-center justify-center rounded-2xl bg-slate-100">
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
    component: RoomViewComponent,
})

function RoomViewComponent() {
    const { property, roomType } = Route.useLoaderData()
    return <RoomTypeDetails property={property} roomType={roomType} />
}

type Property = NonNullable<ReturnType<typeof getPropertyById>>
type RoomType = Property['roomTypes'][number]

function RoomTypeDetails({ property, roomType: rt }: { property: Property; roomType: RoomType }) {
    const p = property.property
    const currency = p.currency
    const navigate = useNavigate()

    const allImages = [rt.images.thumbnail, ...rt.images.gallery]
    const [activeImage, setActiveImage] = useState(0)

    const bedsCount = rt.beds.reduce((s, b) => s + b.quantity, 0)
    const floors = rt.units.length > 0
        ? Array.from(new Set(rt.units.map((u) => u.floor))).join(', ')
        : '—'

    const currencySymbol = currency === 'USD' ? '$'
        : currency === 'EUR' ? '€'
            : currency === 'GBP' ? '£'
                : currency

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

            {/* ── Breadcrumb ── */}
            <nav className="mb-6 flex items-center gap-2 text-sm text-slate-400 flex-wrap">
                <Link to="/property" className="hover:text-slate-700 transition-colors">
                    Properties
                </Link>
                <span>/</span>
                <Link
                    to="/property/$propertyId"
                    params={{ propertyId: p.id }}
                    className="hover:text-slate-700 transition-colors"
                >
                    {p.name}
                </Link>
                <span>/</span>
                <span className="text-slate-700 font-medium">{rt.name}</span>
            </nav>

            {/* ── Back Button ── */}
            <Button
                variant="ghost"
                size="sm"
                className="-ml-3 mb-4 text-slate-500 hover:text-slate-900 w-fit"
                onClick={() => navigate({ to: '/property/$propertyId', params: { propertyId: p.id } })}
            >
                <ArrowLeft className="mr-2 size-4" />
                Back to {p.name} rooms
            </Button>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-12">

                {/* ── Left column: gallery + content ── */}
                <div className="space-y-8 lg:col-span-2">

                    {/* Gallery */}
                    <section>
                        <div className="relative aspect-video overflow-hidden rounded-2xl bg-slate-100 shadow-[0_8px_40px_-8px_rgba(0,0,0,0.15)]">
                            <img
                                src={allImages[activeImage]}
                                alt={rt.name}
                                className="h-full w-full object-cover transition-opacity duration-300"
                            />

                            {/* Status badge */}
                            <div className="absolute top-4 left-4 flex gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/90 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest text-white backdrop-blur-md border border-white/20 shadow-sm">
                                    <span className="relative inline-flex rounded-full size-1.5 bg-white" />
                                    Active
                                </span>
                                {rt.viewType && (
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-md border border-white/10">
                                        <Eye className="size-2.5" />
                                        {rt.viewType}
                                    </span>
                                )}
                            </div>

                            {/* Price pill */}
                            <div className="absolute bottom-4 right-4">
                                <div className="bg-white/95 backdrop-blur-xl px-4 py-2 rounded-2xl shadow-[0_8px_20px_rgba(0,0,0,0.12)] border border-white/60 flex flex-col items-end">
                                    <span className="text-[22px] font-black text-slate-900 leading-none tracking-tight">
                                        {currencySymbol}{rt.basePrice.toLocaleString()}
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">/ Night</span>
                                </div>
                            </div>
                        </div>

                        {/* Thumbnails */}
                        {allImages.length > 1 && (
                            <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
                                {allImages.map((src, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => setActiveImage(i)}
                                        className={cn(
                                            'aspect-square overflow-hidden rounded-xl border-2 transition-all duration-200 bg-slate-100',
                                            i === activeImage
                                                ? 'border-[#243E8B] shadow-[0_0_0_3px_rgba(36,62,139,0.15)]'
                                                : 'border-transparent hover:border-slate-300'
                                        )}
                                        aria-label={`Show image ${i + 1}`}
                                    >
                                        <img src={src} alt="" className="h-full w-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Header */}
                    <header>
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Badge variant="secondary" className="text-[11px] font-bold uppercase tracking-wider rounded-full px-3">
                                        {rt.internalCode}
                                    </Badge>
                                </div>
                                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{rt.name}</h1>
                                <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
                                    <MapPin className="size-3.5 text-slate-400" />
                                    Floor {floors} · {p.name}
                                </p>
                            </div>
                            <div className="flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200/60 px-3 py-1.5 text-sm font-semibold text-amber-700">
                                <Star className="size-3.5 fill-amber-400 text-amber-400" />
                                {p.rating.toFixed(1)}
                                <span className="font-normal text-amber-600/70">({p.reviewCount} reviews)</span>
                            </div>
                        </div>
                    </header>

                    {/* Quick stats */}
                    <section>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            <StatCard
                                icon={<Users className="size-5 text-[#243E8B]" />}
                                label="Max guests"
                                value={`${rt.maxOccupancy} guests`}
                                sub={`${rt.maxAdults} adults${rt.maxChildren > 0 ? `, ${rt.maxChildren} children` : ''}`}
                            />
                            <StatCard
                                icon={<BedDouble className="size-5 text-[#243E8B]" />}
                                label="Beds"
                                value={`${bedsCount} bed${bedsCount === 1 ? '' : 's'}`}
                                sub={rt.beds.map((b) => `${b.quantity} ${b.bedType}`).join(', ')}
                            />
                            <StatCard
                                icon={<Maximize2 className="size-5 text-[#243E8B]" />}
                                label="Room size"
                                value={`${rt.roomSize} ${rt.roomSizeUnit}`}
                                sub={rt.viewType || 'Interior view'}
                            />
                            <StatCard
                                icon={<Bath className="size-5 text-[#243E8B]" />}
                                label="Bathroom"
                                value={rt.privateBathroom ? 'Private' : 'Shared'}
                                sub={rt.privateBathroom ? 'En-suite' : 'Shared facility'}
                            />
                        </div>
                    </section>

                    {/* Description */}
                    <section>
                        <SectionHeading>About this room</SectionHeading>
                        <p className="text-slate-600 leading-relaxed">{rt.description}</p>
                    </section>

                    {/* Bed configuration */}
                    <section>
                        <SectionHeading>Bed configuration</SectionHeading>
                        <div className="flex flex-wrap gap-3">
                            {rt.beds.map((bed, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                                >
                                    <BedDouble className="size-5 text-[#243E8B]" />
                                    <div>
                                        <div className="text-sm font-semibold text-slate-800">{bed.bedType}</div>
                                        <div className="text-xs text-slate-400">Qty: {bed.quantity}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Amenities */}
                    <section>
                        <SectionHeading>Room amenities</SectionHeading>
                        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                            {rt.amenities.map((amenity) => (
                                <div
                                    key={amenity}
                                    className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
                                >
                                    <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                                    <span className="text-slate-700 font-medium">{amenity}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Room extras */}
                    <section>
                        <SectionHeading>Room features</SectionHeading>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                            <FeaturePill
                                active={!rt.smokingRoom}
                                icon={<Cigarette className="size-4" />}
                                label={rt.smokingRoom ? 'Smoking allowed' : 'Non-smoking'}
                            />
                            <FeaturePill
                                active={rt.accessibleRoom}
                                icon={<Shield className="size-4" />}
                                label={rt.accessibleRoom ? 'Accessible room' : 'Standard access'}
                            />
                            <FeaturePill
                                active={rt.privateBathroom}
                                icon={<Bath className="size-4" />}
                                label={rt.privateBathroom ? 'Private bathroom' : 'Shared bathroom'}
                            />
                        </div>
                    </section>

                    {/* Units */}
                    {rt.units.length > 0 && (
                        <section>
                            <SectionHeading>Physical units ({rt.units.length})</SectionHeading>
                            <div className="flex flex-wrap gap-2">
                                {rt.units.map((unit) => (
                                    <div
                                        key={unit.id}
                                        className="flex items-center gap-2 rounded-full bg-[#EEF3FF] border border-[#243E8B]/15 px-3.5 py-1.5"
                                    >
                                        <span className="text-[13px] font-bold text-[#243E8B]">{unit.roomNumber}</span>
                                        <span className="text-[11px] text-slate-400">· Floor {unit.floor}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Property policies */}
                    <section>
                        <SectionHeading>House rules & policies</SectionHeading>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <PolicyRow
                                icon={<Clock className="size-4" />}
                                label="Check-in / Check-out"
                                value={`From ${p.checkInTime} · Until ${p.checkOutTime}`}
                            />
                            <PolicyRow
                                icon={<Shield className="size-4" />}
                                label="Security deposit"
                                value={formatPrice(p.policies.securityDeposit, currency)}
                            />
                            <PolicyRow
                                icon={<Cigarette className="size-4" />}
                                label="Smoking"
                                value={p.policies.smokingAllowed ? 'Allowed' : 'Not allowed'}
                            />
                            <PolicyRow
                                icon={<PawPrint className="size-4" />}
                                label="Pets"
                                value={p.policies.petsAllowed ? 'Allowed' : 'Not allowed'}
                            />
                            <PolicyRow
                                icon={<Baby className="size-4" />}
                                label="Children"
                                value={
                                    p.policies.childrenAllowed
                                        ? `Allowed (min age: ${p.policies.minimumGuestAge})`
                                        : 'Not allowed'
                                }
                            />
                            <PolicyRow
                                icon={<Music className="size-4" />}
                                label="Parties / events"
                                value={p.policies.partiesAllowed ? 'Allowed' : 'Not allowed'}
                            />
                        </div>
                        <div className="mt-4 rounded-xl bg-slate-50 border border-slate-200 p-4 text-sm leading-relaxed">
                            <div className="mb-1 font-semibold text-slate-700">House rules</div>
                            <p className="text-slate-500">{p.policies.houseRules}</p>
                        </div>
                    </section>

                    {/* Location map */}
                    <section>
                        <SectionHeading>Location</SectionHeading>
                        <div className="relative aspect-video overflow-hidden rounded-2xl bg-slate-100 shadow-sm">
                            <iframe
                                title={`Map showing ${p.name}`}
                                src={`https://maps.google.com/maps?q=${p.latitude},${p.longitude}&z=15&output=embed`}
                                width="100%"
                                height="100%"
                                style={{ border: 0, position: 'absolute', inset: 0 }}
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                allowFullScreen
                            />
                        </div>
                        <p className="mt-3 text-sm text-slate-500">
                            {p.address1}
                            {p.address2 ? `, ${p.address2}` : ''}, {p.city}, {p.state} {p.postalCode},{' '}
                            {p.country}
                        </p>
                    </section>
                </div>

                {/* ── Right column: sticky booking card ── */}
                <aside className="lg:col-span-1">
                    <div className="sticky top-6 flex flex-col gap-4">

                        {/* Booking card */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.1)]">
                            <div className="mb-5">
                                <div className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-slate-400">
                                    Base price / night
                                </div>
                                <div className="mt-1.5 flex items-baseline gap-1">
                                    <span className="text-3xl font-black text-slate-900 tracking-tight">
                                        {formatPrice(rt.basePrice, currency)}
                                    </span>
                                    <span className="text-sm text-slate-400">/ night</span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <div className="grid grid-cols-2 gap-2">
                                    <BookingField label="Check-in" type="date" />
                                    <BookingField label="Check-out" type="date" />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <BookingField label="Guests" type="number" placeholder="2" min={1} max={rt.maxOccupancy} />
                                    <BookingField label="Nights" type="number" placeholder="1" min={1} />
                                </div>
                            </div>

                            <button
                                type="button"
                                className="mt-4 w-full rounded-xl bg-[#243E8B] py-3 text-sm font-bold text-white hover:bg-[#1D3270] shadow-[0_4px_12px_rgba(36,62,139,0.25)] hover:shadow-[0_8px_20px_rgba(36,62,139,0.35)] transition-all duration-300 hover:-translate-y-0.5"
                                onClick={() => console.log(`Reserve ${rt.name} at ${p.name}`)}
                            >
                                Reserve This Room
                            </button>

                            <p className="mt-3 text-center text-xs text-slate-400">
                                You won't be charged yet
                            </p>
                        </div>

                        {/* Room highlights */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm">
                            <div className="mb-3 font-bold text-slate-800">Room highlights</div>
                            <ul className="flex flex-col gap-2 text-xs text-slate-500">
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                                    {rt.roomSize} {rt.roomSizeUnit} — {rt.viewType || 'Interior view'}
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                                    {rt.maxOccupancy} max occupancy
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                                    {rt.amenities.length} room amenities
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                                    {rt.units.length} unit{rt.units.length === 1 ? '' : 's'} available
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                                    {rt.privateBathroom ? 'Private bathroom' : 'Shared bathroom'}
                                </li>
                            </ul>
                        </div>

                        {/* Property card */}
                        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                            <div className="h-24 overflow-hidden">
                                <img
                                    src={p.images.thumbnail}
                                    alt={p.name}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            <div className="p-4">
                                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                                    {p.propertyType}
                                </div>
                                <div className="font-bold text-slate-800 text-sm">{p.name}</div>
                                <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                                    <MapPin className="size-3 text-slate-400" />
                                    {p.city}, {p.country}
                                </div>
                                <Link
                                    to="/property/$propertyId"
                                    params={{ propertyId: p.id }}
                                    className="mt-3 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-[#243E8B] transition-colors"
                                >
                                    View all room types
                                </Link>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    )
}

// ─── Sub-components ─────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex items-center gap-3 mb-4">
            <h2 className="text-lg font-bold text-slate-900">{children}</h2>
            <div className="flex-1 h-px bg-slate-100" />
        </div>
    )
}

function StatCard({
    icon,
    label,
    value,
    sub,
}: {
    icon: React.ReactNode
    label: string
    value: string
    sub: string
}) {
    return (
        <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-xl bg-[#EEF3FF]">
                    {icon}
                </div>
            </div>
            <div>
                <div className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400">{label}</div>
                <div className="mt-0.5 text-sm font-bold text-slate-800">{value}</div>
                <div className="text-[11px] text-slate-400 truncate">{sub}</div>
            </div>
        </div>
    )
}

function PolicyRow({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode
    label: string
    value: string
}) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-3.5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                {icon}
                {label}
            </div>
            <div className="mt-1.5 text-sm font-semibold text-slate-700">{value}</div>
        </div>
    )
}

function FeaturePill({
    active,
    icon,
    label,
}: {
    active: boolean
    icon: React.ReactNode
    label: string
}) {
    return (
        <div
            className={cn(
                'flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-[13px] font-medium transition-colors',
                active
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 bg-white text-slate-500'
            )}
        >
            {icon}
            {label}
        </div>
    )
}

function BookingField({
    label,
    type,
    placeholder,
    min,
    max,
}: {
    label: string
    type: 'date' | 'number'
    placeholder?: string
    min?: number
    max?: number
}) {
    return (
        <label className="block">
            <span className="mb-1 block text-xs font-semibold text-slate-500">{label}</span>
            <input
                type={type}
                placeholder={placeholder}
                min={min}
                max={max}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-[#243E8B] focus:outline-none focus:bg-white transition-colors"
            />
        </label>
    )
}
