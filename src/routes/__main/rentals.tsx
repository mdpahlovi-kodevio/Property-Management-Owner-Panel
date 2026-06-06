import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { SearchInput } from '@/components/ui/search-input'
import { Plus, MapPin, Edit, Eye, CheckCircle2, XCircle, Building, ArrowRight } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { useForm } from '@tanstack/react-form'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { DataTableFooter } from '@/components/ui/data-table'
import { Switch } from '@/components/ui/switch'

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

const PROP_AMENITIES = ['WiFi', 'Parking', 'Pool', 'Spa', 'Gym', 'Restaurant', 'Bar', 'Airport shuttle', 'Elevator', 'Laundry', 'Pet friendly', 'Wheelchair accessible', '24-hr front desk', 'Business center']
const PROP_TABS = ['Basics', 'Location', 'Operations', 'Amenities', 'Policies', 'Media'] as const
type PropTab = typeof PROP_TABS[number]

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
            latitude: 0, longitude: 0,
            timezone: '',
            checkInTime: '', checkOutTime: '',
            amenities: [] as string[],
            policies: { smokingAllowed: false, petsAllowed: false, childrenAllowed: false, partiesAllowed: false },
            minGuestAge: undefined as number | undefined,
            securityDeposit: undefined as number | undefined,
            houseRules: '',
            logoUrl: '', videoUrl: '',
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

    const openAdd = () => { setEditingProperty(null); form.reset(); setActiveTab('Basics'); setIsAddOpen(true) }
    const openEdit = (property: typeof MOCK_PROPERTIES[0]) => {
        setEditingProperty(property)
        form.reset()
        form.setFieldValue('name', property.title)
        setActiveTab('Basics')
        setIsAddOpen(true)
    }

    return (
        <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <PageHeader title="Rentals" description="Manage your Rentals" />
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <SearchInput
                        placeholder="Search properties..."
                        value={searchQuery}
                        onValueChange={(val) => { setSearchQuery(val); setCurrentPage(1) }}
                        className="w-full sm:w-[320px]"
                    />
                    <Button onClick={openAdd} className="w-full sm:w-auto">
                        <Plus className="size-4 mr-2" />
                        Add Property
                    </Button>
                </div>
            </div>

            <div className="flex flex-col gap-8 mt-6">
                {(() => {
                    const filteredProperties = MOCK_PROPERTIES.filter(p => {
                        const q = searchQuery.toLowerCase()
                        return p.title.toLowerCase().includes(q) || p.location.toLowerCase().includes(q) || p.details.toLowerCase().includes(q)
                    })
                    const paginated = filteredProperties.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
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
                                            <img src={property.imageUrl} alt={property.title} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" />
                                            <div className="absolute inset-0 bg-linear-to-t from-slate-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                            {/* Price tag */}
                                            <div className="absolute top-3 right-3 z-10">
                                                <div className="bg-white/95 px-2.5 py-1 rounded-xl shadow-sm border border-white/20 flex items-baseline gap-0.5">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mr-0.5">{property.period}</span>
                                                    <span className="text-[15px] font-black text-slate-900">{property.price}</span>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Details */}
                                        <div className="p-4 flex flex-col gap-3 grow">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-start justify-between gap-2">
                                                    <h3 className="text-[1rem] font-bold text-slate-900 tracking-tight group-hover:text-[#243E8B] transition-colors duration-300 leading-tight">
                                                        {property.title}
                                                    </h3>
                                                    <span className={`shrink-0 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest flex items-center gap-1 border ${property.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60' : 'bg-amber-50 text-amber-700 border-amber-200/60'}`}>
                                                        <span className="relative flex h-1.5 w-1.5">
                                                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${property.status === 'Active' ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                                                            <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${property.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                                                        </span>
                                                        {property.status}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col gap-1.5">
                                                    <div className="flex items-center gap-2 text-slate-500">
                                                        <MapPin className="size-3.5 shrink-0 text-slate-400" />
                                                        <span className="text-[12.5px] font-medium leading-none truncate">{property.location}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-slate-500">
                                                        <Building className="size-3.5 shrink-0 text-slate-400" />
                                                        <span className="text-[12.5px] font-semibold text-slate-600 tracking-wide leading-none truncate">{property.details}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Actions */}
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
                                                    variant="default"
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
                                total={filteredProperties.length}
                                onPageChange={setCurrentPage}
                                onLimitChange={(limit) => { setItemsPerPage(limit); setCurrentPage(1) }}
                                limitOptions={[4, 8, 12, 24]}
                                noun="properties"
                            />
                        </>
                    )
                })()}
            </div>

            {/* ── CREATE / EDIT PROPERTY DIALOG ── */}
            <Dialog open={isAddOpen} onOpenChange={(open) => { setIsAddOpen(open); if (!open) setEditingProperty(null) }}>
                <DialogContent className="w-[95vw] sm:max-w-2xl flex flex-col p-0 rounded-2xl overflow-hidden max-h-[90vh] gap-0 bg-white">

                    {/* Header */}
                    <DialogHeader className="flex-row items-center gap-3 px-5 py-4 border-b border-slate-100 shrink-0 space-y-0">
                        <div className="h-7 w-7 rounded-lg bg-[#243E8B]/10 flex items-center justify-center shrink-0">
                            <Building className="size-3.5 text-[#243E8B]" />
                        </div>
                        <DialogTitle className="text-[14px] font-semibold text-slate-900 flex-1">
                            {editingProperty ? 'Edit property' : 'Create property'}
                        </DialogTitle>
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                            {editingProperty ? 'Editing' : 'New'}
                        </span>
                        <DialogDescription className="sr-only">Property form</DialogDescription>
                    </DialogHeader>

                    {/* Tab bar */}
                    <div className="flex border-b border-slate-100 bg-white overflow-x-auto shrink-0">
                        {PROP_TABS.map(tab => (
                            <button
                                key={tab}
                                type="button"
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 min-w-fit px-4 py-2.5 text-[12.5px] font-medium whitespace-nowrap border-b-2 transition-all ${activeTab === tab ? 'border-[#243E8B] text-[#243E8B] bg-[#EEF3FF]/40' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Panel content */}
                    <form
                        onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); form.handleSubmit() }}
                        className="flex flex-col flex-1 min-h-0"
                    >
                        <div className="flex-1 overflow-y-auto px-5 py-5 min-h-0">

                            {/* ── BASICS ── */}
                            {activeTab === 'Basics' && (
                                <div className="flex flex-col gap-6">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                                            <span className="h-px flex-1 bg-slate-100" />Basic Information<span className="h-px flex-1 bg-slate-100" />
                                        </p>
                                        <div className="flex flex-col gap-3">
                                            <form.Field name="name" children={(field) => (
                                                <div className="flex flex-col gap-1.5">
                                                    <Label className="text-[12px] font-medium text-slate-600">Property name <span className="text-red-500">*</span></Label>
                                                    <Input placeholder="e.g. Seaside Villa Bali" className="h-9 rounded-lg border-slate-200 text-[13px]" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                                </div>
                                            )} />
                                            <div className="grid grid-cols-2 gap-3">
                                                <form.Field name="propertyType" children={(field) => (
                                                    <div className="flex flex-col gap-1.5">
                                                        <Label className="text-[12px] font-medium text-slate-600">Property type <span className="text-red-500">*</span></Label>
                                                        <Select value={field.state.value} onValueChange={field.handleChange}>
                                                            <SelectTrigger className="h-9 rounded-lg border-slate-200 text-[13px] text-slate-600 bg-white">
                                                                <SelectValue placeholder="Select type" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {['Hotel', 'Apartment', 'Villa', 'Resort', 'Guest House', 'Hostel', 'Homestay', 'Vacation Rental', 'Serviced Apartment', 'Boutique Hotel'].map(t => (
                                                                    <SelectItem key={t} value={t.toLowerCase().replace(/ /g, '-')}>{t}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                )} />
                                                <div className="flex flex-col gap-1.5">
                                                    <Label className="text-[12px] font-medium text-slate-600">Status <span className="text-red-500">*</span></Label>
                                                    <Select defaultValue="active">
                                                        <SelectTrigger className="h-9 rounded-lg border-slate-200 text-[13px] text-slate-600 bg-white">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="active">Active</SelectItem>
                                                            <SelectItem value="inactive">Inactive</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                            <form.Field name="description" children={(field) => (
                                                <div className="flex flex-col gap-1.5">
                                                    <Label className="text-[12px] font-medium text-slate-600">Description <span className="text-red-500">*</span></Label>
                                                    <Textarea placeholder="Describe your property for guests and OTA listings..." className="min-h-[80px] rounded-lg border-slate-200 text-[13px] resize-none" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                                </div>
                                            )} />
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                                            <span className="h-px flex-1 bg-slate-100" />Contact Information<span className="h-px flex-1 bg-slate-100" />
                                        </p>
                                        <div className="grid grid-cols-3 gap-3">
                                            <form.Field name="email" children={(field) => (
                                                <div className="flex flex-col gap-1.5">
                                                    <Label className="text-[12px] font-medium text-slate-600">Email <span className="text-red-500">*</span></Label>
                                                    <Input type="email" placeholder="info@property.com" className="h-9 rounded-lg border-slate-200 text-[13px]" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                                </div>
                                            )} />
                                            <form.Field name="phone" children={(field) => (
                                                <div className="flex flex-col gap-1.5">
                                                    <Label className="text-[12px] font-medium text-slate-600">Phone <span className="text-red-500">*</span></Label>
                                                    <Input type="tel" placeholder="+1 234 567 8900" className="h-9 rounded-lg border-slate-200 text-[13px]" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                                </div>
                                            )} />
                                            <form.Field name="website" children={(field) => (
                                                <div className="flex flex-col gap-1.5">
                                                    <Label className="text-[12px] font-medium text-slate-600">Website</Label>
                                                    <Input type="url" placeholder="https://..." className="h-9 rounded-lg border-slate-200 text-[13px]" value={field.state.value || ''} onChange={(e) => field.handleChange(e.target.value)} />
                                                </div>
                                            )} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ── LOCATION ── */}
                            {activeTab === 'Location' && (
                                <div className="flex flex-col gap-6">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                                            <span className="h-px flex-1 bg-slate-100" />Address<span className="h-px flex-1 bg-slate-100" />
                                        </p>
                                        <div className="flex flex-col gap-3">
                                            <div className="grid grid-cols-2 gap-3">
                                                <form.Field name="country" children={(field) => (
                                                    <div className="flex flex-col gap-1.5">
                                                        <Label className="text-[12px] font-medium text-slate-600">Country <span className="text-red-500">*</span></Label>
                                                        <Select value={field.state.value} onValueChange={field.handleChange}>
                                                            <SelectTrigger className="h-9 rounded-lg border-slate-200 text-[13px] text-slate-600 bg-white">
                                                                <SelectValue placeholder="Select country" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {['Bangladesh', 'United States', 'United Kingdom', 'Indonesia', 'Thailand', 'France', 'Spain', 'Australia', 'Japan'].map(c => (
                                                                    <SelectItem key={c} value={c}>{c}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                )} />
                                                <form.Field name="state" children={(field) => (
                                                    <div className="flex flex-col gap-1.5">
                                                        <Label className="text-[12px] font-medium text-slate-600">State / Province</Label>
                                                        <Input placeholder="e.g. Bali" className="h-9 rounded-lg border-slate-200 text-[13px]" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                                    </div>
                                                )} />
                                                <form.Field name="city" children={(field) => (
                                                    <div className="flex flex-col gap-1.5">
                                                        <Label className="text-[12px] font-medium text-slate-600">City <span className="text-red-500">*</span></Label>
                                                        <Input placeholder="e.g. Seminyak" className="h-9 rounded-lg border-slate-200 text-[13px]" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                                    </div>
                                                )} />
                                                <form.Field name="postalCode" children={(field) => (
                                                    <div className="flex flex-col gap-1.5">
                                                        <Label className="text-[12px] font-medium text-slate-600">Postal code</Label>
                                                        <Input placeholder="80361" className="h-9 rounded-lg border-slate-200 text-[13px]" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                                    </div>
                                                )} />
                                            </div>
                                            <form.Field name="address1" children={(field) => (
                                                <div className="flex flex-col gap-1.5">
                                                    <Label className="text-[12px] font-medium text-slate-600">Address line 1 <span className="text-red-500">*</span></Label>
                                                    <Input placeholder="Street address" className="h-9 rounded-lg border-slate-200 text-[13px]" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                                </div>
                                            )} />
                                            <form.Field name="address2" children={(field) => (
                                                <div className="flex flex-col gap-1.5">
                                                    <Label className="text-[12px] font-medium text-slate-600">Address line 2</Label>
                                                    <Input placeholder="Apartment, suite, unit (optional)" className="h-9 rounded-lg border-slate-200 text-[13px]" value={field.state.value || ''} onChange={(e) => field.handleChange(e.target.value)} />
                                                </div>
                                            )} />
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                                            <span className="h-px flex-1 bg-slate-100" />Coordinates<span className="h-px flex-1 bg-slate-100" />
                                        </p>
                                        <div className="grid grid-cols-2 gap-3">
                                            <form.Field name="latitude" children={(field) => (
                                                <div className="flex flex-col gap-1.5">
                                                    <Label className="text-[12px] font-medium text-slate-600">Latitude</Label>
                                                    <Input type="number" step="any" placeholder="-8.691195" className="h-9 rounded-lg border-slate-200 text-[13px]" value={field.state.value || ''} onChange={(e) => field.handleChange(parseFloat(e.target.value) || 0)} />
                                                    <p className="text-[11px] text-slate-400">Auto-fill from address recommended</p>
                                                </div>
                                            )} />
                                            <form.Field name="longitude" children={(field) => (
                                                <div className="flex flex-col gap-1.5">
                                                    <Label className="text-[12px] font-medium text-slate-600">Longitude</Label>
                                                    <Input type="number" step="any" placeholder="115.167820" className="h-9 rounded-lg border-slate-200 text-[13px]" value={field.state.value || ''} onChange={(e) => field.handleChange(parseFloat(e.target.value) || 0)} />
                                                </div>
                                            )} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ── OPERATIONS ── */}
                            {activeTab === 'Operations' && (
                                <div className="flex flex-col gap-6">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                                            <span className="h-px flex-1 bg-slate-100" />Check-in / Check-out<span className="h-px flex-1 bg-slate-100" />
                                        </p>
                                        <div className="grid grid-cols-2 gap-3">
                                            <form.Field name="checkInTime" children={(field) => (
                                                <div className="flex flex-col gap-1.5">
                                                    <Label className="text-[12px] font-medium text-slate-600">Check-in time <span className="text-red-500">*</span></Label>
                                                    <Input type="time" defaultValue="14:00" className="h-9 rounded-lg border-slate-200 text-[13px]" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                                </div>
                                            )} />
                                            <form.Field name="checkOutTime" children={(field) => (
                                                <div className="flex flex-col gap-1.5">
                                                    <Label className="text-[12px] font-medium text-slate-600">Check-out time <span className="text-red-500">*</span></Label>
                                                    <Input type="time" defaultValue="11:00" className="h-9 rounded-lg border-slate-200 text-[13px]" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                                </div>
                                            )} />
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                                            <span className="h-px flex-1 bg-slate-100" />Timezone<span className="h-px flex-1 bg-slate-100" />
                                        </p>
                                        <div className="max-w-xs">
                                            <form.Field name="timezone" children={(field) => (
                                                <div className="flex flex-col gap-1.5">
                                                    <Label className="text-[12px] font-medium text-slate-600">Property timezone <span className="text-red-500">*</span></Label>
                                                    <Select value={field.state.value} onValueChange={field.handleChange}>
                                                        <SelectTrigger className="h-9 rounded-lg border-slate-200 text-[13px] text-slate-600 bg-white">
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
                                                </div>
                                            )} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ── AMENITIES ── */}
                            {activeTab === 'Amenities' && (
                                <div className="flex flex-col gap-4">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                        <span className="h-px flex-1 bg-slate-100" />Property amenities<span className="h-px flex-1 bg-slate-100" />
                                    </p>
                                    <form.Field name="amenities" children={(field) => (
                                        <div className="flex flex-wrap gap-2">
                                            {PROP_AMENITIES.map((amenity) => {
                                                const isOn = field.state.value.includes(amenity)
                                                return (
                                                    <button
                                                        key={amenity}
                                                        type="button"
                                                        onClick={() => {
                                                            const cur = field.state.value
                                                            field.handleChange(isOn ? cur.filter(a => a !== amenity) : [...cur, amenity])
                                                        }}
                                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[12.5px] transition-all ${isOn ? 'border-[#243E8B] bg-[#EEF3FF] text-[#243E8B] font-semibold' : 'border-slate-200 text-slate-500 hover:border-slate-300 bg-white'}`}
                                                    >
                                                        {isOn && <CheckCircle2 className="size-3.5" />}
                                                        {amenity}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    )} />
                                </div>
                            )}

                            {/* ── POLICIES ── */}
                            {activeTab === 'Policies' && (
                                <div className="flex flex-col gap-6">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                                            <span className="h-px flex-1 bg-slate-100" />Guest Policies<span className="h-px flex-1 bg-slate-100" />
                                        </p>
                                        <div className="rounded-xl border border-slate-100 overflow-hidden divide-y divide-slate-100">
                                            {([
                                                { name: 'policies.smokingAllowed' as const, label: 'Smoking allowed', sub: 'Guests may smoke on premises' },
                                                { name: 'policies.petsAllowed' as const, label: 'Pets allowed', sub: 'Guests may bring animals' },
                                                { name: 'policies.childrenAllowed' as const, label: 'Children allowed', sub: 'Under 18 permitted' },
                                                { name: 'policies.partiesAllowed' as const, label: 'Parties / events allowed', sub: 'Guests may host gatherings' },
                                            ] as const).map(policy => (
                                                <form.Field key={policy.name} name={policy.name} children={(f) => (
                                                    <div className="flex items-center justify-between px-4 py-3 bg-white hover:bg-slate-50/60 transition-colors">
                                                        <div>
                                                            <p className="text-[13px] font-medium text-slate-800">{policy.label}</p>
                                                            <p className="text-[11px] text-slate-400">{policy.sub}</p>
                                                        </div>
                                                        <Switch checked={f.state.value} onCheckedChange={f.handleChange} />
                                                    </div>
                                                )} />
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                                            <span className="h-px flex-1 bg-slate-100" />Fees & Rules<span className="h-px flex-1 bg-slate-100" />
                                        </p>
                                        <div className="flex flex-col gap-3">
                                            <div className="grid grid-cols-2 gap-3">
                                                <form.Field name="minGuestAge" children={(field) => (
                                                    <div className="flex flex-col gap-1.5">
                                                        <Label className="text-[12px] font-medium text-slate-600">Minimum guest age</Label>
                                                        <Input type="number" placeholder="18" min="0" className="h-9 rounded-lg border-slate-200 text-[13px]" value={field.state.value ?? ''} onChange={(e) => field.handleChange(e.target.value ? parseInt(e.target.value) : undefined)} />
                                                    </div>
                                                )} />
                                                <form.Field name="securityDeposit" children={(field) => (
                                                    <div className="flex flex-col gap-1.5">
                                                        <Label className="text-[12px] font-medium text-slate-600">Security deposit</Label>
                                                        <Input type="number" placeholder="0.00" min="0" step="0.01" className="h-9 rounded-lg border-slate-200 text-[13px]" value={field.state.value ?? ''} onChange={(e) => field.handleChange(e.target.value ? parseFloat(e.target.value) : undefined)} />
                                                    </div>
                                                )} />
                                            </div>
                                            <form.Field name="houseRules" children={(field) => (
                                                <div className="flex flex-col gap-1.5">
                                                    <Label className="text-[12px] font-medium text-slate-600">House rules</Label>
                                                    <Textarea placeholder="e.g. No loud music after 10pm..." className="min-h-[80px] rounded-lg border-slate-200 text-[13px] resize-none" value={field.state.value || ''} onChange={(e) => field.handleChange(e.target.value)} />
                                                </div>
                                            )} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ── MEDIA ── */}
                            {activeTab === 'Media' && (
                                <div className="flex flex-col gap-6">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                                            <span className="h-px flex-1 bg-slate-100" />Property Photos<span className="h-px flex-1 bg-slate-100" />
                                        </p>
                                        <div className="border border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center gap-2 cursor-pointer hover:border-[#243E8B]/50 hover:bg-[#EEF3FF]/20 transition-all">
                                            <div className="h-11 w-11 rounded-xl bg-slate-100 flex items-center justify-center">
                                                <Plus className="size-5 text-slate-400" />
                                            </div>
                                            <p className="text-[13px] font-medium text-slate-600">Click to upload or drag &amp; drop</p>
                                            <p className="text-[11px] text-slate-400">JPG, PNG, WEBP · max 10MB each</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                                            <span className="h-px flex-1 bg-slate-100" />Media URLs<span className="h-px flex-1 bg-slate-100" />
                                        </p>
                                        <div className="grid grid-cols-2 gap-3">
                                            <form.Field name="logoUrl" children={(field) => (
                                                <div className="flex flex-col gap-1.5">
                                                    <Label className="text-[12px] font-medium text-slate-600">Logo URL</Label>
                                                    <Input type="url" placeholder="https://..." className="h-9 rounded-lg border-slate-200 text-[13px]" value={field.state.value || ''} onChange={(e) => field.handleChange(e.target.value)} />
                                                </div>
                                            )} />
                                            <form.Field name="videoUrl" children={(field) => (
                                                <div className="flex flex-col gap-1.5">
                                                    <Label className="text-[12px] font-medium text-slate-600">Video / virtual tour URL</Label>
                                                    <Input type="url" placeholder="https://youtube.com/..." className="h-9 rounded-lg border-slate-200 text-[13px]" value={field.state.value || ''} onChange={(e) => field.handleChange(e.target.value)} />
                                                </div>
                                            )} />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
                            <Button type="button" variant="outline" onClick={() => { setIsAddOpen(false); setEditingProperty(null) }} className="h-9 px-5 rounded-lg font-medium text-[13px]">
                                Cancel
                            </Button>
                            <form.Subscribe
                                selector={(state) => [state.canSubmit, state.isSubmitting]}
                                children={([canSubmit, isSubmitting]) => (
                                    <Button type="submit" disabled={!canSubmit} className="h-9 px-5 rounded-lg font-semibold bg-[#243E8B] hover:bg-[#1D3270] text-white text-[13px]">
                                        {isSubmitting ? 'Saving...' : 'Save property'}
                                    </Button>
                                )}
                            />
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* ── VIEW PROPERTY DIALOG ── */}
            <Dialog open={!!selectedProperty} onOpenChange={(open) => !open && setSelectedProperty(null)}>
                <DialogContent className="w-[95%] sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-white p-6 rounded-3xl gap-0">
                    <DialogHeader className="mb-4 text-left">
                        <DialogTitle className="text-2xl font-bold">Property Details</DialogTitle>
                        <DialogDescription className="sr-only">Details for {selectedProperty?.title}</DialogDescription>
                    </DialogHeader>
                    {selectedProperty && (
                        <div className="flex flex-col gap-6">
                            <div className="relative h-56 w-full">
                                <img src={selectedProperty.imageUrl} alt={selectedProperty.title} className="w-full h-full object-cover rounded-2xl" />
                                <div className="absolute top-4 right-4 flex gap-2">
                                    <span className="bg-white/95 backdrop-blur-md text-[#243E8B] px-3 py-1.5 rounded text-[11px] font-bold shadow-sm">{selectedProperty.status}</span>
                                    <span className="bg-white/95 backdrop-blur-md text-[#243E8B] px-3 py-1.5 rounded text-[11px] font-bold shadow-sm">{selectedProperty.period} {selectedProperty.price}</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-5">
                                <div>
                                    <h2 className="text-[20px] font-bold text-slate-900">{selectedProperty.title}</h2>
                                    <div className="flex flex-col gap-1.5 mt-2">
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <MapPin className="size-3.5 text-slate-400" />
                                            <span className="text-[13px]">{selectedProperty.location}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <Building className="size-3.5 text-slate-400" />
                                            <span className="text-[13px] font-semibold text-slate-600">{selectedProperty.details}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {['Free WiFi', 'Air Conditioning', 'Pool', 'Parking'].map(a => (
                                        <div key={a} className="flex items-center gap-2">
                                            <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                                            <span className="text-[13px] text-slate-600 font-medium">{a}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="border rounded-2xl p-4 flex gap-3 items-center">
                                        <div className="bg-blue-50/80 p-2.5 rounded-xl text-blue-600 shrink-0 border border-blue-100">
                                            <ArrowRight className="size-4" />
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide block">Check-in</span>
                                            <span className="text-[13px] font-bold text-slate-800">After 3:00 PM</span>
                                        </div>
                                    </div>
                                    <div className="border rounded-2xl p-4 flex gap-3 items-center">
                                        <div className="bg-red-50/80 p-2.5 rounded-xl text-red-500 shrink-0 border border-red-100">
                                            <XCircle className="size-4" />
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide block">Check-out</span>
                                            <span className="text-[13px] font-bold text-slate-800">Before 11:00 AM</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <Button
                                        variant="outline"
                                        onClick={() => { openEdit(selectedProperty); setSelectedProperty(null) }}
                                        className="rounded-xl h-11 font-bold border-slate-200 text-slate-700"
                                    >
                                        Edit Property
                                    </Button>
                                    <Button className="rounded-xl h-11 font-bold bg-[#DCE6F5] text-[#243E8B] hover:bg-[#DCE6F5]/80">
                                        Manage Availability
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    )
}
