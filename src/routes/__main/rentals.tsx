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

export const Route = createFileRoute('/__main/rentals')({
    component: RentalsComponent,
})

const MOCK_PROPERTIES = [
    {
        id: '1',
        title: 'Sea View Villa',
        location: 'Coastal Avenue, Riviera',
        details: '4 Beds • 3 Baths • 250m²',
        price: '$220',
        period: '/Night',
        status: 'Active',
        imageUrl: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&q=80&w=800',
    },
    {
        id: '2',
        title: 'Mountain Retreat',
        location: 'Highland Park, Aspen',
        details: '3 Beds • 2 Baths • 180m²',
        price: '$180',
        period: '/Night',
        status: 'Active',
        imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800',
    },
    {
        id: '3',
        title: 'Urban Oasis Penthouse',
        location: 'Downtown Metro District',
        details: '2 Beds • 2 Baths • 140m²',
        price: '$350',
        period: '/Night',
        status: 'Active',
        imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800',
    },
]

function RentalsComponent() {
    const [searchQuery, setSearchQuery] = useState('')
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [editingProperty, setEditingProperty] = useState<typeof MOCK_PROPERTIES[0] | null>(null)
    const [selectedProperty, setSelectedProperty] = useState<typeof MOCK_PROPERTIES[0] | null>(null)

    const form = useForm({
        defaultValues: {
            propertyName: '',
            location: '',
            totalRooms: '',
            totalBathroom: '',
            parkingAvailable: '',
            propertySize: '',
            price: '',
            amenities: [] as string[],
            checkInPolicy: '',
            checkOutPolicy: '',
            cancellationPolicy: '',
            description: '',
        },
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <PageHeader
                    title="Rentals"
                    description="Manage your Rentals"
                />
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <SearchInput
                        placeholder="Search properties..."
                        value={searchQuery}
                        onValueChange={setSearchQuery}
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

            <div className="flex flex-col gap-8 min-h-screen">
                {/* Properties Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
                    {MOCK_PROPERTIES.filter(property => {
                        const query = searchQuery.toLowerCase()
                        return property.title.toLowerCase().includes(query) ||
                            property.location.toLowerCase().includes(query) ||
                            property.details.toLowerCase().includes(query)
                    }).map((property) => (
                        <div
                            key={property.id}
                            className="group bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-500 ease-out hover:-translate-y-1.5 flex flex-col relative"
                        >
                            {/* Image & Badges */}
                            <div className="relative w-full h-60 shrink-0 overflow-hidden bg-slate-100">
                                <img
                                    src={property.imageUrl}
                                    alt={property.title}
                                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                                />
                                {/* Subtle gradient overlay for better text contrast if needed */}
                                <div className="absolute inset-0 bg-linear-to-t from-slate-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                {/* Status Badge - Top Left */}
                                <div className="absolute top-4 left-4 z-10">
                                    <span className="bg-white/95 backdrop-blur-md text-[#243E8B] px-3.5 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest shadow-sm flex items-center gap-2 border border-white/20">
                                        <span className="relative flex h-1.5 w-1.5">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-600"></span>
                                        </span>
                                        {property.status}
                                    </span>
                                </div>

                                {/* Price Tag - Top Right */}
                                <div className="absolute top-4 right-4 z-10">
                                    <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-sm border border-white/20 flex items-baseline gap-0.5">
                                        <span className="text-[15px] font-black text-slate-900">{property.price}</span>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{property.period}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Details */}
                            <div className="p-6 flex flex-col gap-4 grow">
                                <div className="flex flex-col gap-2">
                                    <h3 className="text-[1.35rem] font-bold text-slate-900 tracking-tight group-hover:text-[#243E8B] transition-colors duration-300 leading-tight">
                                        {property.title}
                                    </h3>
                                    <div className="flex items-center gap-1.5 text-slate-500">
                                        <MapPin className="size-4 shrink-0 text-slate-400" />
                                        <span className="text-[13px] font-medium mt-0.5">{property.location}</span>
                                    </div>
                                </div>

                                {/* Property Specs */}
                                <div className="flex items-center gap-4 py-3.5 border-y border-slate-100 mt-1">
                                    <span className="text-[12px] font-semibold text-slate-600 tracking-wide">
                                        {property.details}
                                    </span>
                                </div>

                                {/* Actions Grid */}
                                <div className="grid grid-cols-2 gap-3 mt-auto pt-2">
                                    <Button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setEditingProperty(property)
                                            form.reset()
                                            form.setFieldValue('propertyName', property.title)
                                            form.setFieldValue('location', property.location)
                                            form.setFieldValue('price', property.price.replace('$', ''))
                                            setIsAddOpen(true)
                                        }}
                                        variant="outline"
                                        className="w-full gap-2 rounded-xl border-slate-200 text-slate-600 font-semibold h-11 hover:bg-slate-50 hover:text-[#243E8B] hover:border-[#243E8B]/30 transition-all duration-300 group/btn"
                                    >
                                        <Edit className="size-4 group-hover/btn:-rotate-12 transition-transform duration-300" />
                                        Edit
                                    </Button>
                                    <Button
                                        onClick={() => setSelectedProperty(property)}
                                        variant="default"
                                        className="w-full gap-2 rounded-xl bg-[#243E8B] text-white font-semibold h-11 hover:bg-[#1D3270] shadow-sm shadow-[#243E8B]/20 hover:shadow-md hover:shadow-[#243E8B]/30 transition-all duration-300 group/btn"
                                    >
                                        <Eye className="size-4 group-hover/btn:scale-110 transition-transform duration-300" />
                                        View
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
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
                        className="flex flex-col gap-5"
                    >
                        <form.Field
                            name="propertyName"
                            children={(field) => (
                                <div className="space-y-1.5">
                                    <Label className="font-semibold text-slate-800">Property Name</Label>
                                    <Input
                                        placeholder="Enter name"
                                        className="rounded-lg border-slate-200"
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                    />
                                </div>
                            )}
                        />

                        <form.Field
                            name="location"
                            children={(field) => (
                                <div className="space-y-1.5">
                                    <Label className="font-semibold text-slate-800">Location</Label>
                                    <Input
                                        placeholder="Enter location"
                                        className="rounded-lg border-slate-200"
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                    />
                                </div>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <form.Field
                                name="totalRooms"
                                children={(field) => (
                                    <div className="space-y-1.5">
                                        <Label className="font-semibold text-slate-800">Total Rooms</Label>
                                        <Input
                                            placeholder="Enter rooms"
                                            className="rounded-lg border-slate-200"
                                            value={field.state.value}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                        />
                                    </div>
                                )}
                            />
                            <form.Field
                                name="totalBathroom"
                                children={(field) => (
                                    <div className="space-y-1.5">
                                        <Label className="font-semibold text-slate-800">Total Bathroom</Label>
                                        <Input
                                            placeholder="Enter bathroom"
                                            className="rounded-lg border-slate-200"
                                            value={field.state.value}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                        />
                                    </div>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <form.Field
                                name="parkingAvailable"
                                children={(field) => (
                                    <div className="space-y-1.5">
                                        <Label className="font-semibold text-slate-800">Parking Available</Label>
                                        <Select value={field.state.value} onValueChange={field.handleChange}>
                                            <SelectTrigger className="rounded-lg border-slate-200 text-slate-500">
                                                <SelectValue placeholder="Select one" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="yes">Yes</SelectItem>
                                                <SelectItem value="no">No</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            />
                            <form.Field
                                name="propertySize"
                                children={(field) => (
                                    <div className="space-y-1.5">
                                        <Label className="font-semibold text-slate-800">Property Size</Label>
                                        <Input
                                            placeholder="Enter property size"
                                            className="rounded-lg border-slate-200"
                                            value={field.state.value}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                        />
                                    </div>
                                )}
                            />
                        </div>

                        <form.Field
                            name="price"
                            children={(field) => (
                                <div className="space-y-1.5">
                                    <Label className="font-semibold text-slate-800">Price</Label>
                                    <Input
                                        placeholder="Enter price"
                                        className="rounded-lg border-slate-200"
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                    />
                                </div>
                            )}
                        />

                        <div className="space-y-2 mt-2">
                            <Label className="font-semibold text-slate-800">Add Property Images</Label>
                            <div className="flex gap-3 overflow-x-auto pb-2">
                                <div className="h-28 w-32 shrink-0 rounded-xl overflow-hidden border">
                                    <img src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=300" alt="uploaded" className="w-full h-full object-cover" />
                                </div>
                                {[1, 2].map((i) => (
                                    <div key={i} className="h-28 w-32 shrink-0 rounded-xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-500 gap-1 hover:bg-slate-50 cursor-pointer">
                                        <Plus className="size-5" />
                                        <span className="text-[11px] font-bold">upload image</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <form.Field
                            name="amenities"
                            children={(field) => (
                                <div className="space-y-2 mt-2">
                                    <Label className="font-semibold text-slate-800">Add Property Amenities</Label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {['Free WiFi', 'Air Conditioning', 'Pool', 'Ocean View', 'Gym', 'Parking'].map((amenity) => {
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
                                                    <span className="text-sm text-slate-600">{amenity}</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        />

                        <form.Field
                            name="checkInPolicy"
                            children={(field) => (
                                <div className="space-y-1.5 mt-2">
                                    <Label className="font-semibold text-slate-800">Check in policies</Label>
                                    <Input
                                        placeholder="After 2 pm"
                                        className="rounded-lg border-slate-200"
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                    />
                                </div>
                            )}
                        />

                        <form.Field
                            name="checkOutPolicy"
                            children={(field) => (
                                <div className="space-y-1.5">
                                    <Label className="font-semibold text-slate-800">Check out policies</Label>
                                    <Input
                                        placeholder="Before 11 am"
                                        className="rounded-lg border-slate-200"
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                    />
                                </div>
                            )}
                        />

                        <form.Field
                            name="cancellationPolicy"
                            children={(field) => (
                                <div className="space-y-1.5 mt-2">
                                    <Label className="font-semibold text-slate-800">Cancellation Policy</Label>
                                    <Select value={field.state.value} onValueChange={field.handleChange}>
                                        <SelectTrigger className="rounded-lg border-slate-200 text-slate-500">
                                            <SelectValue placeholder="Flexible(Full refund up to 24h before)" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="flexible">Flexible(Full refund up to 24h before)</SelectItem>
                                            <SelectItem value="moderate">Moderate</SelectItem>
                                            <SelectItem value="strict">Strict</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        />

                        <form.Field
                            name="description"
                            children={(field) => (
                                <div className="space-y-1.5 mt-2">
                                    <Label className="font-semibold text-slate-800">Description</Label>
                                    <Textarea
                                        placeholder="Typing"
                                        className="rounded-lg border-slate-200 min-h-30"
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                    />
                                </div>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t">
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
                                            if (selectedProperty) {
                                                setEditingProperty(selectedProperty)
                                                form.reset()
                                                form.setFieldValue('propertyName', selectedProperty.title)
                                                form.setFieldValue('location', selectedProperty.location)
                                                form.setFieldValue('price', selectedProperty.price.replace('$', ''))
                                                setIsAddOpen(true)
                                                setSelectedProperty(null)
                                            }
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
