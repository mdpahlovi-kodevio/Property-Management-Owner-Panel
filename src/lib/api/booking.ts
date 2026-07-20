import type { Paginated } from './base'
import { request, toQuery } from './base'

export const BookingStatusOptions = ['PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED', 'NO_SHOW'] as const
export type BookingStatus = (typeof BookingStatusOptions)[number]

export const BookingSourceOptions = ['DIRECT', 'MANUAL', 'OTA', 'API'] as const
export type BookingSource = (typeof BookingSourceOptions)[number]

export type PaymentMethod = 'CASH' | 'CARD' | 'BANK'
export type PaymentStatus = 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'REFUNDED'

export interface BookingGuest {
    id: string
    user: {
        id: string
        name: string
        email: string
        phone: string | null
        image: string | null
    }
}

export interface BookingAddon {
    id: string
    price: string
    propertyAddon: {
        id: string
        name: string
    }
}

export interface BookingPayment {
    id: string
    amount: string
    currency: string
    method: PaymentMethod
    status: PaymentStatus
    provider: string | null
    providerRef: string | null
    paidAt: string | null
    refundedAt: string | null
    failedAt: string | null
    note: string | null
    createdAt: string
}

export interface BookingStatusHistoryEntry {
    id: string
    fromStatus: BookingStatus | null
    toStatus: BookingStatus
    reason: string | null
    actor: {
        id: string
        name: string
    } | null
    createdAt: string
}

export interface Booking {
    id: string
    propertyId: string
    roomTypeId: string
    unitId: string
    guestId: string
    checkInDate: string
    checkOutDate: string
    nights: number
    adults: number
    children: number
    status: BookingStatus
    source: BookingSource
    channelRef: string | null
    nightlyRate: string
    unitPrice: string
    addonsTotal: string
    taxTotal: string
    commissionRate: string
    commissionAmount: string
    grandTotal: string
    amountPaid: string
    amountRefunded: string
    currency: string
    confirmedAt: string | null
    checkedInAt: string | null
    checkedOutAt: string | null
    cancelledAt: string | null
    cancellationReason: string | null
    createdAt: string
    unit: {
        id: string
        roomNumber: string
        floor: string | null
    }
    roomType: {
        id: string
        name: string
        internalCode: string
        images: {
            id: string
            url: string
            sortOrder: number
            thumbnail: boolean
        }[]
    }
    property: {
        id: string
        name: string
        slug: string
        currency: string
    }
    guest: BookingGuest
    addons: BookingAddon[]
    payments: BookingPayment[]
    statusHistory: BookingStatusHistoryEntry[]
}

export interface ListBookingParams {
    page?: number
    limit?: number
    status?: BookingStatus
    checkInFrom?: string
    checkInTo?: string
    search?: string
    propertyId?: string
}

export interface CreateBookingGuest {
    name: string
    email: string
    phone?: string
}

export interface CreateBookingPayload {
    propertyId: string
    roomTypeId: string
    unitId: string
    checkInDate: string
    checkOutDate: string
    adults: number
    children?: number
    addonIds?: string[]
    guest: CreateBookingGuest
}

export interface CancelBookingPayload {
    reason: string
}

export const bookingApi = {
    list: (params?: ListBookingParams) =>
        request<Paginated<Booking>>(`/owner/booking${toQuery((params ?? {}) as Record<string, string | number | boolean | undefined>)}`),

    findOne: (id: string) => request<{ data: Booking }>(`/owner/booking/${id}`),

    create: (payload: CreateBookingPayload) =>
        request<{ data: Booking }>(`/owner/booking`, {
            method: 'POST',
            body: JSON.stringify(payload),
        }),

    confirm: (id: string) =>
        request<{ data: Booking }>(`/owner/booking/${id}/confirm`, {
            method: 'POST',
        }),

    checkIn: (id: string) =>
        request<{ data: Booking }>(`/owner/booking/${id}/check-in`, {
            method: 'POST',
        }),

    checkOut: (id: string) =>
        request<{ data: Booking }>(`/owner/booking/${id}/check-out`, {
            method: 'POST',
        }),

    cancel: (id: string, payload: CancelBookingPayload) =>
        request<{ data: Booking }>(`/owner/booking/${id}/cancel`, {
            method: 'POST',
            body: JSON.stringify(payload),
        }),
}
