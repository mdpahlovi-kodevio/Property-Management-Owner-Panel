import { useAppForm } from '@/components/form/form-context'
import { Button } from '@/components/ui/button'
import { DataTableFooter } from '@/components/ui/data-table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { PageHeader } from '@/components/ui/page-header'
import { SearchInput } from '@/components/ui/search-input'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { useSearchParams } from '@/hooks/use-search-params'
import type { CreatePropertyPayload, Property, PropertyListItem, UpdatePropertyPayload } from '@/lib/api'
import { AddonStateOptions, propertyApi, PropertyStatusOptions, PropertyTypeOptions, resolveImage } from '@/lib/api'
import { capitalize, cn, GetPropertyAmenities, GetWebsites } from '@/lib/utils'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Edit, Eye, MapPin, Package, Plus, Star, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import * as z from 'zod'

const searchSchema = z.object({
    page: z.number().default(1),
    limit: z.number().default(12),
    search: z.string().optional(),
})

export const Route = createFileRoute('/__main/property')({
    validateSearch: searchSchema,
    component: RouteComponent,
})

// ─── Card shape used by the grid ────────────────────────────────────
type PropertyCard = {
    id: string
    slug: string
    title: string
    location: string
    type: string
    totalRooms: number
    roomTypes: number
    occupancy: number
    todayCheckIns: number
    status: string
    imageUrl: string
    rating: number
    reviewCount: number
    priceRangeLabel: string
    totalBeds: number
    totalBaths: number
    maxGuests: number
    viewType: string
    city: string
    country: string
}

const COUNTRY_OPTIONS = [
    'Bangladesh',
    'United States',
    'United Kingdom',
    'Indonesia',
    'Thailand',
    'France',
    'Spain',
    'Australia',
    'Japan',
].map((c) => ({ value: c, label: c }))

const PROP_TABS = ['Basics', 'Location', 'Policies', 'Addons', 'Photos'] as const
type PropTab = (typeof PROP_TABS)[number]

// ─── API → card mapping helpers ─────────────────────────────────────
function mapPropertyToCard(p: Property): PropertyCard {
    const totalRooms = p.roomTypes.reduce((sum, rt) => sum + rt.units.length, 0)
    const totalBeds = p.roomTypes.reduce((sum, rt) => sum + rt.beds.reduce((s, b) => s + b.quantity, 0), 0)
    const maxGuests = p.roomTypes.length ? Math.max(...p.roomTypes.map((rt) => rt.maxOccupancy)) : 0
    const cover = p.images.find((i) => i.thumbnail) ?? p.images.at(0)

    return {
        id: p.id,
        slug: p.slug,
        title: p.name,
        location: [p.city, p.state, p.country].filter(Boolean).join(', '),
        type: capitalize(p.propertyType),
        totalRooms,
        roomTypes: p.roomTypes.length,
        // The list endpoint exposes no analytics; these are not available yet.
        occupancy: 0,
        todayCheckIns: 0,
        status: capitalize(p.status),
        imageUrl: resolveImage(cover?.url),
        rating: 0,
        reviewCount: 0,
        priceRangeLabel: '',
        totalBeds,
        totalBaths: p.roomTypes.length,
        maxGuests,
        viewType: '',
        city: p.city,
        country: p.country,
    }
}

