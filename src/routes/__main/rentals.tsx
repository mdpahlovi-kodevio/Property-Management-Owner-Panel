import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { SearchInput } from '@/components/ui/search-input'
import {
    Plus, MapPin, Edit, Eye, CheckCircle2, XCircle,
    Building, ArrowRight, Wifi, ParkingCircle, Waves,
    Dumbbell, UtensilsCrossed, Car, Accessibility, Clock
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { useForm } from '@tanstack/react-form'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { DataTableFooter } from '@/components/ui/data-table'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

export type CreatePropertyForm = {
    name: string
    propertyType: string
    description: string
    email: string
    phone: string
    website?: string
    country: string
    state: string
    city: string
    postalCode: string
    address1: string
    address2?: string
    latitude: number
    longitude: number
    timezone: string
    checkInTime: string
    checkOutTime: string
    amenities: string[]
    policies: {
        smokingAllowed: boolean
        petsAllowed: boolean
        childrenAllowed: boolean
        partiesAllowed: boolean
    }
    minGuestAge?: number
    securityDeposit?: number
    houseRules?: string
    logoUrl?: string
    videoUrl?: string
    images: File[]
}

export const Route = createFileRoute('/__main/rentals')({
    component: RentalsComponent,
})

const MOCK_PROPERTIES = [
    { id: 'sea-view-villa', title: 'Sea View Villa', location: 'Coastal Avenue, Riviera', details: 'Villa • 4 Units', price: '$120', period: 'FROM', status: 'Active', imageUrl: 'https://picsum.photos/seed/prop1/800/600' },
    { id: 'mountain-retreat', title: 'Mountain Retreat', location: 'Highland Park, Aspen', details: 'Chalet • 8 Units', price: '$90', period: 'FROM', status: 'Active', imageUrl: 'https://picsum.photos/seed/prop2/800/600' },
    { id: 'urban-oasis-penthouse', title: 'Urban Oasis Penthouse', location: 'Downtown Metro District', details: 'Apartment • 1 Unit', price: '$150', period: 'FROM', status: 'Maintenance', imageUrl: 'https://picsum.photos/seed/prop3/800/600' },
    { id: 'cozy-cottage', title: 'Cozy Cottage', location: 'Quiet Suburbia', details: 'Cottage • 2 Units', price: '$70', period: 'FROM', status: 'Active', imageUrl: 'https://picsum.photos/seed/prop4/800/600' },
    { id: 'luxury-apartment', title: 'Luxury Apartment', location: 'City Center', details: 'Apartment • 12 Units', price: '$110', period: 'FROM', status: 'Active', imageUrl: 'https://picsum.photos/seed/prop5/800/600' },
    { id: 'beachfront-house', title: 'Beachfront House', location: 'Sunny Beach', details: 'House • 1 Unit', price: '$200', period: 'FROM', status: 'Active', imageUrl: 'https://picsum.photos/seed/prop6/800/600' },
    { id: 'modern-loft', title: 'Modern Loft', location: 'Arts District', details: 'Loft • 5 Units', price: '$95', period: 'FROM', status: 'Active', imageUrl: 'https://picsum.photos/seed/prop7/800/600' },
    { id: 'rustic-cabin', title: 'Rustic Cabin', location: 'Pine Grove', details: 'Cabin • 3 Units', price: '$65', period: 'FROM', status: 'Maintenance', imageUrl: 'https://picsum.photos/seed/prop8/800/600' },
    { id: 'riverside-estate', title: 'Riverside Estate', location: 'Valley Edge', details: 'Estate • 10 Units', price: '$180', period: 'FROM', status: 'Active', imageUrl: 'https://picsum.photos/seed/prop9/800/600' },
    { id: 'skyview-condo', title: 'Skyview Condo', location: 'Uptown Core', details: 'Condo • 20 Units', price: '$135', period: 'FROM', status: 'Active', imageUrl: 'https://picsum.photos/seed/prop10/800/600' },
    { id: 'desert-villa', title: 'Desert Villa', location: 'Canyon Ridge', details: 'Villa • 2 Units', price: '$145', period: 'FROM', status: 'Active', imageUrl: 'https://picsum.photos/seed/prop11/800/600' },
    { id: 'historic-townhouse', title: 'Historic Townhouse', location: 'Old Town Square', details: 'Townhouse • 4 Units', price: '$115', period: 'FROM', status: 'Maintenance', imageUrl: 'https://picsum.photos/seed/prop12/800/600' },
]

const PROP_AMENITIES = [
    { label: 'WiFi', icon: Wifi },
    { label: 'Parking', icon: ParkingCircle },
    { label: 'Pool', icon: Waves },
    { label: 'Gym', icon: Dumbbell },
    { label: 'Restaurant', icon: UtensilsCrossed },
    { label: 'Airport shuttle', icon: Car },
    { label: 'Wheelchair accessible', icon: Accessibility },
    { label: '24-hr front desk', icon: Clock },
    { label: 'Spa', icon: null },
    { label: 'Bar', icon: null },
    { label: 'Elevator', icon: null },
    { label: 'Laundry', icon: null },
    { label: 'Pet friendly', icon: null },
    { label: 'Business center', icon: null },
]

const PROP_TABS = ['Basics', 'Location', 'Operations', 'Amenities', 'Policies', 'Media'] as const
type PropTab = typeof PROP_TABS[number]

// ─── Shared primitives ─────────────────────────────────────────────
function FormField({ label, required, hint, children, className }: {
    label: string; required?: boolean; hint?: string; children: React.ReactNode; className?: string
}) {
    return (
        <div className={cn('flex flex-col gap-1.5', className)}>
            <Label className="text-[12.5px] font-semibold text-slate-700">
                {label}{required && <span className="text-red-500 ml-0.5">*</span>}
            </Label>
            {children}
            {hint && <p className="text-[11px] text-slate-400 leading-none">{hint}</p>}
        </div>
    )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex items-center gap-3 mb-4">
            <span className="text-[10.5px] font-extrabold uppercase tracking-[0.12em] text-slate-400">{children}</span>
            <div className="flex-1 h-px bg-slate-100" />
        </div>
    )
}

