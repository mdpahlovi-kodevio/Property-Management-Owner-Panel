import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { SearchInput } from '@/components/ui/search-input'
import { Plus, MapPin, Edit, Eye, Circle, CheckCircle2, ArrowRight, XCircle } from 'lucide-react'
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
    name: string;
    propertyType: string;
    description: string;

    email: string;
    phone: string;

    country: string;
    state: string;
    city: string;
    postalCode: string;

    address1: string;
    address2?: string;

    latitude: number;
    longitude: number;

    timezone: string;

    checkInTime: string;
    checkOutTime: string;

    amenities: string[];

    policies: {
        smokingAllowed: boolean;
        petsAllowed: boolean;
        childrenAllowed: boolean;
        partiesAllowed: boolean;
    };

    images: File[];
};

export const Route = createFileRoute('/__main/rentals')({
    component: RentalsComponent,
})

const MOCK_PROPERTIES = [
    {
        id: "1",
        title: "Sea View Villa",
        location: "Coastal Avenue, Riviera",
        details: "4 Beds • 3 Baths • 250m²",
        price: "$120",
        period: "/Night",
        status: "Active",
        imageUrl: "https://picsum.photos/seed/prop1/800/600"
    },
    {
        id: "2",
        title: "Mountain Retreat",
        location: "Highland Park, Aspen",
        details: "3 Beds • 2 Baths • 180m²",
        price: "$90",
        period: "/Night",
        status: "Active",
        imageUrl: "https://picsum.photos/seed/prop2/800/600"
    },
    {
        id: "3",
        title: "Urban Oasis Penthouse",
        location: "Downtown Metro District",
        details: "2 Beds • 2 Baths • 120m²",
        price: "$150",
        period: "/Night",
        status: "Maintenance",
        imageUrl: "https://picsum.photos/seed/prop3/800/600"
    },
    {
        id: "4",
        title: "Cozy Cottage",
        location: "Quiet Suburbia",
        details: "3 Beds • 1 Bath • 100m²",
        price: "$70",
        period: "/Night",
        status: "Active",
        imageUrl: "https://picsum.photos/seed/prop4/800/600"
    },
    {
        id: "5",
        title: "Luxury Apartment",
        location: "City Center",
        details: "1 Bed • 1 Bath • 80m²",
        price: "$110",
        period: "/Night",
        status: "Active",
        imageUrl: "https://picsum.photos/seed/prop5/800/600"
    },
    {
        id: "6",
        title: "Beachfront House",
        location: "Sunny Beach",
        details: "5 Beds • 4 Baths • 300m²",
        price: "$200",
        period: "/Night",
        status: "Active",
        imageUrl: "https://picsum.photos/seed/prop6/800/600"
    },
    {
        id: "7",
        title: "Modern Loft",
        location: "Arts District",
        details: "1 Bed • 1.5 Baths • 95m²",
        price: "$95",
        period: "/Night",
        status: "Active",
        imageUrl: "https://picsum.photos/seed/prop7/800/600"
    },
    {
        id: "8",
        title: "Rustic Cabin",
        location: "Pine Grove",
        details: "2 Beds • 1 Bath • 85m²",
        price: "$65",
        period: "/Night",
        status: "Maintenance",
        imageUrl: "https://picsum.photos/seed/prop8/800/600"
    },
    {
        id: "9",
        title: "Riverside Estate",
        location: "Valley Edge",
        details: "4 Beds • 3 Baths • 280m²",
        price: "$180",
        period: "/Night",
        status: "Active",
        imageUrl: "https://picsum.photos/seed/prop9/800/600"
    },
    {
        id: "10",
        title: "Skyview Condo",
        location: "Uptown Core",
        details: "2 Beds • 2 Baths • 110m²",
        price: "$135",
        period: "/Night",
        status: "Active",
        imageUrl: "https://picsum.photos/seed/prop10/800/600"
    },
    {
        id: "11",
        title: "Desert Villa",
        location: "Canyon Ridge",
        details: "3 Beds • 2.5 Baths • 210m²",
        price: "$145",
        period: "/Night",
        status: "Active",
        imageUrl: "https://picsum.photos/seed/prop11/800/600"
    },
    {
        id: "12",
        title: "Historic Townhouse",
        location: "Old Town Square",
        details: "3 Beds • 2 Baths • 160m²",
        price: "$115",
        period: "/Night",
        status: "Maintenance",
        imageUrl: "https://picsum.photos/seed/prop12/800/600"
    }
]