// ─── Zod schema for the create/edit form ──────────────────────────
const propertyFormSchema = z.object({
    name: z.string().min(2, 'Property name is required'),
    slug: z
        .string()
        .min(2, 'Slug is required')
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and hyphens'),
    propertyType: z.enum(PropertyTypeOptions, 'Property type is required'),
    description: z.string().min(2, 'Description is required'),
    status: z.enum(PropertyStatusOptions, 'Property status is required'),
    country: z.string().min(2, 'Country is required'),
    state: z.string(),
    city: z.string().min(2, 'City is required'),
    postalCode: z.string(),
    address1: z.string().min(2, 'Address is required'),
    address2: z.string(),
    latitude: z.number(),
    longitude: z.number(),
    checkInTime: z.string().min(2, 'Check-in time is required'),
    checkOutTime: z.string().min(2, 'Check-out time is required'),
    taxRate: z.number().min(0).max(100).optional(),
    websiteId: z.string().optional(),
    amenities: z.array(z.string()),
    policy: z.object({
        petsAllowed: z.boolean(),
        minimumGuestAge: z.number(),
        securityDeposit: z.number(),
        houseRules: z.string(),
    }),
    addons: z.array(
        z.object({
            name: z.string().min(2, 'Addon name is required'),
            description: z.string(),
            price: z.number().min(0, 'Price must be 0 or more'),
            state: z.enum(AddonStateOptions, 'Addon state is required'),
        }),
    ),
    images: z.array(
        z.object({
            url: z.string(),
            thumbnail: z.boolean(),
            sortOrder: z.number(),
        }),
    ),
})

type PropertyFormValues = z.infer<typeof propertyFormSchema>

const FORM_DEFAULTS: PropertyFormValues = {
    name: '',
    slug: '',
    propertyType: 'HOTEL',
    description: '',
    status: 'DRAFT',
    country: '',
    state: '',
    city: '',
    postalCode: '',
    address1: '',
    address2: '',
    latitude: 0,
    longitude: 0,
    checkInTime: '',
    checkOutTime: '',
    amenities: [],
    policy: { petsAllowed: false, minimumGuestAge: 0, securityDeposit: 0, houseRules: '' },
    addons: [],
    images: [],
}

function valuesFromProperty(p: Property): PropertyFormValues {
    return {
        name: p.name,
        slug: p.slug,
        propertyType: p.propertyType,
        description: p.description ?? '',
        status: p.status,
        country: p.country,
        state: p.state ?? '',
        city: p.city,
        postalCode: p.postalCode ?? '',
        address1: p.address1,
        address2: p.address2 ?? '',
        latitude: p.latitude ?? 0,
        longitude: p.longitude ?? 0,
        checkInTime: p.checkInTime,
        checkOutTime: p.checkOutTime,
        ...(p.taxRate != null ? { taxRate: Number(p.taxRate) } : {}),
        ...(p.websiteId ? { websiteId: p.websiteId } : {}),
        amenities: p.amenities.map((a) => a.amenity.id),
        // Only petsAllowed has a backend home; the other toggles are UI-only.
        policy: {
            petsAllowed: p.policy?.petsAllowed ?? false,
            minimumGuestAge: p.policy?.minimumGuestAge ?? 0,
            securityDeposit: p.policy?.securityDeposit != null ? Number(p.policy.securityDeposit) : 0,
            houseRules: p.policy?.houseRules ?? '',
        },
        addons: p.addons.map((a) => ({
            name: a.name,
            description: a.description ?? '',
            price: Number(a.price),
            state: a.state,
        })),
        images: p.images.map((image) => ({
            url: image.url,
            thumbnail: image.thumbnail,
            sortOrder: image.sortOrder,
        })),
    }
}

// ─── Status badge ────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
    const isActive = status === 'Active'
    return (
        <span
            className={cn(
                'shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border',
                isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60' : 'bg-amber-50 text-amber-700 border-amber-200/60',
            )}
        >
            <span className="relative flex size-1.5">
                <span
                    className={cn(
                        'animate-ping absolute inline-flex size-full rounded-full opacity-75',
                        isActive ? 'bg-emerald-400' : 'bg-amber-400',
                    )}
                />
                <span className={cn('relative inline-flex rounded-full size-1.5', isActive ? 'bg-emerald-500' : 'bg-amber-500')} />
            </span>
            {status}
        </span>
    )
}

