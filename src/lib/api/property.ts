import type { Amenity } from './amenity'
import type { Paginated } from './base'
import { request, toQuery } from './base'
import type { RoomType } from './room-type'

// ── Enums (mirror Prisma generated enums) ───────────────
export const PropertyStatusOptions = ['DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED'] as const
export type PropertyStatus = (typeof PropertyStatusOptions)[number]

export const AddonStateOptions = ['ACTIVE', 'INACTIVE'] as const
export type AddonState = (typeof AddonStateOptions)[number]

export const PropertyTypeOptions = [
    'HOTEL',
    'RESORT',
    'BOUTIQUE_HOTEL',
    'SERVICED_APARTMENT',
    'HOSTEL',
    'GUEST_HOUSE',
    'VACATION_RENTAL',
    'APARTMENT',
    'VILLA',
    'BED_AND_BREAKFAST',
    'MOTEL',
    'OTHER',
] as const
export type PropertyType = (typeof PropertyTypeOptions)[number]

// ── Nested entities ─────────────────────────────────────
export interface PropertyPolicy {
    propertyId: string
    petsAllowed: boolean
    minimumGuestAge: number
    securityDeposit: string | number | null
    houseRules: string | null
}

export interface PropertyImage {
    id: string
    propertyId: string
    url: string
    thumbnail: boolean
    sortOrder: number
    createdAt: string
}

export interface PropertyAddon {
    id: string
    propertyId: string
    name: string
    description: string | null
    price: string | number
    state: AddonState
    createdAt: string
    updatedAt: string
}

// ── Top-level property shapes ───────────────────────────
/** Full property returned by findOne / create / update. */
export interface Property {
    id: string
    ownerId: string
    websiteId: string | null
    name: string
    slug: string
    propertyType: PropertyType
    status: PropertyStatus
    description: string | null
    country: string
    state: string | null
    city: string
    postalCode: string | null
    address1: string
    address2: string | null
    latitude: number | null
    longitude: number | null
    checkInTime: string
    checkOutTime: string
    taxRate: string | number | null
    currency: string | null
    rating: number
    reviewCount: number
    createdAt: string
    updatedAt: string
    deletedAt: string | null
    policy: PropertyPolicy | null
    amenities: { amenity: Amenity }[]
    images: PropertyImage[]
    addons: PropertyAddon[]
    roomTypes: RoomType[]
}

/** Slimmer property returned by list (with counts). */
export interface PropertyListItem extends Omit<Property, 'policy' | 'amenities' | 'images' | 'roomTypes'> {}

// ── Query / payload types ───────────────────────────────
export interface ListPropertyParams {
    page?: number
    limit?: number
    search?: string
    status?: PropertyStatus
    propertyType?: PropertyType
}

export interface PropertyPolicyPayload {
    petsAllowed?: boolean
    minimumGuestAge?: number
    securityDeposit?: number
    houseRules?: string
}

export interface PropertyImagePayload {
    url: string
    thumbnail?: boolean
    sortOrder?: number
}

export interface PropertyAddonPayload {
    name: string
    description?: string
    price: number
    state?: AddonState
}

export interface CreatePropertyPayload {
    name: string
    slug: string
    propertyType: PropertyType
    status?: PropertyStatus
    description?: string
    country: string
    state?: string
    city: string
    postalCode?: string
    address1: string
    address2?: string
    latitude?: number
    longitude?: number
    checkInTime: string
    checkOutTime: string
    taxRate?: number
    websiteId?: string
    policy?: PropertyPolicyPayload
    images?: PropertyImagePayload[]
    amenities?: string[]
    addons?: PropertyAddonPayload[]
}

/**
 * Patch payload for PATCH /owner/property/:id.
 * Every field is optional. To update images or amenities, send the FULL new
 * list — the backend will delete all existing rows and replace them with the
 * provided list. Omit a key to leave that relation untouched; send `[]` to
 * clear it.
 */
export type UpdatePropertyPayload = Partial<CreatePropertyPayload>

// ── API ─────────────────────────────────────────────────
export const propertyApi = {
    list: (params?: Record<string, string | number | boolean | undefined>) =>
        request<Paginated<PropertyListItem>>(`/owner/property${toQuery(params ?? {})}`),

    listPageLess: () => request<{ data: PropertyListItem[] }>(`/owner/property/page-less`),

    getBySlug: (slug: string) => request<{ data: Property }>(`/owner/property/${slug}`),

    create: (payload: CreatePropertyPayload) =>
        request<{ data: Property }>(`/owner/property`, {
            method: 'POST',
            body: JSON.stringify(payload),
        }),

    update: (id: string, payload: UpdatePropertyPayload) =>
        request<{ data: Property }>(`/owner/property/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(payload),
        }),

    remove: (id: string) =>
        request<void>(`/owner/property/${id}`, {
            method: 'DELETE',
        }),
}