function RentalsComponent() {
    const [searchQuery, setSearchQuery] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(4)
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [editingProperty, setEditingProperty] = useState<typeof MOCK_PROPERTIES[0] | null>(null)
    const [selectedProperty, setSelectedProperty] = useState<typeof MOCK_PROPERTIES[0] | null>(null)

    const form = useForm({
        defaultValues: {
            name: '',
            propertyType: '',
            description: '',
            email: '',
            phone: '',
            country: '',
            state: '',
            city: '',
            postalCode: '',
            address1: '',
            address2: '',
            latitude: 0,
            longitude: 0,
            timezone: '',
            checkInTime: '',
            checkOutTime: '',
            amenities: [] as string[],
            policies: {
                smokingAllowed: false,
                petsAllowed: false,
                childrenAllowed: false,
                partiesAllowed: false,
            },
            images: [] as File[],
        } as CreatePropertyForm,
        onSubmit: async ({ value }) => {
            console.log('Submitted values:', value)
            toast.success('Property saved successfully!')
            setIsAddOpen(false)
            setEditingProperty(null)
            form.reset()
        }
    })

    const toggleAmenity = (name: string) => {
        const current = form.getFieldValue('amenities')
        form.setFieldValue('amenities', current.includes(name) ? current.filter(a => a !== name) : [...current, name])
    }

    return (
        <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <PageHeader
                    title="Rentals"
                    description="Manage your Rentals"
                />
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <SearchInput
                        placeholder="Search properties..."
                        value={searchQuery}
                        onValueChange={(val) => {
                            setSearchQuery(val)
                            setCurrentPage(1)
                        }}
                        className="w-full sm:w-[320px]"
                    />
                    <Button
                        onClick={() => {
                            setEditingProperty(null)
                            form.reset()
                            setIsAddOpen(true)
                        }}
                        className="w-full sm:w-auto"
                    >
                        <Plus className="size-4 mr-2" />
                        Add Property
                    </Button>
                </div>
            </div>
            <div className="flex flex-col gap-8">
                {(() => {
                    const filteredProperties = MOCK_PROPERTIES.filter(property => {
                        const query = searchQuery.toLowerCase()
                        return property.title.toLowerCase().includes(query) ||
                            property.location.toLowerCase().includes(query) ||
                            property.details.toLowerCase().includes(query)
                    })
                    const paginatedProperties = filteredProperties.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

                    return (
                        <>
                            {/* Properties Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4.5">
                                {paginatedProperties.map((property) => (
                                    <div
                                        key={property.id}
                                        className="group h-full bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-500 ease-out hover:-translate-y-1.5 flex flex-col relative"
                                    >
                                        {/* Image & Badges */}
                                        <div className="relative w-full aspect-video shrink-0 overflow-hidden bg-slate-100">
                                            <img
                                                src={property.imageUrl}
                                                alt={property.title}
                                                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                                            />
                                            {/* Subtle gradient overlay for better text contrast if needed */}
                                            <div className="absolute inset-0 bg-linear-to-t from-slate-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />


                                            {/* Price Tag - Top Right */}
                                            <div className="absolute top-3 right-3 z-10">
                                                <div className="bg-white/95 px-3 py-1.5 rounded-2xl shadow-sm border border-white/20 flex items-baseline gap-0.5">
                                                    <span className="text-[15px] font-black text-slate-900">{property.price}</span>
                                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{property.period}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Details */}
                                        <div className="p-4 flex flex-col gap-3 grow">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center justify-between gap-2">
                                                    <h3 className="text-[1.1rem] font-bold text-slate-900 tracking-tight group-hover:text-[#243E8B] transition-colors duration-300 leading-tight truncate">
                                                        {property.title}
                                                    </h3>
                                                    <span className={`shrink-0 px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-widest flex items-center gap-1.5 border ${property.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60' : 'bg-amber-50 text-amber-700 border-amber-200/60'}`}>
                                                        <span className="relative flex h-1.5 w-1.5">
                                                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${property.status === 'Active' ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                                                            <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${property.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                                                        </span>
                                                        {property.status}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-slate-500">
                                                    <MapPin className="size-3.5 shrink-0 text-slate-400" />
                                                    <span className="text-[12px] font-medium mt-0.5 truncate">
                                                        {property.location} <span className="mx-1.5 text-slate-300">•</span> <span className="text-[11px] font-semibold text-slate-600 tracking-wide">{property.details}</span>
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Actions Grid */}
                                            <div className="grid grid-cols-2 gap-2 mt-auto pt-1">
                                                <Button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        setEditingProperty(property)
                                                        form.reset()
                                                        form.setFieldValue('name', property.title)
                                                        setIsAddOpen(true)
                                                    }}
                                                    variant="outline"
                                                    className="w-full gap-1.5 rounded-xl border-slate-200 text-slate-600 font-semibold h-9 hover:bg-slate-50 hover:text-[#243E8B] hover:border-[#243E8B]/30 transition-all duration-300 group/btn text-[13px]"
                                                >
                                                    <Edit className="size-3.5 group-hover/btn:-rotate-12 transition-transform duration-300" />
                                                    Edit
                                                </Button>
                                                <Button
                                                    onClick={() => setSelectedProperty(property)}
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

                            {/* Pagination Controls */}
                            <DataTableFooter
                                page={currentPage}
                                limit={itemsPerPage}
                                total={filteredProperties.length}
                                onPageChange={setCurrentPage}
                                onLimitChange={(limit) => {
                                    setItemsPerPage(limit)
                                    setCurrentPage(1)
                                }}
                                limitOptions={[4, 8, 12, 24]}
                                noun="properties"
                            />
                        </>
                    )
                })()}
            </div>

            {/* Add Property Dialog */}
            <Dialog open={isAddOpen} onOpenChange={(open) => {
                setIsAddOpen(open)
                if (!open) setEditingProperty(null)
            }}>
                <DialogContent className="w-[95%] sm:max-w-137.5 max-h-[90vh] overflow-y-auto bg-white p-6 rounded-3xl">
                    <DialogHeader className="mb-4 text-left">
                        <DialogTitle className="text-xl font-bold">{editingProperty ? 'Edit Property' : 'Add New Property'}</DialogTitle>
                        <DialogDescription className="text-sm text-slate-500">Drag and drop your files here</DialogDescription>
                    </DialogHeader>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            form.handleSubmit()
                        }}
                        className="flex flex-col gap-6"
                    >
                        {/* Basic Info */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-slate-900 border-b pb-2">Basic Information</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <form.Field name="name" children={(field) => (
                                    <div className="space-y-1.5">
                                        <Label className="font-semibold text-slate-800">Property Name</Label>
                                        <Input placeholder="Enter name" className="rounded-lg border-slate-200" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                    </div>
                                )} />
                                <form.Field name="propertyType" children={(field) => (
                                    <div className="space-y-1.5">
                                        <Label className="font-semibold text-slate-800">Property Type</Label>
                                        <Select value={field.state.value} onValueChange={field.handleChange}>
                                            <SelectTrigger className="rounded-lg border-slate-200 text-slate-500">
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="apartment">Apartment</SelectItem>
                                                <SelectItem value="house">House</SelectItem>
                                                <SelectItem value="villa">Villa</SelectItem>
                                                <SelectItem value="cabin">Cabin</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )} />
                            </div>
                            <form.Field name="description" children={(field) => (
                                <div className="space-y-1.5">
                                    <Label className="font-semibold text-slate-800">Description</Label>
                                    <Textarea placeholder="Describe the property" className="rounded-lg border-slate-200 min-h-24" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                </div>
                            )} />
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-slate-900 border-b pb-2">Contact Information</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <form.Field name="email" children={(field) => (
                                    <div className="space-y-1.5">
                                        <Label className="font-semibold text-slate-800">Email</Label>
                                        <Input type="email" placeholder="Contact email" className="rounded-lg border-slate-200" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                    </div>
                                )} />
                                <form.Field name="phone" children={(field) => (
                                    <div className="space-y-1.5">
                                        <Label className="font-semibold text-slate-800">Phone</Label>
                                        <Input placeholder="Contact phone number" className="rounded-lg border-slate-200" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                    </div>
                                )} />
                            </div>
                        </div>

                        {/* Location */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-slate-900 border-b pb-2">Location Details</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <form.Field name="country" children={(field) => (
                                    <div className="space-y-1.5">
                                        <Label className="font-semibold text-slate-800">Country</Label>
                                        <Input placeholder="Country" className="rounded-lg border-slate-200" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                    </div>
                                )} />
                                <form.Field name="state" children={(field) => (
                                    <div className="space-y-1.5">
                                        <Label className="font-semibold text-slate-800">State/Province</Label>
                                        <Input placeholder="State" className="rounded-lg border-slate-200" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                    </div>
                                )} />
                                <form.Field name="city" children={(field) => (
                                    <div className="space-y-1.5">
                                        <Label className="font-semibold text-slate-800">City</Label>
                                        <Input placeholder="City" className="rounded-lg border-slate-200" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                    </div>
                                )} />
                                <form.Field name="postalCode" children={(field) => (
                                    <div className="space-y-1.5">
                                        <Label className="font-semibold text-slate-800">Postal Code</Label>
                                        <Input placeholder="Postal code" className="rounded-lg border-slate-200" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                    </div>
                                )} />
                            </div>
                            <form.Field name="address1" children={(field) => (
                                <div className="space-y-1.5">
                                    <Label className="font-semibold text-slate-800">Address Line 1</Label>
                                    <Input placeholder="Street address" className="rounded-lg border-slate-200" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                </div>
                            )} />
                            <form.Field name="address2" children={(field) => (
                                <div className="space-y-1.5">
                                    <Label className="font-semibold text-slate-800">Address Line 2 (Optional)</Label>
                                    <Input placeholder="Apt, suite, etc." className="rounded-lg border-slate-200" value={field.state.value || ''} onChange={(e) => field.handleChange(e.target.value)} />
                                </div>
                            )} />
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <form.Field name="latitude" children={(field) => (
                                    <div className="space-y-1.5">
                                        <Label className="font-semibold text-slate-800">Latitude</Label>
                                        <Input type="number" step="any" placeholder="0.0000" className="rounded-lg border-slate-200" value={field.state.value} onChange={(e) => field.handleChange(parseFloat(e.target.value) || 0)} />
                                    </div>
                                )} />
                                <form.Field name="longitude" children={(field) => (
                                    <div className="space-y-1.5">
                                        <Label className="font-semibold text-slate-800">Longitude</Label>
                                        <Input type="number" step="any" placeholder="0.0000" className="rounded-lg border-slate-200" value={field.state.value} onChange={(e) => field.handleChange(parseFloat(e.target.value) || 0)} />
                                    </div>
                                )} />
                                <form.Field name="timezone" children={(field) => (
                                    <div className="space-y-1.5">
                                        <Label className="font-semibold text-slate-800">Timezone</Label>
                                        <Input placeholder="e.g. America/New_York" className="rounded-lg border-slate-200" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                    </div>
                                )} />
                            </div>
                        </div>

                        {/* Scheduling & Policies */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-slate-900 border-b pb-2">Scheduling & Policies</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <form.Field name="checkInTime" children={(field) => (
                                    <div className="space-y-1.5">
                                        <Label className="font-semibold text-slate-800">Check-in Time</Label>
                                        <Input type="time" className="rounded-lg border-slate-200" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                    </div>
                                )} />
                                <form.Field name="checkOutTime" children={(field) => (
                                    <div className="space-y-1.5">
                                        <Label className="font-semibold text-slate-800">Check-out Time</Label>
                                        <Input type="time" className="rounded-lg border-slate-200" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                    </div>
                                )} />
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                                <form.Field name="policies.smokingAllowed" children={(field) => (
                                    <div className="flex items-center gap-2">
                                        <Switch checked={field.state.value} onCheckedChange={field.handleChange} />
                                        <Label className="font-medium text-slate-700 cursor-pointer">Smoking Allowed</Label>
                                    </div>
                                )} />
                                <form.Field name="policies.petsAllowed" children={(field) => (
                                    <div className="flex items-center gap-2">
                                        <Switch checked={field.state.value} onCheckedChange={field.handleChange} />
                                        <Label className="font-medium text-slate-700 cursor-pointer">Pets Allowed</Label>
                                    </div>
                                )} />
                                <form.Field name="policies.childrenAllowed" children={(field) => (
                                    <div className="flex items-center gap-2">
                                        <Switch checked={field.state.value} onCheckedChange={field.handleChange} />
                                        <Label className="font-medium text-slate-700 cursor-pointer">Children Allowed</Label>
                                    </div>
                                )} />
                                <form.Field name="policies.partiesAllowed" children={(field) => (
                                    <div className="flex items-center gap-2">
                                        <Switch checked={field.state.value} onCheckedChange={field.handleChange} />
                                        <Label className="font-medium text-slate-700 cursor-pointer">Parties Allowed</Label>
                                    </div>
                                )} />
                            </div>
                        </div>

                        {/* Amenities */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-slate-900 border-b pb-2">Amenities</h3>
                            <form.Field name="amenities" children={(field) => (
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                    {['Free WiFi', 'Air Conditioning', 'Pool', 'Ocean View', 'Gym', 'Parking', 'Kitchen', 'TV'].map((amenity) => {
                                        const isSelected = field.state.value.includes(amenity)
                                        return (
                                            <div
                                                key={amenity}
                                                onClick={() => toggleAmenity(amenity)}
                                                className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${isSelected ? 'border-[#243E8B] bg-[#E5F0FF]/50' : 'border-slate-200 hover:border-slate-300'}`}
                                            >
                                                {isSelected ? (
                                                    <CheckCircle2 className="size-4 text-[#243E8B]" />
                                                ) : (
                                                    <Circle className="size-4 text-slate-300" />
                                                )}
                                                <span className="text-sm text-slate-600 truncate">{amenity}</span>
                                            </div>
                                        )
                                    })}
                                </div>
                            )} />
                        </div>

                        {/* Images */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-slate-900 border-b pb-2">Images</h3>
                            <div className="flex gap-3 overflow-x-auto pb-2">
                                <div className="h-28 w-32 shrink-0 rounded-xl overflow-hidden border relative group">
                                    <img src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=300" alt="uploaded" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <XCircle className="size-6 text-white cursor-pointer" />
                                    </div>
                                </div>
                                {[1, 2].map((i) => (
                                    <div key={i} className="h-28 w-32 shrink-0 rounded-xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-500 gap-1 hover:bg-slate-50 cursor-pointer transition-colors">
                                        <Plus className="size-5" />
                                        <span className="text-[11px] font-bold">upload image</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="grid grid-cols-2 gap-4 mt-4 pt-6 border-t">
                            <Button type="button" variant="outline" onClick={() => {
                                setIsAddOpen(false)
                                setEditingProperty(null)
                            }} className="rounded-xl h-12 font-semibold">
                                Cancel
                            </Button>
                            <form.Subscribe
                                selector={(state) => [state.canSubmit, state.isSubmitting]}
                                children={([canSubmit, isSubmitting]) => (
                                    <Button
                                        type="submit"
                                        disabled={!canSubmit}
                                        className="rounded-xl h-12 font-semibold bg-[#243E8B] hover:bg-[#1D3270] text-white"
                                    >
                                        {isSubmitting ? (editingProperty ? 'Saving...' : 'Publishing...') : (editingProperty ? 'Save Changes' : 'Publish Property')}
                                    </Button>
                                )}
                            />
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* View Property Dialog */}
            <Dialog open={!!selectedProperty} onOpenChange={(open) => !open && setSelectedProperty(null)}>
                <DialogContent className="w-[95%] sm:max-w-137.5 max-h-[90vh] overflow-y-auto bg-white p-6 rounded-3xl gap-0">
                    <DialogHeader className="mb-4 text-left">
                        <DialogTitle className="text-2xl font-bold">Property Details</DialogTitle>
                        <DialogDescription className="sr-only">Details for {selectedProperty?.title}</DialogDescription>
                    </DialogHeader>

                    {selectedProperty && (
                        <div className="flex flex-col gap-6">
                            {/* Header Image */}
                            <div className="relative h-64 w-full">
                                <img src={selectedProperty.imageUrl} alt={selectedProperty.title} className="w-full h-full object-cover rounded-2xl" />
                                <div className="absolute top-4 right-4 flex gap-2">
                                    <span className="bg-white/95 backdrop-blur-md text-[#243E8B] px-3 py-1.5 rounded text-[11px] font-bold shadow-sm">
                                        {selectedProperty.status}
                                    </span>
                                    <span className="bg-white/95 backdrop-blur-md text-[#243E8B] px-3 py-1.5 rounded text-[11px] font-bold shadow-sm">
                                        {selectedProperty.price}{selectedProperty.period}
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-6">
                                <h2 className="text-[22px] font-bold text-slate-900 mt-2">{selectedProperty.title}</h2>

                                <div className="grid grid-cols-2 gap-y-4 gap-x-4">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                                        <span className="text-[13px] text-slate-600 font-medium">3 Bedroom</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                                        <span className="text-[13px] text-slate-600 font-medium">2 Bathroom</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                                        <span className="text-[13px] text-slate-600 font-medium">1 car parking</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                                        <span className="text-[13px] text-slate-600 font-medium">{selectedProperty.price}</span>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-2">
                                    <h3 className="text-lg font-bold text-slate-900">Amenities</h3>
                                    <div className="grid grid-cols-2 gap-y-4 gap-x-4">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                                            <span className="text-[13px] text-slate-600 font-medium">Free WiFi</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                                            <span className="text-[13px] text-slate-600 font-medium">Air Conditioning</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                                            <span className="text-[13px] text-slate-600 font-medium">Pool</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                                            <span className="text-[13px] text-slate-600 font-medium">Parking</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 pt-2">
                                    <h3 className="text-lg font-bold text-slate-900">Description</h3>
                                    <p className="text-[13px] text-slate-500 leading-relaxed font-medium">
                                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                                    <div className="space-y-3">
                                        <h3 className="text-[15px] font-bold text-slate-900">Check-in Policy</h3>
                                        <div className="border rounded-2xl p-4 flex gap-3 items-center">
                                            <div className="bg-blue-50/80 p-2.5 rounded-xl text-blue-600 shrink-0 border border-blue-100">
                                                <ArrowRight className="size-4" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Standard Entry</span>
                                                <span className="text-[13px] font-bold text-slate-800">After 3:00 PM</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <h3 className="text-[15px] font-bold text-slate-900">Cancellation Policy</h3>
                                        <div className="border rounded-2xl p-4 flex gap-3 items-center">
                                            <div className="bg-red-50/80 p-2.5 rounded-xl text-red-500 shrink-0 border border-red-100">
                                                <XCircle className="size-4" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Moderate</span>
                                                <span className="text-[11px] font-bold text-slate-800 leading-tight">(Full refund up to 24h before)</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mt-4">
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            // if (selectedProperty ) {
                                            setEditingProperty(selectedProperty)
                                            form.reset()
                                            form.setFieldValue('name', selectedProperty.title)
                                            setIsAddOpen(true)
                                            setSelectedProperty(null)
                                            // }
                                        }}
                                        className="rounded-xl h-12 font-bold text-red-500 border-red-100 bg-red-50 hover:bg-red-100 hover:text-red-600">
                                        Edit
                                    </Button>
                                    <Button className="rounded-xl h-12 font-bold bg-[#DCE6F5] text-[#243E8B] hover:bg-[#DCE6F5]/80">
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
