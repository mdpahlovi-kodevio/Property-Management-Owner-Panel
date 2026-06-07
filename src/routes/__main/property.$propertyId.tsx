import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { SearchInput } from '@/components/ui/search-input'
import { Plus, MapPin, Edit, Eye, ArrowLeft, CheckCircle2, BedDouble, Trash2, X, Info } from 'lucide-react'
import { DataTableFooter } from '@/components/ui/data-table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { useForm } from '@tanstack/react-form'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'

export type CreateRoomTypeForm = {
    name: string
    internalCode: string
    description: string
    basePrice: number
    weekendPrice: number
    extraPersonFee: number
    currency: string
    maxAdults: number
    maxChildren: number
    maxOccupancy: number
    roomSize: number
    roomSizeUnit: 'sqm' | 'sqft'
    beds: { bedType: string; quantity: number }[]
    amenities: string[]
    units: string[]
    smokingRoom: boolean
    accessibleRoom: boolean
    privateBathroom: boolean
    sharedBathroom: boolean
    viewType: string[]
    images: File[]
}

export const Route = createFileRoute('/__main/property/$propertyId')({
    component: PropertyUnitComponent,
})

const MOCK_ROOM_TYPES = [
    { id: 'master-suite-1', title: 'Master Suite', location: 'Floor 1', details: '1 Bed • 1 Bath • 45m²', basePrice: 120, totalUnits: 2, capacity: '2 Adults', status: 'Active', imageUrl: 'https://picsum.photos/seed/room1/800/600', units: ['101', '102'] },
    { id: 'guest-bedroom-a', title: 'Guest Bedroom', location: 'Floor 2', details: '2 Beds • 1 Bath • 35m²', basePrice: 90, totalUnits: 4, capacity: '2 Adults, 1 Child', status: 'Active', imageUrl: 'https://picsum.photos/seed/room2/800/600', units: ['201', '202', '203', '204'] },
    { id: 'penthouse-room', title: 'Penthouse', location: 'Top Floor', details: '1 Bed • 1 Bath • 55m²', basePrice: 150, totalUnits: 1, capacity: '2 Adults', status: 'Maintenance', imageUrl: 'https://picsum.photos/seed/room3/800/600', units: ['PH1'] },
    { id: 'standard-room', title: 'Standard Room', location: 'Floor 1', details: '1 Bed • 1 Bath • 25m²', basePrice: 70, totalUnits: 8, capacity: '2 Adults', status: 'Active', imageUrl: 'https://picsum.photos/seed/room4/800/600', units: ['103', '104', '105', '106', '107', '108', '109', '110'] },
]

const BED_TYPES = ['King', 'Queen', 'Double', 'Twin', 'Single', 'Bunk', 'Sofa Bed', 'Murphy Bed', 'Futon']
const ROOM_AMENITIES = ['Air conditioning', 'TV', 'Mini bar', 'Coffee machine', 'Desk', 'Balcony', 'Kitchen', 'Microwave', 'Refrigerator', 'Safe', 'Hair dryer', 'Bathtub']
const VIEW_TYPES = ['Ocean view', 'Garden view', 'Pool view', 'Mountain view', 'City view', 'Courtyard view']
const ROOM_TABS = ['Basics', 'Pricing', 'Occupancy', 'Beds', 'Amenities', 'Units', 'OTA'] as const
type RoomTab = typeof ROOM_TABS[number]