// ─── Property component ──
function RouteComponent() {
    const { t } = useTranslation()
    const query = Route.useSearch()
    const mergeSearch = useSearchParams()
    const queryClient = useQueryClient()
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [activeTab, setActiveTab] = useState<PropTab>('Basics')
    const [editingProperty, setEditingProperty] = useState<Property | null>(null)

    // ── List query ──
    const { data, isLoading, refetch } = useQuery({
        queryKey: ['properties', query],
        queryFn: () => propertyApi.list(query),
    })

    // ── Mutations ──
    const createMutation = useMutation({
        mutationFn: (payload: CreatePropertyPayload) => propertyApi.create(payload),
        onSuccess: () => {
            refetch()
            toast.success(t('properties.createdSuccess', 'Property created successfully!'))
            closeDialog()
        },
        onError: (error) => toast.error(error.message),
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdatePropertyPayload }) => propertyApi.update(id, payload),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['property', response.data.slug] })
            toast.success(t('properties.updatedSuccess', 'Property updated successfully!'))
            closeDialog()
        },
        onError: (error) => toast.error(error.message),
    })

    const openAdd = () => {
        setEditingProperty(null)
        setActiveTab('Basics')
        setIsAddOpen(true)
    }

    const openEdit = (property: Property) => {
        setEditingProperty(property)
        setActiveTab('Basics')
        setIsAddOpen(true)
    }

    const closeDialog = () => {
        setIsAddOpen(false)
        setEditingProperty(null)
    }

    const formDefaults: PropertyFormValues = editingProperty ? valuesFromProperty(editingProperty) : FORM_DEFAULTS

    const handleSave = async (values: PropertyFormValues) => {
        if (editingProperty) {
            await updateMutation.mutateAsync({ id: editingProperty.id, payload: values })
        } else {
            await createMutation.mutateAsync(values)
        }
    }

    const isSaving = createMutation.isPending || updateMutation.isPending
    const items = data?.data ?? []

    return (
        <>
            {/* ── Page header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <PageHeader title={t('properties.title')} description={t('properties.description')} />
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <SearchInput
                        value={query.search ?? ''}
                        placeholder={t('properties.searchPlaceholder', 'Search properties...')}
                        className="sm:w-80"
                    />
                    <Button onClick={openAdd}>
                        <Plus className="size-4" />
                        {t('properties.addProperty', 'Add Property')}
                    </Button>
                </div>
            </div>

            {/* ── Grid + pagination ── */}
            <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(18rem,1fr))]">
                {isLoading ? (
                    Array.from({ length: 6 }).map((_, i) => <PropertyCardSkeleton key={i} />)
                ) : items.length === 0 ? (
                    <div className="col-span-full text-center py-16 text-muted-foreground">
                        {t('properties.empty', 'No properties found.')}
                    </div>
                ) : (
                    items.map((item) => <PropertyCardItem key={item.id} item={item} onEdit={openEdit} />)
                )}
            </div>

            <DataTableFooter
                page={query.page}
                limit={query.limit}
                total={data?.meta.total ?? 0}
                onPageChange={(page) => mergeSearch({ page })}
                onLimitChange={(limit) => mergeSearch({ page: 1, limit })}
                limitOptions={[12, 24]}
                noun={t('properties.noun')}
            />

            {/* ══════════════════════════════════════════════════
                CREATE / EDIT PROPERTY DIALOG
            ══════════════════════════════════════════════════ */}
            <Dialog
                open={isAddOpen}
                onOpenChange={(open) => {
                    if (!open) closeDialog()
                }}
            >
                <DialogContent className="sm:max-w-160">
                    <DialogHeader>
                        <DialogTitle>{editingProperty ? t('properties.editProperty') : t('properties.createProperty')}</DialogTitle>
                        <DialogDescription>
                            {editingProperty
                                ? t('properties.editing', `Editing "{{name}}"`, { name: editingProperty.name })
                                : t('properties.addDesc')}
                        </DialogDescription>
                    </DialogHeader>

                    <PropertyForm
                        key={editingProperty?.id ?? 'add'}
                        defaultValues={formDefaults}
                        activeTab={activeTab}
                        onActiveTabChange={setActiveTab}
                        onSubmit={handleSave}
                        onCancel={closeDialog}
                        submitLabel={
                            isSaving
                                ? t('properties.saving', 'Saving...')
                                : editingProperty
                                  ? t('properties.saveChanges')
                                  : t('properties.saveProperty')
                        }
                    />
                </DialogContent>
            </Dialog>
        </>
    )
}

