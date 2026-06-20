import type { Amenity } from './amenity'
import type { Paginated } from './base'
import { request, toQuery } from './base'

// ── Enums (mirror Prisma generated enums) ───────────────
export type PropertyStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
export type PropertyType = 'HOTEL' | 'RESORT' | 'APARTMENT' | 'VILLA' | 'HOSTEL' | 'GUESTHOUSE' | 'BUNGALOW' | 'CAMP' | 'OTHER'

// ── Nested entities ─────────────────────────────────────
export interface PropertyPolicy {
    propertyId: string
    petsAllowed: boolean
    minimumGuestAge: number
    securityDeposit: number | null
    houseRules: string | null
}

export interface PropertyImage {
    id: string
    propertyId: string
    url: string
    alt: string | null
    thumbnail: boolean
    sortOrder: number
    isCover: boolean
}

export interface RoomTypeBed {
    id: string
    roomTypeId: string
    bedType: string
    quantity: number
}

export interface RoomTypeUnit {
    id: string
    roomTypeId: string
    roomNumber: string
    floor: number | null
    status: string
}

export interface RoomType {
    id: string
    propertyId: string
    name: string
    description: string | null
    maxOccupancy: number
    basePrice: number
    currency: string
    totalUnits: number
    beds: RoomTypeBed[]
    amenities: { amenity: Amenity }[]
    images: PropertyImage[]
    units: RoomTypeUnit[]
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
    createdAt: string
    updatedAt: string
    deletedAt: string | null
    policy: PropertyPolicy | null
    amenities: { amenity: Amenity }[]
    images: PropertyImage[]
    roomTypes: RoomType[]
}

/** Slimmer property returned by list (with counts). */
export interface PropertyListItem extends Omit<Property, 'amenities' | 'images' | 'roomTypes'> {
    _count: {
        roomTypes: number
        images: number
        amenities: number
    }
}

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
    websiteId?: string
    policy?: PropertyPolicyPayload
    images?: PropertyImagePayload[]
    amenities?: string[]
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

    get: (id: string) => request<{ data: Property }>(`/owner/property/${id}`),

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
