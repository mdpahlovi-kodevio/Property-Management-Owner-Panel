import type { Amenity } from './amenity'
import type { Paginated } from './base'
import { request, toQuery } from './base'

// ── Enums (mirror Prisma generated enums) ───────────────
export const BathroomTypeOptions = ['PRIVATE', 'SHARED'] as const
export type BathroomType = (typeof BathroomTypeOptions)[number]

export const BedTypeOptions = ['KING', 'QUEEN', 'DOUBLE', 'TWIN', 'SINGLE', 'BUNK', 'SOFA_BED', 'MURPHY', 'FUTON', 'ROLLAWAY'] as const
export type BedType = (typeof BedTypeOptions)[number]

export const RoomTypeStatusOptions = ['DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED'] as const
export type RoomTypeStatus = (typeof RoomTypeStatusOptions)[number]

// ── Nested entities ─────────────────────────────────────
export interface RoomTypeBed {
    id: string
    bedType: BedType
    quantity: number
}

export interface RoomTypeImage {
    id: string
    url: string
    thumbnail: boolean
    sortOrder: number
    createdAt: string
}

export interface RoomTypeUnit {
    id: string
    roomNumber: string
    floor: string | null
}

// ── Top-level shapes ────────────────────────────────────
/** Full room type returned by findOne / create / update. */
export interface RoomType {
    id: string
    propertyId: string
    name: string
    internalCode: string
    description: string | null
    maxAdults: number
    maxChildren: number
    maxOccupancy: number
    basePrice: string | number
    roomSize: number | null
    smokingRoom: boolean
    accessibleRoom: boolean
    bathroomType: BathroomType
    viewType: string | null
    status: RoomTypeStatus
    createdAt: string
    beds: RoomTypeBed[]
    amenities: { amenity: Amenity }[]
    images: RoomTypeImage[]
    units: RoomTypeUnit[]
}

export interface RoomTypeListItem extends Omit<RoomType, 'beds' | 'amenities' | 'images' | 'units'> {
    _count: { beds: number; units: number }
}

// ── Query / payload types ───────────────────────────────
export interface ListRoomTypeParams {
    page?: number
    limit?: number
    search?: string
    propertyId?: string
    bathroomType?: BathroomType
    status?: RoomTypeStatus
}

export interface RoomTypeBedPayload {
    bedType: BedType
    quantity?: number
}

export interface RoomTypeImagePayload {
    url: string
    thumbnail?: boolean
    sortOrder?: number
}

export interface RoomTypeUnitPayload {
    roomNumber: string
    floor?: string
}

export interface CreateRoomTypePayload {
    propertyId: string
    name: string
    internalCode: string
    description?: string
    maxAdults?: number
    maxChildren?: number
    maxOccupancy?: number
    basePrice: number
    roomSize?: number
    smokingRoom?: boolean
    accessibleRoom?: boolean
    bathroomType?: BathroomType
    viewType?: string
    status?: RoomTypeStatus
    beds?: RoomTypeBedPayload[]
    amenities?: string[]
    images?: RoomTypeImagePayload[]
    units?: RoomTypeUnitPayload[]
}

/**
 * Patch payload for PATCH /owner/property/:propertyId/room-type/:id.
 * Every field is optional. To update beds, amenities, images or units, send the
 * FULL new list — the backend will delete all existing rows and replace them with
 * the provided list. Omit a key to leave that relation untouched; send `[]` to
 * clear it.
 */
export type UpdateRoomTypePayload = Partial<CreateRoomTypePayload>

// ── API ─────────────────────────────────────────────────
export const roomTypeApi = {
    list: (params?: ListRoomTypeParams) =>
        request<Paginated<RoomTypeListItem>>(
            `/owner/room-type${toQuery((params ?? {}) as Record<string, string | number | boolean | undefined>)}`,
        ),

    listPageLess: () => request<{ data: RoomType[] }>(`/owner/room-type/page-less`),

    getBySlug: (propertyId: string, slug: string) => request<{ data: RoomType }>(`/owner/room-type/${propertyId}/${slug}`),

    create: (payload: CreateRoomTypePayload) =>
        request<{ data: RoomType }>(`/owner/room-type`, {
            method: 'POST',
            body: JSON.stringify(payload),
        }),

    update: (id: string, payload: UpdateRoomTypePayload) =>
        request<{ data: RoomType }>(`/owner/room-type/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(payload),
        }),
}