// ─── Property card (rich render needs the full property from GET /:id) ──
function PropertyCardItem({ item, onEdit }: { item: PropertyListItem; onEdit: (property: Property) => void }) {
    const { t } = useTranslation()
    const navigate = useNavigate()

    const { data, isLoading } = useQuery({
        queryKey: ['property', item.slug],
        queryFn: () => propertyApi.getBySlug(item.slug),
    })

    if (isLoading || !data) return <PropertyCardSkeleton />

    const property = mapPropertyToCard(data.data)

    return (
        <div
            onClick={() => navigate({ to: '/property/$propertySlug', params: { propertySlug: property.slug } })}
            className="group h-full flex flex-col bg-card rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06),0_6px_16px_rgba(0,0,0,0.06)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.1),0_12px_28px_rgba(0,0,0,0.08)] border border-border transition-all duration-300 ease-out hover:-translate-y-1 cursor-pointer overflow-hidden"
        >
            {/* Image */}
            <div className="relative w-full overflow-hidden bg-muted shrink-0" style={{ paddingTop: '66%' }}>
                <img
                    src={property.imageUrl}
                    alt={property.title}
                    crossOrigin="anonymous"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
                />

                {/* Property type badge (top-left, Guest-Panel style) */}
                <span className="absolute top-3 left-3 bg-primary text-primary-foreground px-3 py-1 rounded-full text-[0.7rem] font-bold uppercase tracking-wide shadow-sm">
                    {property.type}
                </span>

                {/* Status badge (top-right) — admin affordance */}
                <div className="absolute top-3 right-3">
                    <StatusBadge status={property.status} />
                </div>
            </div>

            {/* Body */}
            <div className="p-4 flex flex-col gap-2 grow bg-card">
                {/* Title row with rating */}
                <div className="flex justify-between items-center gap-3">
                    <h3 className="text-[1.05rem] font-semibold text-foreground leading-snug line-clamp-1 m-0 group-hover:text-primary transition-colors duration-300">
                        {property.title}
                    </h3>
                    <div
                        className="inline-flex items-center gap-1 bg-accent text-foreground px-2 py-0.5 rounded-full text-[0.75rem] font-semibold whitespace-nowrap shrink-0"
                        aria-label={`Rated ${property.rating} out of 5 from ${property.reviewCount} reviews`}
                    >
                        <Star className="size-3 fill-amber-400 text-amber-400" />
                        {property.rating.toFixed(1)}
                        <span className="text-muted-foreground font-normal ml-0.5">({property.reviewCount})</span>
                    </div>
                </div>

                {/* Location + view type */}
                <div className="flex justify-between items-center gap-2 flex-wrap">
                    <p className="text-muted-foreground m-0 text-[0.875rem] flex items-center gap-1">
                        <MapPin className="size-3.5" />
                        {property.city}, {property.country}
                    </p>
                    {property.viewType && (
                        <span className="text-[0.75rem] font-medium px-2 py-0.5 rounded-full border border-border text-muted-foreground">
                            {property.viewType}
                        </span>
                    )}
                </div>

                {/* Meta: beds / baths / guests */}
                <div className="flex justify-between items-center gap-2 flex-wrap border-t pt-2 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                        🛏 {property.totalBeds} {t('properties.beds')}
                    </span>
                    <span className="inline-flex items-center gap-1">
                        🚿 {property.totalBaths} {t('properties.baths')}
                    </span>
                    <span className="inline-flex items-center gap-1">
                        👥 {property.maxGuests} {t('properties.guests')}
                    </span>
                </div>

                {/* Admin info chips (secondary info) */}
                <div className="flex justify-between items-center gap-1.5 flex-wrap border-y border-border py-2">
                    <span className="inline-flex items-center gap-1 text-xs uppercase tracking-wider px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                        <span
                            className={cn(
                                'size-1.5 rounded-full',
                                property.occupancy > 80 ? 'bg-emerald-500' : property.occupancy > 50 ? 'bg-amber-500' : 'bg-rose-500',
                            )}
                        />
                        {property.occupancy}% {t('properties.occ')}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs uppercase tracking-wider px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                        {property.totalRooms} {t('properties.units')}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs uppercase tracking-wider px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                        {property.todayCheckIns} {t('properties.arrivals')}
                    </span>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-1">
                    <Button
                        onClick={(e) => {
                            e.stopPropagation()
                            onEdit(data.data)
                        }}
                        variant="outline"
                    >
                        <Edit className="size-3.5" />
                        {t('properties.edit')}
                    </Button>
                    <Button
                        onClick={(e) => {
                            e.stopPropagation()
                            navigate({
                                to: '/property/$propertySlug',
                                params: { propertySlug: property.slug },
                            })
                        }}
                    >
                        <Eye className="size-3.5" />
                        {t('properties.view')}
                    </Button>
                </div>
            </div>
        </div>
    )
}