// ─── Status badge ────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
    const isActive = status === 'Active'
    return (
        <span className={cn(
            'shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border',
            isActive
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                : 'bg-amber-50 text-amber-700 border-amber-200/60'
        )}>
            <span className="relative flex size-1.5">
                <span className={cn('animate-ping absolute inline-flex size-full rounded-full opacity-75', isActive ? 'bg-emerald-400' : 'bg-amber-400')} />
                <span className={cn('relative inline-flex rounded-full size-1.5', isActive ? 'bg-emerald-500' : 'bg-amber-500')} />
            </span>
            {status}
        </span>
    )
}

// ─── Component ───────────────────────────────────────────────────────
function RentalsComponent() {
    const navigate = useNavigate()
    const [searchQuery, setSearchQuery] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(4)
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [activeTab, setActiveTab] = useState<PropTab>('Basics')
    const [editingProperty, setEditingProperty] = useState<typeof MOCK_PROPERTIES[0] | null>(null)
    const [selectedProperty, setSelectedProperty] = useState<typeof MOCK_PROPERTIES[0] | null>(null)

    const form = useForm({
        defaultValues: {
            name: '', propertyType: '', description: '',
            email: '', phone: '', website: '',
            country: '', state: '', city: '', postalCode: '',
            address1: '', address2: '',
            latitude: 0, longitude: 0, timezone: '',
            checkInTime: '', checkOutTime: '',
            amenities: [] as string[],
            policies: { smokingAllowed: false, petsAllowed: false, childrenAllowed: false, partiesAllowed: false },
            minGuestAge: undefined as number | undefined,
            securityDeposit: undefined as number | undefined,
            houseRules: '', logoUrl: '', videoUrl: '',
            images: [] as File[],
        } as CreatePropertyForm,
        onSubmit: async ({ value }) => {
            console.log('Submitted:', value)
            toast.success('Property saved successfully!')
            setIsAddOpen(false)
            setEditingProperty(null)
            form.reset()
        },
    })

    const openAdd = () => {
        setEditingProperty(null)
        form.reset()
        setActiveTab('Basics')
        setIsAddOpen(true)
    }

    const openEdit = (property: typeof MOCK_PROPERTIES[0]) => {
        setEditingProperty(property)
        form.reset()
        form.setFieldValue('name', property.title)
        setActiveTab('Basics')
        setIsAddOpen(true)
    }

    return (
        <>
            {/* ── Page header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <PageHeader title="Rentals" description="Manage your Rentals" />
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <SearchInput
                        placeholder="Search properties..."
                        value={searchQuery}
                        onValueChange={(val) => { setSearchQuery(val); setCurrentPage(1) }}
                        className="w-full sm:w-[300px]"
                    />
                    <Button
                        onClick={openAdd}
                        className="shrink-0 gap-1.5 rounded-xl font-semibold bg-[#243E8B] hover:bg-[#1D3270] text-white shadow-sm shadow-[#243E8B]/20 hover:shadow-md hover:shadow-[#243E8B]/30 transition-all duration-300"
                    >
                        <Plus className="size-4" />
                        Add Property
                    </Button>
                </div>
            </div>

            {/* ── Grid + pagination ── */}
            <div className="flex flex-col gap-8 mt-6">
                {(() => {
                    const filtered = MOCK_PROPERTIES.filter(p => {
                        const q = searchQuery.toLowerCase()
                        return p.title.toLowerCase().includes(q) || p.location.toLowerCase().includes(q) || p.details.toLowerCase().includes(q)
                    })
                    const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    return (
                        <>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4.5">
                                {paginated.map((property) => (
                                    <div
                                        key={property.id}
                                        onClick={() => navigate({ to: '/rentals/$propertyId', params: { propertyId: property.id } })}
                                        className="group h-full bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-500 ease-out hover:-translate-y-1.5 flex flex-col relative cursor-pointer"
                                    >
                                        {/* Image */}
                                        <div className="relative w-full aspect-video shrink-0 overflow-hidden bg-slate-100">
                                            <img
                                                src={property.imageUrl}
                                                alt={property.title}
                                                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                            {/* Price badge */}
                                            <div className="absolute top-3 right-3 z-10">
                                                <div className="bg-white/95 backdrop-blur-sm px-2.5 py-1.5 rounded-xl shadow-sm border border-white/30 flex items-baseline gap-1">
                                                    <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wide">{property.period}</span>
                                                    <span className="text-[15px] font-black text-slate-900">{property.price}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Details */}
                                        <div className="p-4 flex flex-col gap-3 grow">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-start justify-between gap-2">
                                                    <h3 className="text-[0.95rem] font-bold text-slate-900 tracking-tight group-hover:text-[#243E8B] transition-colors duration-300 leading-tight">
                                                        {property.title}
                                                    </h3>
                                                    <StatusBadge status={property.status} />
                                                </div>
                                                <div className="flex flex-col gap-1.5">
                                                    <div className="flex items-center gap-1.5 text-slate-500">
                                                        <MapPin className="size-3.5 shrink-0 text-slate-400" />
                                                        <span className="text-[12px] font-medium leading-none truncate">{property.location}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-slate-500">
                                                        <Building className="size-3.5 shrink-0 text-slate-400" />
                                                        <span className="text-[12px] font-semibold text-slate-600 leading-none truncate">{property.details}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action buttons — match dialog footer style */}
                                            <div className="grid grid-cols-2 gap-2 mt-auto pt-1">
                                                <Button
                                                    onClick={(e) => { e.stopPropagation(); openEdit(property) }}
                                                    variant="outline"
                                                    className="w-full gap-1.5 rounded-xl border-slate-200 text-slate-600 font-semibold h-9 hover:bg-slate-50 hover:text-[#243E8B] hover:border-[#243E8B]/30 transition-all duration-300 group/btn text-[13px]"
                                                >
                                                    <Edit className="size-3.5 group-hover/btn:-rotate-12 transition-transform duration-300" />
                                                    Edit
                                                </Button>
                                                <Button
                                                    onClick={(e) => { e.stopPropagation(); setSelectedProperty(property) }}
                                                    className="w-full gap-1.5 rounded-xl bg-[#243E8B] text-white font-semibold h-9 hover:bg-[#1D3270] shadow-sm shadow-[#243E8B]/20 hover:shadow-md hover:shadow-[#243E8B]/30 transition-all duration-300 group/btn text-[13px]"
                                                >
                                                    <Eye className="size-3.5 group-hover/btn:scale-110 transition-transform duration-300" />
                                                    View
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <DataTableFooter
                                page={currentPage}
                                limit={itemsPerPage}
                                total={filtered.length}
                                onPageChange={setCurrentPage}
                                onLimitChange={(limit) => { setItemsPerPage(limit); setCurrentPage(1) }}
                                limitOptions={[4, 8, 12, 24]}
                                noun="properties"
                            />
                        </>
                    )
                })()}
            </div>

            {/* ══════════════════════════════════════════════════
                CREATE / EDIT PROPERTY DIALOG
            ══════════════════════════════════════════════════ */}
            <Dialog open={isAddOpen} onOpenChange={(open) => { setIsAddOpen(open); if (!open) setEditingProperty(null) }}>
                <DialogContent className="w-[95vw] sm:max-w-[680px] flex flex-col p-0 rounded-2xl overflow-hidden max-h-[88vh] gap-0 bg-white shadow-2xl shadow-slate-900/15">

                    {/* ── Dialog header ── */}
                    <DialogHeader className="flex-row items-center gap-3 px-6 py-4 border-b border-slate-100 shrink-0 space-y-0">
                        <div className="size-8 rounded-lg bg-[#243E8B]/10 flex items-center justify-center shrink-0">
                            <Building className="size-4 text-[#243E8B]" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <DialogTitle className="text-[14.5px] font-bold text-slate-900 leading-none">
                                {editingProperty ? 'Edit property' : 'Create property'}
                            </DialogTitle>
                            <p className="text-[11.5px] text-slate-400 mt-0.5 leading-none">
                                {editingProperty ? `Editing "${editingProperty.title}"` : 'Add a new property to your portfolio'}
                            </p>
                        </div>
                        <span className="shrink-0 text-[10.5px] font-bold tracking-wide rounded-full px-2.5 py-0.5 bg-slate-100 text-slate-600 border border-slate-200">
                            {editingProperty ? 'Edit' : 'New'}
                        </span>
                        <DialogDescription className="sr-only">Property form</DialogDescription>
                    </DialogHeader>

                    {/* ── Tab bar ── */}
                    <div className="flex border-b border-slate-100 bg-slate-50/60 overflow-x-auto shrink-0">
                        {PROP_TABS.map((tab) => (
                            <button
                                key={tab}
                                type="button"
                                onClick={() => setActiveTab(tab)}
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

                    {/* ── Panel content ── */}
                    <form
                        onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); form.handleSubmit() }}
                        className="flex flex-col flex-1 min-h-0"
                    >
                        <div className="flex-1 overflow-y-auto min-h-0 px-6 py-5">

                            {/* ════════ BASICS ════════ */}
                            {activeTab === 'Basics' && (
                                <div className="flex flex-col gap-6">
                                    <div>
                                        <SectionLabel>Basic Information</SectionLabel>
                                        <div className="flex flex-col gap-3">
                                            <form.Field name="name" children={(field) => (
                                                <FormField label="Property name" required>
                                                    <Input
                                                        placeholder="e.g. Seaside Villa Bali"
                                                        className="h-9 rounded-xl border-slate-200 text-[13px] focus:border-[#243E8B]/50 focus:ring-[#243E8B]/10"
                                                        value={field.state.value}
                                                        onChange={(e) => field.handleChange(e.target.value)}
                                                    />
                                                </FormField>
                                            )} />

                                            <div className="grid grid-cols-2 gap-3">
                                                <form.Field name="propertyType" children={(field) => (
                                                    <FormField label="Property type" required>
                                                        <Select value={field.state.value} onValueChange={field.handleChange}>
                                                            <SelectTrigger className="h-9 rounded-xl border-slate-200 text-[13px] bg-white">
                                                                <SelectValue placeholder="Select type" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {['Hotel', 'Apartment', 'Villa', 'Resort', 'Guest House', 'Hostel', 'Homestay', 'Vacation Rental', 'Serviced Apartment', 'Boutique Hotel'].map(t => (
                                                                    <SelectItem key={t} value={t.toLowerCase().replace(/ /g, '-')}>{t}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </FormField>
                                                )} />
                                                <FormField label="Status" required>
                                                    <Select defaultValue="active">
                                                        <SelectTrigger className="h-9 rounded-xl border-slate-200 text-[13px] bg-white">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="active">Active</SelectItem>
                                                            <SelectItem value="inactive">Inactive</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </FormField>
                                            </div>

                                            <form.Field name="description" children={(field) => (
                                                <FormField label="Description" required>
                                                    <Textarea
                                                        placeholder="Describe your property for guests and OTA listings..."
                                                        className="min-h-[90px] rounded-xl border-slate-200 text-[13px] resize-none leading-relaxed"
                                                        value={field.state.value}
                                                        onChange={(e) => field.handleChange(e.target.value)}
                                                    />
                                                </FormField>
                                            )} />
                                        </div>
                                    </div>

                                    <div>
                                        <SectionLabel>Contact Information</SectionLabel>
                                        <div className="grid grid-cols-3 gap-3">
                                            <form.Field name="email" children={(field) => (
                                                <FormField label="Email" required>
                                                    <Input type="email" placeholder="info@property.com" className="h-9 rounded-xl border-slate-200 text-[13px]" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                                </FormField>
                                            )} />
                                            <form.Field name="phone" children={(field) => (
                                                <FormField label="Phone" required>
                                                    <Input type="tel" placeholder="+1 234 567 8900" className="h-9 rounded-xl border-slate-200 text-[13px]" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                                </FormField>
                                            )} />
                                            <form.Field name="website" children={(field) => (
                                                <FormField label="Website">
                                                    <Input type="url" placeholder="https://..." className="h-9 rounded-xl border-slate-200 text-[13px]" value={field.state.value || ''} onChange={(e) => field.handleChange(e.target.value)} />
                                                </FormField>
                                            )} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ════════ LOCATION ════════ */}
                            {activeTab === 'Location' && (
                                <div className="flex flex-col gap-6">
                                    <div>
                                        <SectionLabel>Address</SectionLabel>
                                        <div className="flex flex-col gap-3">
                                            <div className="grid grid-cols-2 gap-3">
                                                <form.Field name="country" children={(field) => (
                                                    <FormField label="Country" required>
                                                        <Select value={field.state.value} onValueChange={field.handleChange}>
                                                            <SelectTrigger className="h-9 rounded-xl border-slate-200 text-[13px] bg-white">
                                                                <SelectValue placeholder="Select country" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {['Bangladesh', 'United States', 'United Kingdom', 'Indonesia', 'Thailand', 'France', 'Spain', 'Australia', 'Japan'].map(c => (
                                                                    <SelectItem key={c} value={c}>{c}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </FormField>
                                                )} />
                                                <form.Field name="state" children={(field) => (
                                                    <FormField label="State / Province">
                                                        <Input placeholder="e.g. Bali" className="h-9 rounded-xl border-slate-200 text-[13px]" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                                    </FormField>
                                                )} />
                                                <form.Field name="city" children={(field) => (
                                                    <FormField label="City" required>
                                                        <Input placeholder="e.g. Seminyak" className="h-9 rounded-xl border-slate-200 text-[13px]" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                                    </FormField>
                                                )} />
                                                <form.Field name="postalCode" children={(field) => (
                                                    <FormField label="Postal code">
                                                        <Input placeholder="80361" className="h-9 rounded-xl border-slate-200 text-[13px]" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                                    </FormField>
                                                )} />
                                            </div>
                                            <form.Field name="address1" children={(field) => (
                                                <FormField label="Address line 1" required>
                                                    <Input placeholder="Street address" className="h-9 rounded-xl border-slate-200 text-[13px]" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                                </FormField>
                                            )} />
                                            <form.Field name="address2" children={(field) => (
                                                <FormField label="Address line 2">
                                                    <Input placeholder="Apartment, suite, unit (optional)" className="h-9 rounded-xl border-slate-200 text-[13px]" value={field.state.value || ''} onChange={(e) => field.handleChange(e.target.value)} />
                                                </FormField>
                                            )} />
                                        </div>
                                    </div>

                                    <div>
                                        <SectionLabel>Coordinates</SectionLabel>
                                        <div className="grid grid-cols-2 gap-3">
                                            <form.Field name="latitude" children={(field) => (
                                                <FormField label="Latitude" hint="Auto-fill from address recommended">
                                                    <Input type="number" step="any" placeholder="-8.691195" className="h-9 rounded-xl border-slate-200 text-[13px]" value={field.state.value || ''} onChange={(e) => field.handleChange(parseFloat(e.target.value) || 0)} />
                                                </FormField>
                                            )} />
                                            <form.Field name="longitude" children={(field) => (
                                                <FormField label="Longitude">
                                                    <Input type="number" step="any" placeholder="115.167820" className="h-9 rounded-xl border-slate-200 text-[13px]" value={field.state.value || ''} onChange={(e) => field.handleChange(parseFloat(e.target.value) || 0)} />
                                                </FormField>
                                            )} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ════════ OPERATIONS ════════ */}
                            {activeTab === 'Operations' && (
                                <div className="flex flex-col gap-6">
                                    <div>
                                        <SectionLabel>Check-in / Check-out</SectionLabel>
                                        <div className="grid grid-cols-2 gap-3">
                                            <form.Field name="checkInTime" children={(field) => (
                                                <FormField label="Check-in time" required>
                                                    <Input type="time" defaultValue="14:00" className="h-9 rounded-xl border-slate-200 text-[13px]" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                                </FormField>
                                            )} />
                                            <form.Field name="checkOutTime" children={(field) => (
                                                <FormField label="Check-out time" required>
                                                    <Input type="time" defaultValue="11:00" className="h-9 rounded-xl border-slate-200 text-[13px]" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                                </FormField>
                                            )} />
                                        </div>
                                    </div>

                                    <div>
                                        <SectionLabel>Timezone</SectionLabel>
                                        <form.Field name="timezone" children={(field) => (
                                            <FormField label="Property timezone" required className="max-w-xs">
                                                <Select value={field.state.value} onValueChange={field.handleChange}>
                                                    <SelectTrigger className="h-9 rounded-xl border-slate-200 text-[13px] bg-white">
                                                        <SelectValue placeholder="Select timezone" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {[
                                                            { label: 'Asia/Dhaka (UTC+6)', value: 'Asia/Dhaka' },
                                                            { label: 'Asia/Bali (UTC+8)', value: 'Asia/Makassar' },
                                                            { label: 'America/New_York (UTC-5)', value: 'America/New_York' },
                                                            { label: 'Europe/London (UTC+0)', value: 'Europe/London' },
                                                            { label: 'Europe/Paris (UTC+1)', value: 'Europe/Paris' },
                                                            { label: 'Asia/Bangkok (UTC+7)', value: 'Asia/Bangkok' },
                                                        ].map(tz => <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </FormField>
                                        )} />
                                    </div>
                                </div>
                            )}

                            {/* ════════ AMENITIES ════════ */}
                            {activeTab === 'Amenities' && (
                                <div className="flex flex-col gap-4">
                                    <SectionLabel>Property Amenities</SectionLabel>
                                    <form.Field name="amenities" children={(field) => (
                                        <div className="flex flex-wrap gap-2">
                                            {PROP_AMENITIES.map(({ label, icon: Icon }) => {
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
                                    )} />
                                </div>
                            )}

                            {/* ════════ POLICIES ════════ */}
                            {activeTab === 'Policies' && (
                                <div className="flex flex-col gap-6">
                                    <div>
                                        <SectionLabel>Guest Policies</SectionLabel>
                                        <div className="rounded-2xl border border-slate-100 overflow-hidden divide-y divide-slate-100">
                                            {([
                                                { name: 'policies.smokingAllowed' as const, label: 'Smoking allowed', sub: 'Guests may smoke on premises' },
                                                { name: 'policies.petsAllowed' as const, label: 'Pets allowed', sub: 'Guests may bring animals' },
                                                { name: 'policies.childrenAllowed' as const, label: 'Children allowed', sub: 'Under 18 permitted' },
                                                { name: 'policies.partiesAllowed' as const, label: 'Parties / events allowed', sub: 'Guests may host gatherings' },
                                            ] as const).map(policy => (
                                                <form.Field key={policy.name} name={policy.name} children={(f) => (
                                                    <div className="flex items-center justify-between px-4 py-3.5 bg-white hover:bg-slate-50/70 transition-colors">
                                                        <div>
                                                            <p className="text-[13px] font-semibold text-slate-800">{policy.label}</p>
                                                            <p className="text-[11.5px] text-slate-400 mt-0.5">{policy.sub}</p>
                                                        </div>
                                                        <Switch checked={f.state.value} onCheckedChange={f.handleChange} />
                                                    </div>
                                                )} />
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <SectionLabel>Fees &amp; Rules</SectionLabel>
                                        <div className="flex flex-col gap-3">
                                            <div className="grid grid-cols-2 gap-3">
                                                <form.Field name="minGuestAge" children={(field) => (
                                                    <FormField label="Minimum guest age">
                                                        <Input type="number" placeholder="18" min="0" className="h-9 rounded-xl border-slate-200 text-[13px]" value={field.state.value ?? ''} onChange={(e) => field.handleChange(e.target.value ? parseInt(e.target.value) : undefined)} />
                                                    </FormField>
                                                )} />
                                                <form.Field name="securityDeposit" children={(field) => (
                                                    <FormField label="Security deposit">
                                                        <Input type="number" placeholder="0.00" min="0" step="0.01" className="h-9 rounded-xl border-slate-200 text-[13px]" value={field.state.value ?? ''} onChange={(e) => field.handleChange(e.target.value ? parseFloat(e.target.value) : undefined)} />
                                                    </FormField>
                                                )} />
                                            </div>
                                            <form.Field name="houseRules" children={(field) => (
                                                <FormField label="House rules">
                                                    <Textarea placeholder="e.g. No loud music after 10pm..." className="min-h-[90px] rounded-xl border-slate-200 text-[13px] resize-none leading-relaxed" value={field.state.value || ''} onChange={(e) => field.handleChange(e.target.value)} />
                                                </FormField>
                                            )} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ════════ MEDIA ════════ */}
                            {activeTab === 'Media' && (
                                <div className="flex flex-col gap-6">
                                    <div>
                                        <SectionLabel>Property Photos</SectionLabel>
                                        <div
                                            className="border-2 border-dashed border-slate-200 rounded-2xl p-10 flex flex-col items-center gap-3 cursor-pointer hover:border-[#243E8B]/40 hover:bg-[#EEF3FF]/20 transition-all duration-300 group"
                                            onClick={() => {/* file pick */}}
                                        >
                                            <div className="size-12 rounded-2xl bg-slate-100 group-hover:bg-[#EEF3FF] flex items-center justify-center transition-colors duration-300">
                                                <Plus className="size-5 text-slate-400 group-hover:text-[#243E8B] transition-colors duration-300" />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[13px] font-semibold text-slate-700">Click to upload or drag &amp; drop</p>
                                                <p className="text-[11.5px] text-slate-400 mt-0.5">JPG, PNG, WEBP · max 10MB each</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <SectionLabel>Media URLs</SectionLabel>
                                        <div className="grid grid-cols-2 gap-3">
                                            <form.Field name="logoUrl" children={(field) => (
                                                <FormField label="Logo URL">
                                                    <Input type="url" placeholder="https://..." className="h-9 rounded-xl border-slate-200 text-[13px]" value={field.state.value || ''} onChange={(e) => field.handleChange(e.target.value)} />
                                                </FormField>
                                            )} />
                                            <form.Field name="videoUrl" children={(field) => (
                                                <FormField label="Video / virtual tour URL">
                                                    <Input type="url" placeholder="https://youtube.com/..." className="h-9 rounded-xl border-slate-200 text-[13px]" value={field.state.value || ''} onChange={(e) => field.handleChange(e.target.value)} />
                                                </FormField>
                                            )} />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ── Dialog footer ── matches card button style exactly ── */}
                        <Separator />
                        <div className="flex items-center justify-between px-6 py-4 shrink-0">
                            {/* Tab navigation hints */}
                            <div className="flex items-center gap-1">
                                {PROP_TABS.map((tab) => (
                                    <button
                                        key={tab}
                                        type="button"
                                        onClick={() => setActiveTab(tab)}
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
                                    onClick={() => { setIsAddOpen(false); setEditingProperty(null) }}
                                    className="h-9 px-5 rounded-xl font-semibold text-[13px] border-slate-200"
                                >
                                    Cancel
                                </Button>
                                <form.Subscribe
                                    selector={(state) => [state.canSubmit, state.isSubmitting]}
                                    children={([canSubmit, isSubmitting]) => (
                                        <Button
                                            type="submit"
                                            disabled={!canSubmit}
                                            className="h-9 px-5 rounded-xl font-semibold bg-[#243E8B] hover:bg-[#1D3270] text-white text-[13px] shadow-sm shadow-[#243E8B]/20 hover:shadow-md hover:shadow-[#243E8B]/30 transition-all duration-300"
                                        >
                                            {isSubmitting ? 'Saving...' : 'Save property'}
                                        </Button>
                                    )}
                                />
                            </div>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* ══════════════════════════════════════════════════
                VIEW PROPERTY DETAIL DIALOG
            ══════════════════════════════════════════════════ */}
            <Dialog open={!!selectedProperty} onOpenChange={(open) => !open && setSelectedProperty(null)}>
                <DialogContent className="w-[95%] sm:max-w-xl max-h-[88vh] overflow-y-auto bg-white p-0 rounded-2xl gap-0 shadow-2xl shadow-slate-900/15">
                    {selectedProperty && (
                        <>
                            {/* Hero image */}
                            <div className="relative h-52 w-full overflow-hidden rounded-t-2xl">
                                <img src={selectedProperty.imageUrl} alt={selectedProperty.title} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                                    <div>
                                        <p className="text-[10.5px] font-bold text-white/70 uppercase tracking-widest mb-0.5">{selectedProperty.period}</p>
                                        <p className="text-2xl font-black text-white leading-none">{selectedProperty.price}</p>
                                    </div>
                                    <StatusBadge status={selectedProperty.status} />
                                </div>
                            </div>

                            <div className="p-5 flex flex-col gap-5">
                                {/* Title & meta */}
                                <div>
                                    <DialogTitle className="text-[18px] font-bold text-slate-900">{selectedProperty.title}</DialogTitle>
                                    <DialogDescription className="sr-only">Details for {selectedProperty.title}</DialogDescription>
                                    <div className="flex flex-col gap-1.5 mt-2">
                                        <div className="flex items-center gap-1.5 text-slate-500">
                                            <MapPin className="size-3.5 text-slate-400 shrink-0" />
                                            <span className="text-[12.5px] font-medium">{selectedProperty.location}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-slate-500">
                                            <Building className="size-3.5 text-slate-400 shrink-0" />
                                            <span className="text-[12.5px] font-semibold text-slate-600">{selectedProperty.details}</span>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* Amenities sample */}
                                <div>
                                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">Amenities</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['Free WiFi', 'Air Conditioning', 'Pool', 'Parking'].map(a => (
                                            <div key={a} className="flex items-center gap-2">
                                                <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                                                <span className="text-[12.5px] text-slate-600 font-medium">{a}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Check-in / Check-out */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="border border-slate-100 rounded-2xl p-4 flex gap-3 items-center bg-slate-50/50">
                                        <div className="bg-[#EEF3FF] p-2.5 rounded-xl text-[#243E8B] shrink-0">
                                            <ArrowRight className="size-4" />
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide block">Check-in</span>
                                            <span className="text-[13px] font-bold text-slate-800">After 3:00 PM</span>
                                        </div>
                                    </div>
                                    <div className="border border-slate-100 rounded-2xl p-4 flex gap-3 items-center bg-slate-50/50">
                                        <div className="bg-red-50 p-2.5 rounded-xl text-red-500 shrink-0">
                                            <XCircle className="size-4" />
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide block">Check-out</span>
                                            <span className="text-[13px] font-bold text-slate-800">Before 11:00 AM</span>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* Actions — same style as card buttons */}
                                <div className="grid grid-cols-2 gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={() => { openEdit(selectedProperty); setSelectedProperty(null) }}
                                        className="rounded-xl h-10 font-semibold text-[13px] border-slate-200 hover:bg-slate-50 hover:text-[#243E8B] hover:border-[#243E8B]/30 gap-1.5 transition-all duration-300"
                                    >
                                        <Edit className="size-3.5" />
                                        Edit Property
                                    </Button>
                                    <Button className="rounded-xl h-10 font-semibold text-[13px] bg-[#243E8B] hover:bg-[#1D3270] text-white shadow-sm shadow-[#243E8B]/20 hover:shadow-md hover:shadow-[#243E8B]/30 transition-all duration-300">
                                        Manage Availability
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    )
}