function PropertyUnitComponent() {
    const { propertyId } = Route.useParams()
    const [searchQuery, setSearchQuery] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(4)

    const [isAddOpen, setIsAddOpen] = useState(false)
    const [activeTab, setActiveTab] = useState<RoomTab>('Basics')
    const [editingRoom, setEditingRoom] = useState<typeof MOCK_ROOM_TYPES[0] | null>(null)

    // Unit management state
    const [unitInput, setUnitInput] = useState('')
    const [genCount, setGenCount] = useState(10)
    const [genStart, setGenStart] = useState(201)

    const form = useForm({
        defaultValues: {
            name: '',
            internalCode: '',
            description: '',
            basePrice: 100,
            weekendPrice: 120,
            extraPersonFee: 20,
            currency: 'USD',
            maxAdults: 2,
            maxChildren: 2,
            maxOccupancy: 4,
            roomSize: 28,
            roomSizeUnit: 'sqm' as const,
            beds: [{ bedType: 'King', quantity: 1 }],
            amenities: [] as string[],
            units: ['101', '102', '103'] as string[],
            smokingRoom: false,
            accessibleRoom: false,
            privateBathroom: true,
            sharedBathroom: false,
            viewType: [] as string[],
            images: [] as File[],
        } as CreateRoomTypeForm,
        onSubmit: async ({ value }) => {
            console.log('Submitted room:', value)
            toast.success('Room type saved successfully!')
            setIsAddOpen(false)
            setEditingRoom(null)
            form.reset()
        },
    })

    const openAdd = () => {
        setEditingRoom(null)
        form.reset()
        setActiveTab('Basics')
        setUnitInput('')
        setIsAddOpen(true)
    }

    const openEdit = (room: typeof MOCK_ROOM_TYPES[0]) => {
        setEditingRoom(room)
        form.reset()
        form.setFieldValue('name', room.title)
        setActiveTab('Basics')
        setIsAddOpen(true)
    }

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
                        title={`Room Types — ${propertyId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}`}
                        description="Manage room types for this property"
                    />
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto mt-4 sm:mt-0">
                    <SearchInput
                        placeholder="Search rooms..."
                        value={searchQuery}
                        onValueChange={(val) => { setSearchQuery(val); setCurrentPage(1) }}
                        className="w-full sm:w-[320px]"
                    />
                    <Button onClick={openAdd} className="w-full sm:w-auto shrink-0">
                        <Plus className="size-4 mr-2" />
                        Add Room Type
                    </Button>
                </div>
            </div>

            <div className="flex flex-col gap-8 mt-6">
                {(() => {
                    const filteredRooms = MOCK_ROOM_TYPES.filter(room => {
                        const query = searchQuery.toLowerCase()
                        return room.title.toLowerCase().includes(query) || room.location.toLowerCase().includes(query) || room.details.toLowerCase().includes(query)
                    })
                    const paginatedRooms = filteredRooms.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

                    return (
                        <>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4.5">
                                {paginatedRooms.map((room) => (
                                    <div
                                        key={room.id}
                                        className="group h-full bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-500 ease-out hover:-translate-y-1.5 flex flex-col relative"
                                    >
                                        {/* Image */}
                                        <div className="relative w-full aspect-video shrink-0 overflow-hidden bg-slate-100">
                                            <img src={room.imageUrl} alt={room.title} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" />
                                            <div className="absolute inset-0 bg-linear-to-t from-slate-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                            {/* Price tag */}
                                            <div className="absolute top-3 right-3 z-10">
                                                <div className="bg-white/95 px-3 py-1.5 rounded-2xl shadow-sm border border-white/20 flex flex-col items-end gap-0">
                                                    <span className="text-[15px] font-black text-slate-900 leading-none">${room.basePrice}</span>
                                                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Base / Night</span>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Details */}
                                        <div className="p-4 flex flex-col gap-3 grow">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-start justify-between gap-2">
                                                    <h3 className="text-[1rem] font-bold text-slate-900 tracking-tight group-hover:text-[#243E8B] transition-colors duration-300 leading-tight">
                                                        {room.title}
                                                    </h3>
                                                    <span className={`shrink-0 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest flex items-center gap-1 border ${room.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60' : 'bg-amber-50 text-amber-700 border-amber-200/60'}`}>
                                                        <span className="relative flex h-1.5 w-1.5">
                                                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${room.status === 'Active' ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                                                            <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${room.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                                                        </span>
                                                        {room.status}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col gap-1.5">
                                                    <div className="flex items-center gap-2 text-slate-500">
                                                        <BedDouble className="size-3.5 shrink-0 text-slate-400" />
                                                        <span className="text-[12.5px] font-medium leading-none truncate">{room.totalUnits} Units • {room.capacity}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-slate-500">
                                                        <MapPin className="size-3.5 shrink-0 text-slate-400" />
                                                        <span className="text-[12.5px] font-semibold text-slate-600 tracking-wide leading-none truncate">{room.details}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Actions */}
                                            <div className="grid grid-cols-2 gap-2 mt-auto pt-1">
                                                <Button
                                                    onClick={() => openEdit(room)}
                                                    variant="outline"
                                                    className="w-full gap-1.5 rounded-xl border-slate-200 text-slate-600 font-semibold h-9 hover:bg-slate-50 hover:text-[#243E8B] hover:border-[#243E8B]/30 transition-all duration-300 group/btn text-[13px]"
                                                >
                                                    <Edit className="size-3.5 group-hover/btn:-rotate-12 transition-transform duration-300" />
                                                    Edit
                                                </Button>
                                                <Button
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

            {/* ── CREATE / EDIT ROOM TYPE DIALOG ── */}
            <Dialog open={isAddOpen} onOpenChange={(open) => { setIsAddOpen(open); if (!open) setEditingRoom(null) }}>
                <DialogContent className="w-[95vw] sm:max-w-2xl flex flex-col p-0 rounded-2xl overflow-hidden max-h-[90vh] gap-0 bg-white">

                    {/* Header */}
                    <DialogHeader className="flex-row items-center gap-3 px-5 py-4 border-b border-slate-100 shrink-0 space-y-0">
                        <div className="h-7 w-7 rounded-lg bg-[#243E8B]/10 flex items-center justify-center shrink-0">
                            <BedDouble className="size-3.5 text-[#243E8B]" />
                        </div>
                        <DialogTitle className="text-[14px] font-semibold text-slate-900 flex-1">
                            {editingRoom ? 'Edit room type' : 'Create room type'}
                        </DialogTitle>
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                            {editingRoom ? 'Editing' : 'New'}
                        </span>
                        <DialogDescription className="sr-only">Room type form</DialogDescription>
                    </DialogHeader>

                    {/* Tab bar */}
                    <div className="flex border-b border-slate-100 bg-white overflow-x-auto shrink-0">
                        {ROOM_TABS.map(tab => (
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
                                <div className="flex flex-col gap-5">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                        <span className="h-px flex-1 bg-slate-100" />Basic Information<span className="h-px flex-1 bg-slate-100" />
                                    </p>
                                    <div className="flex flex-col gap-3">
                                        <form.Field name="name" children={(field) => (
                                            <div className="flex flex-col gap-1.5">
                                                <Label className="text-[12px] font-medium text-slate-600">Room type name <span className="text-red-500">*</span></Label>
                                                <Input placeholder="e.g. Deluxe King Room" className="h-9 rounded-lg border-slate-200 text-[13px]" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                            </div>
                                        )} />
                                        <div className="grid grid-cols-2 gap-3">
                                            <form.Field name="internalCode" children={(field) => (
                                                <div className="flex flex-col gap-1.5">
                                                    <Label className="text-[12px] font-medium text-slate-600">Internal code <span className="text-red-500">*</span></Label>
                                                    <Input placeholder="e.g. DLX-KNG-01" className="h-9 rounded-lg border-slate-200 text-[13px]" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                                    <p className="text-[11px] text-slate-400">Used for internal mapping and reporting</p>
                                                </div>
                                            )} />
                                            <div className="flex flex-col gap-1.5">
                                                <Label className="text-[12px] font-medium text-slate-600">Room size</Label>
                                                <div className="grid grid-cols-[1fr_80px] gap-2">
                                                    <form.Field name="roomSize" children={(field) => (
                                                        <Input type="number" placeholder="28" min="1" className="h-9 rounded-lg border-slate-200 text-[13px]" value={field.state.value} onChange={(e) => field.handleChange(parseFloat(e.target.value) || 0)} />
                                                    )} />
                                                    <form.Field name="roomSizeUnit" children={(field) => (
                                                        <Select value={field.state.value} onValueChange={(v: 'sqm' | 'sqft') => field.handleChange(v)}>
                                                            <SelectTrigger className="h-9 rounded-lg border-slate-200 text-[13px] bg-white">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="sqm">sqm</SelectItem>
                                                                <SelectItem value="sqft">sqft</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    )} />
                                                </div>
                                            </div>
                                        </div>
                                        <form.Field name="description" children={(field) => (
                                            <div className="flex flex-col gap-1.5">
                                                <Label className="text-[12px] font-medium text-slate-600">Description <span className="text-red-500">*</span></Label>
                                                <Textarea placeholder="Describe the room type for OTA listings..." className="min-h-[80px] rounded-lg border-slate-200 text-[13px] resize-none" value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                            </div>
                                        )} />
                                    </div>
                                </div>
                            )}

                            {/* ── PRICING ── */}
                            {activeTab === 'Pricing' && (
                                <div className="flex flex-col gap-5">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                        <span className="h-px flex-1 bg-slate-100" />Base Pricing Setup<span className="h-px flex-1 bg-slate-100" />
                                    </p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <form.Field name="basePrice" children={(field) => (
                                            <div className="flex flex-col gap-1.5">
                                                <Label className="text-[12px] font-medium text-slate-600">Base price / night <span className="text-red-500">*</span></Label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[13px]">$</span>
                                                    <Input type="number" min="0" className="h-9 pl-7 rounded-lg border-slate-200 text-[13px]" value={field.state.value} onChange={(e) => field.handleChange(parseFloat(e.target.value) || 0)} />
                                                </div>
                                            </div>
                                        )} />
                                        <form.Field name="weekendPrice" children={(field) => (
                                            <div className="flex flex-col gap-1.5">
                                                <Label className="text-[12px] font-medium text-slate-600">Weekend price / night</Label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[13px]">$</span>
                                                    <Input type="number" min="0" className="h-9 pl-7 rounded-lg border-slate-200 text-[13px]" value={field.state.value} onChange={(e) => field.handleChange(parseFloat(e.target.value) || 0)} />
                                                </div>
                                            </div>
                                        )} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <form.Field name="extraPersonFee" children={(field) => (
                                            <div className="flex flex-col gap-1.5">
                                                <Label className="text-[12px] font-medium text-slate-600">Extra person fee</Label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[13px]">$</span>
                                                    <Input type="number" min="0" className="h-9 pl-7 rounded-lg border-slate-200 text-[13px]" value={field.state.value} onChange={(e) => field.handleChange(parseFloat(e.target.value) || 0)} />
                                                </div>
                                                <p className="text-[11px] text-slate-400">Charged per person over base capacity</p>
                                            </div>
                                        )} />
                                        <form.Field name="currency" children={(field) => (
                                            <div className="flex flex-col gap-1.5">
                                                <Label className="text-[12px] font-medium text-slate-600">Currency</Label>
                                                <Select value={field.state.value} onValueChange={field.handleChange}>
                                                    <SelectTrigger className="h-9 rounded-lg border-slate-200 text-[13px] bg-white">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="USD">USD ($)</SelectItem>
                                                        <SelectItem value="EUR">EUR (€)</SelectItem>
                                                        <SelectItem value="GBP">GBP (£)</SelectItem>
                                                        <SelectItem value="AUD">AUD ($)</SelectItem>
                                                        <SelectItem value="IDR">IDR (Rp)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )} />
                                    </div>
                                </div>
                            )}

                            {/* ── OCCUPANCY ── */}
                            {activeTab === 'Occupancy' && (
                                <div className="flex flex-col gap-5">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                        <span className="h-px flex-1 bg-slate-100" />Capacity<span className="h-px flex-1 bg-slate-100" />
                                    </p>
                                    <div className="grid grid-cols-3 gap-4">
                                        <form.Field name="maxAdults" children={(field) => (
                                            <div className="flex flex-col gap-1.5">
                                                <Label className="text-[12px] font-medium text-slate-600">Max adults <span className="text-red-500">*</span></Label>
                                                <Input type="number" min="1" max="20" className="h-9 rounded-lg border-slate-200 text-[13px]" value={field.state.value} onChange={(e) => field.handleChange(parseInt(e.target.value) || 1)} />
                                            </div>
                                        )} />
                                        <form.Field name="maxChildren" children={(field) => (
                                            <div className="flex flex-col gap-1.5">
                                                <Label className="text-[12px] font-medium text-slate-600">Max children</Label>
                                                <Input type="number" min="0" max="10" className="h-9 rounded-lg border-slate-200 text-[13px]" value={field.state.value} onChange={(e) => field.handleChange(parseInt(e.target.value) || 0)} />
                                            </div>
                                        )} />
                                        <form.Field name="maxOccupancy" children={(field) => (
                                            <div className="flex flex-col gap-1.5">
                                                <Label className="text-[12px] font-medium text-slate-600">Max occupancy <span className="text-red-500">*</span></Label>
                                                <Input type="number" min="1" max="30" className="h-9 rounded-lg border-slate-200 text-[13px]" value={field.state.value} onChange={(e) => field.handleChange(parseInt(e.target.value) || 1)} />
                                                <p className="text-[11px] text-slate-400">Total cap including children</p>
                                            </div>
                                        )} />
                                    </div>
                                </div>
                            )}

                            {/* ── BEDS ── */}
                            {activeTab === 'Beds' && (
                                <div className="flex flex-col gap-5">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                        <span className="h-px flex-1 bg-slate-100" />Bed Configuration<span className="h-px flex-1 bg-slate-100" />
                                    </p>
                                    <form.Field name="beds" children={(field) => (
                                        <div className="flex flex-col gap-3">
                                            {/* Column headers */}
                                            <div className="grid grid-cols-[1fr_80px_36px] gap-2 px-1">
                                                <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wide">Bed type</span>
                                                <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wide">Qty</span>
                                                <span />
                                            </div>
                                            {/* Bed rows */}
                                            {field.state.value.map((_, i) => (
                                                <div key={i} className="grid grid-cols-[1fr_80px_36px] gap-2 items-center">
                                                    <form.Field name={`beds[${i}].bedType`} children={(subField) => (
                                                        <Select value={subField.state.value} onValueChange={subField.handleChange}>
                                                            <SelectTrigger className="h-9 rounded-lg border-slate-200 text-[13px] bg-white">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {BED_TYPES.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                                                            </SelectContent>
                                                        </Select>
                                                    )} />
                                                    <form.Field name={`beds[${i}].quantity`} children={(subField) => (
                                                        <Input type="number" min="1" max="10" className="h-9 rounded-lg border-slate-200 text-[13px] text-center" value={subField.state.value} onChange={(e) => subField.handleChange(parseInt(e.target.value) || 1)} />
                                                    )} />
                                                    <button
                                                        type="button"
                                                        onClick={() => field.removeValue(i)}
                                                        className="h-9 w-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all"
                                                    >
                                                        <Trash2 className="size-3.5" />
                                                    </button>
                                                </div>
                                            ))}
                                            {/* Add bed button */}
                                            <button
                                                type="button"
                                                onClick={() => field.pushValue({ bedType: 'King', quantity: 1 })}
                                                className="flex items-center gap-1.5 text-[12.5px] text-slate-500 hover:text-[#243E8B] border border-dashed border-slate-300 hover:border-[#243E8B]/40 rounded-lg px-3 py-2 w-fit transition-all"
                                            >
                                                <Plus className="size-3.5" />
                                                Add bed type
                                            </button>
                                        </div>
                                    )} />
                                </div>
                            )}

                            {/* ── AMENITIES ── */}
                            {activeTab === 'Amenities' && (
                                <div className="flex flex-col gap-5">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                        <span className="h-px flex-1 bg-slate-100" />Room Amenities<span className="h-px flex-1 bg-slate-100" />
                                    </p>
                                    <form.Field name="amenities" children={(field) => (
                                        <div className="flex flex-wrap gap-2">
                                            {ROOM_AMENITIES.map((amenity) => {
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

                            {/* ── UNITS ── */}
                            {activeTab === 'Units' && (
                                <div className="flex flex-col gap-5">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                        <span className="h-px flex-1 bg-slate-100" />Physical Units<span className="h-px flex-1 bg-slate-100" />
                                    </p>
                                    <form.Field name="units" children={(field) => (
                                        <div className="flex flex-col gap-4">
                                            {/* Unit pills */}
                                            <div className="flex flex-wrap gap-2 min-h-[36px]">
                                                {field.state.value.map((unit, i) => (
                                                    <div key={i} className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-[12.5px] font-semibold text-slate-700">
                                                        {unit}
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

                                            {/* Add single unit */}
                                            <div>
                                                <Label className="text-[12px] font-medium text-slate-600 mb-1.5 block">Room number</Label>
                                                <div className="grid grid-cols-[1fr_auto] gap-2 max-w-xs">
                                                    <Input
                                                        placeholder="e.g. 104"
                                                        value={unitInput}
                                                        onChange={(e) => setUnitInput(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter' && unitInput.trim()) {
                                                                e.preventDefault()
                                                                field.pushValue(unitInput.trim())
                                                                setUnitInput('')
                                                            }
                                                        }}
                                                        className="h-9 rounded-lg border-slate-200 text-[13px]"
                                                    />
                                                    <Button
                                                        type="button"
                                                        onClick={() => { if (unitInput.trim()) { field.pushValue(unitInput.trim()); setUnitInput('') } }}
                                                        className="h-9 px-4 bg-[#243E8B] hover:bg-[#1D3270] text-white rounded-lg text-[13px] font-medium"
                                                    >
                                                        Add unit
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Bulk generate */}
                                            <div className="border-t border-slate-100 pt-4">
                                                <p className="text-[12px] font-semibold text-slate-600 mb-3">Bulk generate</p>
                                                <div className="grid grid-cols-[1fr_1fr_auto] gap-2 max-w-sm items-end">
                                                    <div className="flex flex-col gap-1.5">
                                                        <Label className="text-[11px] text-slate-500">Count</Label>
                                                        <Input type="number" min="1" max="200" value={genCount} onChange={(e) => setGenCount(parseInt(e.target.value) || 10)} className="h-9 rounded-lg border-slate-200 text-[13px]" />
                                                    </div>
                                                    <div className="flex flex-col gap-1.5">
                                                        <Label className="text-[11px] text-slate-500">Start number</Label>
                                                        <Input type="number" value={genStart} onChange={(e) => setGenStart(parseInt(e.target.value) || 201)} className="h-9 rounded-lg border-slate-200 text-[13px]" />
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        onClick={() => {
                                                            const newUnits = Array.from({ length: Math.min(genCount, 200) }, (_, i) => String(genStart + i))
                                                            newUnits.forEach(u => field.pushValue(u))
                                                        }}
                                                        className="h-9 px-4 bg-[#243E8B] hover:bg-[#1D3270] text-white rounded-lg text-[13px] font-medium"
                                                    >
                                                        Generate
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    )} />
                                </div>
                            )}

                            {/* ── OTA ── */}
                            {activeTab === 'OTA' && (
                                <div className="flex flex-col gap-5">
                                    {/* Info note */}
                                    <div className="flex items-start gap-3 p-3.5 bg-[#EEF3FF] rounded-xl border border-[#243E8B]/15">
                                        <Info className="size-4 text-[#243E8B] mt-0.5 shrink-0" />
                                        <p className="text-[12px] text-slate-600 leading-relaxed">
                                            These attributes are required by Airbnb, Booking.com, Expedia, and Vrbo during channel sync. Incomplete data may lower OTA listing quality scores.
                                        </p>
                                    </div>

                                    {/* Room attributes */}
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                                            <span className="h-px flex-1 bg-slate-100" />Room Attributes<span className="h-px flex-1 bg-slate-100" />
                                        </p>
                                        <div className="rounded-xl border border-slate-100 overflow-hidden divide-y divide-slate-100">
                                            {([
                                                { name: 'smokingRoom' as const, label: 'Smoking room', sub: 'Room permits smoking' },
                                                { name: 'accessibleRoom' as const, label: 'Accessible room', sub: 'Wheelchair / mobility accessible' },
                                                { name: 'privateBathroom' as const, label: 'Private bathroom', sub: 'Ensuite or attached bathroom' },
                                                { name: 'sharedBathroom' as const, label: 'Shared bathroom', sub: 'Bathroom shared with other guests' },
                                            ] as const).map(attr => (
                                                <form.Field key={attr.name} name={attr.name} children={(f) => (
                                                    <div className="flex items-center justify-between px-4 py-3 bg-white hover:bg-slate-50/60 transition-colors">
                                                        <div>
                                                            <p className="text-[13px] font-medium text-slate-800">{attr.label}</p>
                                                            <p className="text-[11px] text-slate-400">{attr.sub}</p>
                                                        </div>
                                                        <Switch checked={f.state.value} onCheckedChange={f.handleChange} />
                                                    </div>
                                                )} />
                                            ))}
                                        </div>
                                    </div>

                                    {/* View type */}
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                                            <span className="h-px flex-1 bg-slate-100" />View Type<span className="h-px flex-1 bg-slate-100" />
                                        </p>
                                        <form.Field name="viewType" children={(field) => (
                                            <div className="flex flex-wrap gap-2">
                                                {VIEW_TYPES.map(view => {
                                                    const isOn = field.state.value.includes(view)
                                                    return (
                                                        <button
                                                            key={view}
                                                            type="button"
                                                            onClick={() => {
                                                                const cur = field.state.value
                                                                field.handleChange(isOn ? cur.filter(v => v !== view) : [...cur, view])
                                                            }}
                                                            className={`px-3 py-1.5 rounded-full border text-[12.5px] transition-all ${isOn ? 'border-[#243E8B] bg-[#EEF3FF] text-[#243E8B] font-semibold' : 'border-slate-200 text-slate-500 hover:border-slate-300 bg-white'}`}
                                                        >
                                                            {view}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        )} />
                                    </div>

                                    {/* Photos & floor plan */}
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                                            <span className="h-px flex-1 bg-slate-100" />Room Photos & Floor Plan<span className="h-px flex-1 bg-slate-100" />
                                        </p>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="border border-dashed border-slate-300 rounded-xl p-5 flex flex-col items-center gap-1.5 cursor-pointer hover:border-[#243E8B]/50 hover:bg-[#EEF3FF]/20 transition-all">
                                                <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center">
                                                    <Plus className="size-4 text-slate-400" />
                                                </div>
                                                <p className="text-[12px] font-medium text-slate-600">Room photos</p>
                                                <p className="text-[11px] text-slate-400">JPG, PNG, WEBP</p>
                                            </div>
                                            <div className="border border-dashed border-slate-300 rounded-xl p-5 flex flex-col items-center gap-1.5 cursor-pointer hover:border-[#243E8B]/50 hover:bg-[#EEF3FF]/20 transition-all">
                                                <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center">
                                                    <Plus className="size-4 text-slate-400" />
                                                </div>
                                                <p className="text-[12px] font-medium text-slate-600">Floor plan</p>
                                                <p className="text-[11px] text-slate-400">PDF, PNG</p>
                                            </div>
                                        </div>
                                        <div className="mt-3 flex flex-col gap-1.5">
                                            <Label className="text-[12px] font-medium text-slate-600">360 tour URL</Label>
                                            <Input type="url" placeholder="https://..." className="h-9 rounded-lg border-slate-200 text-[13px]" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
                            <Button type="button" variant="outline" onClick={() => { setIsAddOpen(false); setEditingRoom(null) }} className="h-9 px-5 rounded-lg font-medium text-[13px]">
                                Cancel
                            </Button>
                            <form.Subscribe
                                selector={(state) => [state.canSubmit, state.isSubmitting]}
                                children={([canSubmit, isSubmitting]) => (
                                    <Button type="submit" disabled={!canSubmit} className="h-9 px-5 rounded-lg font-semibold bg-[#243E8B] hover:bg-[#1D3270] text-white text-[13px]">
                                        {isSubmitting ? 'Saving...' : 'Save room type'}
                                    </Button>
                                )}
                            />
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    )
}