function PropertyCardSkeleton() {
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

// ─── PropertyForm sub-component (mirrors EmployeeForm pattern) ─────
function PropertyForm({
    defaultValues,
    activeTab,
    onActiveTabChange,
    onSubmit,
    onCancel,
    submitLabel,
}: {
    defaultValues: PropertyFormValues
    activeTab: PropTab
    onActiveTabChange: (tab: PropTab) => void
    onSubmit: (values: PropertyFormValues) => Promise<void>
    onCancel: () => void
    submitLabel: string
}) {
    const websites = GetWebsites()
    const amenities = GetPropertyAmenities()

    const form = useAppForm({
        defaultValues,
        validators: { onChange: propertyFormSchema },
        onSubmit: async ({ value }) => await onSubmit(value),
    })

    return (
        <>
            <div className="flex bg-muted overflow-x-auto shrink-0">
                {PROP_TABS.map((tab) => (
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
                    form.handleSubmit()
                }}
                className="flex flex-col flex-1 min-h-0"
            >
                {/* ════════ BASICS ════════ */}
                {activeTab === 'Basics' && (
                    <div className="flex flex-col gap-6">
                        <Section>
                            <SectionLabel>Basic Information</SectionLabel>
                            <form.AppField name="name">
                                {(field) => <field.FormInput label="Property name" placeholder="e.g. Seaside Villa Bali" />}
                            </form.AppField>
                            <div className="grid grid-cols-2 gap-3">
                                <form.AppField name="slug">
                                    {(field) => <field.FormInput label="Slug" placeholder="e.g. seaside-villa-bali" />}
                                </form.AppField>
                                <form.AppField name="websiteId">
                                    {(field) => (
                                        <field.FormSelect
                                            label="Website"
                                            placeholder="Select website"
                                            options={websites.map((website) => ({
                                                value: website.id,
                                                label: website.name,
                                            }))}
                                        />
                                    )}
                                </form.AppField>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <form.AppField name="propertyType">
                                    {(field) => (
                                        <field.FormSelect
                                            label="Property type"
                                            placeholder="Select type"
                                            options={PropertyTypeOptions.map((option) => ({
                                                value: option,
                                                label: capitalize(option),
                                            }))}
                                        />
                                    )}
                                </form.AppField>
                                <form.AppField name="status">
                                    {(field) => (
                                        <field.FormSelect
                                            label="Status"
                                            options={PropertyStatusOptions.map((option) => ({
                                                value: option,
                                                label: capitalize(option),
                                            }))}
                                        />
                                    )}
                                </form.AppField>
                            </div>
                            <form.AppField name="description">
                                {(field) => (
                                    <field.FormTextarea
                                        label="Description"
                                        placeholder="Describe your property for guests and OTA listings..."
                                    />
                                )}
                            </form.AppField>
                        </Section>

                        <Section>
                            <SectionLabel>Check-in / Check-out</SectionLabel>
                            <div className="grid grid-cols-2 gap-3">
                                <form.AppField name="checkInTime">
                                    {(field) => <field.FormInput type="time" label="Check-in time" />}
                                </form.AppField>
                                <form.AppField name="checkOutTime">
                                    {(field) => <field.FormInput type="time" label="Check-out time" />}
                                </form.AppField>
                            </div>
                        </Section>

                        <Section>
                            <SectionLabel>Taxes</SectionLabel>
                            <form.AppField name="taxRate">
                                {(field) => (
                                    <field.FormInputNumber
                                        label="Sales tax / VAT (%)"
                                        placeholder="e.g. 12 — empty or 0 means no tax"
                                        min={0}
                                        max={100}
                                        step="0.01"
                                    />
                                )}
                            </form.AppField>
                        </Section>
                    </div>
                )}

                {/* ════════ LOCATION ════════ */}
                {activeTab === 'Location' && (
                    <div className="flex flex-col gap-6">
                        <Section>
                            <SectionLabel>Address</SectionLabel>
                            <div className="grid grid-cols-2 gap-3">
                                <form.AppField name="country">
                                    {(field) => <field.FormSelect label="Country" placeholder="Select country" options={COUNTRY_OPTIONS} />}
                                </form.AppField>
                                <form.AppField name="state">
                                    {(field) => <field.FormInput label="State / Province" placeholder="e.g. Bali" />}
                                </form.AppField>
                                <form.AppField name="city">
                                    {(field) => <field.FormInput label="City" placeholder="e.g. Seminyak" />}
                                </form.AppField>
                                <form.AppField name="postalCode">
                                    {(field) => <field.FormInput label="Postal code" placeholder="80361" />}
                                </form.AppField>
                            </div>
                            <form.AppField name="address1">
                                {(field) => <field.FormInput label="Address line 1" placeholder="Street address" />}
                            </form.AppField>
                            <form.AppField name="address2">
                                {(field) => <field.FormInput label="Address line 2" placeholder="Apartment, suite, unit (optional)" />}
                            </form.AppField>
                        </Section>

                        <Section>
                            <SectionLabel>Coordinates</SectionLabel>
                            <div className="grid grid-cols-2 gap-3">
                                <form.AppField name="latitude">
                                    {(field) => <field.FormInputNumber label="Latitude" placeholder="-8.691195" step="any" />}
                                </form.AppField>
                                <form.AppField name="longitude">
                                    {(field) => <field.FormInputNumber label="Longitude" placeholder="115.167820" step="any" />}
                                </form.AppField>
                            </div>
                        </Section>
                    </div>
                )}

                {/* ════════ POLICIES ════════ */}
                {activeTab === 'Policies' && (
                    <div className="flex flex-col gap-6">
                        <Section>
                            <SectionLabel>Property Amenities</SectionLabel>
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
                            <SectionLabel>Guest Policies</SectionLabel>
                            <div className="rounded-lg border overflow-hidden divide-y">
                                {[{ name: 'policy.petsAllowed' as const, label: 'Pets allowed', sub: 'Guests may bring animals' }].map(
                                    (policy) => (
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
                                    ),
                                )}
                            </div>
                        </Section>

                        <Section>
                            <SectionLabel>Fees &amp; Rules</SectionLabel>
                            <div className="grid grid-cols-2 gap-3">
                                <form.AppField name="policy.minimumGuestAge">
                                    {(field) => <field.FormInputNumber label="Minimum guest age" placeholder="18" min={0} />}
                                </form.AppField>
                                <form.AppField name="policy.securityDeposit">
                                    {(field) => <field.FormInputNumber label="Security deposit" placeholder="0.00" min={0} step="0.01" />}
                                </form.AppField>
                            </div>
                            <form.AppField name="policy.houseRules">
                                {(field) => <field.FormTextarea label="House rules" placeholder="e.g. No loud music after 10pm..." />}
                            </form.AppField>
                        </Section>
                    </div>
                )}

                {/* ════════ ADDONS ════════ */}
                {activeTab === 'Addons' && (
                    <Section>
                        <SectionLabel>Booking Addons</SectionLabel>
                        <p className="text-xs text-muted-foreground -mt-1.5">
                            Optional extras guests can add to their booking for a small fee.
                        </p>
                        <form.AppField name="addons">
                            {(field) => (
                                <div className="flex flex-col gap-3">
                                    {field.state.value.length === 0 && (
                                        <div className="rounded-lg border border-dashed p-8 text-center bg-muted">
                                            <Package className="size-8 mx-auto mb-2" />
                                            <p className="text-sm font-semibold">No addons yet</p>
                                            <p className="text-xs mt-1">Add extras like breakfast, airport pickup, or late checkout.</p>
                                        </div>
                                    )}
                                    {field.state.value.map((_, index) => (
                                        <div key={index} className="rounded-lg border p-4 flex flex-col gap-4">
                                            <form.AppField name={`addons[${index}].name`}>
                                                {(field) => <field.FormInput label="Addon name" placeholder="e.g. Daily Breakfast" />}
                                            </form.AppField>

                                            <form.AppField name={`addons[${index}].description`}>
                                                {(field) => (
                                                    <field.FormTextarea
                                                        label="Description"
                                                        placeholder="Short description shown to guests at checkout..."
                                                    />
                                                )}
                                            </form.AppField>

                                            <div className="flex items-end gap-4">
                                                <form.AppField name={`addons[${index}].price`}>
                                                    {(field) => (
                                                        <field.FormInputNumber label="Price" placeholder="0.00" min={0} step="0.01" />
                                                    )}
                                                </form.AppField>
                                                <form.AppField name={`addons[${index}].state`}>
                                                    {(field) => (
                                                        <field.FormRadio
                                                            label="State"
                                                            options={AddonStateOptions.map((value) => ({
                                                                value,
                                                                label: capitalize(value),
                                                            }))}
                                                        />
                                                    )}
                                                </form.AppField>
                                                <Button type="button" variant="destructive" onClick={() => field.removeValue(index)}>
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            const newAddon = {
                                                name: '',
                                                description: '',
                                                price: 0,
                                                state: 'ACTIVE' as const,
                                            }
                                            field.pushValue(newAddon)
                                        }}
                                        className="self-start"
                                    >
                                        <Plus className="size-4" />
                                        Add Addon
                                    </Button>
                                </div>
                            )}
                        </form.AppField>
                    </Section>
                )}

                {/* ════════ PHOTOS ════════ */}
                {activeTab === 'Photos' && (
                    <Section>
                        <SectionLabel>Property Photos</SectionLabel>
                        <form.AppField name="images">{(field) => <field.FormGallery folder="properties" />}</form.AppField>
                    </Section>
                )}

                <Separator className="mt-5 mb-4" />
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                        {PROP_TABS.map((tab) => (
                            <button
                                key={tab}
                                type="button"
                                onClick={() => onActiveTabChange(tab)}
                                className={cn(
                                    'size-1.5 rounded-full transition-all duration-200',
                                    activeTab === tab ? 'bg-primary w-4' : 'bg-muted hover:bg-muted-foreground/30',
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

// ─── Small visual primitives local to the form ─────────────────────
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
