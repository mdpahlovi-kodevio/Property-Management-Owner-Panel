import type { CalendarDayStats, CalendarEntry, CalendarUnit } from '@/types/calendar'
import { request, toQuery } from './base'

export interface CalendarApiUnit {
    id: string
    roomNumber: string
    floor: string | null
    roomTypeId: string
    roomType: {
        id: string
        name: string
        internalCode: string
        maxOccupancy: number
        property: {
            id: string
            name: string
            slug: string
            currency: string
        }
        ratePlans: { id: string; defaultPrice: string | number }[]
    }
}

export interface CalendarApiBooking {
    id: string
    unitId: string
    roomTypeId: string
    propertyId: string
    checkInDate: string
    checkOutDate: string
    nights: number
    adults: number
    children: number
    status: 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED' | 'NO_SHOW' | 'EXPIRED'
    source: 'DIRECT' | 'MANUAL' | 'OTA' | 'API'
    channelRef: string | null
    currency: string
    grandTotal: string | number
    guest: {
        id: string
        user: {
            id: string
            name: string
            email: string
            phone: string | null
            image: string | null
        }
    }
    property: { id: string; name: string; currency: string }
    roomType: { id: string; name: string }
    unit: { id: string; roomNumber: string; floor: string | null }
}

export interface CalendarApiBlock {
    id: string
    unitId: string
    fromDate: string
    toDate: string
    reason: string | null
    createdAt: string
}

export interface CalendarSnapshot {
    units: CalendarApiUnit[]
    bookings: CalendarApiBooking[]
    blocks: CalendarApiBlock[]
}

export const calendarApi = {
    list: (params: Record<string, string | number | boolean | undefined>) =>
        request<{ data: CalendarSnapshot }>(`/owner/calendar${toQuery(params ?? {})}`),

    stats: (params: Record<string, string | number | boolean | undefined>) =>
        request<{ data: CalendarDayStats }>(`/owner/calendar/stats${toQuery(params ?? {})}`),
}

export function mapApiUnitToCalendarUnit(api: CalendarApiUnit): CalendarUnit {
    const priceRaw = api.roomType.ratePlans[0]?.defaultPrice
    const ratePerNight = typeof priceRaw === 'string' ? parseFloat(priceRaw) : (priceRaw ?? 0)

    return {
        id: api.id,
        name: api.roomNumber,
        floor: api.floor,
        ratePerNight: Number.isFinite(ratePerNight) ? ratePerNight : 0,
        capacity: api.roomType.maxOccupancy,
        roomTypeId: api.roomTypeId,
        roomTypeName: api.roomType.name,
        propertyId: api.roomType.property.id,
        propertyName: api.roomType.property.name,
        propertyCurrency: api.roomType.property.currency,
    }
}

export function mapApiBookingToCalendarEntry(api: CalendarApiBooking): CalendarEntry {
    const total = typeof api.grandTotal === 'string' ? parseFloat(api.grandTotal) : api.grandTotal
    return {
        id: api.id,
        type: 'booking',
        unitId: api.unitId,
        checkIn: new Date(api.checkInDate),
        checkOut: new Date(api.checkOutDate),
        status: api.status,
        label: api.guest.user.name,
        avatar: api.guest.user.image ?? null,
        nights: api.nights,
        totalAmount: Number.isFinite(total) ? total : 0,
        channel: api.source,
        guestCount: api.adults + api.children,
        currency: api.currency,
    }
}

export function mapApiBlockToCalendarEntry(api: CalendarApiBlock): CalendarEntry {
    const ms = new Date(api.toDate).getTime() - new Date(api.fromDate).getTime()
    const nights = Math.max(1, Math.round(ms / 86_400_000))
    return {
        id: api.id,
        type: 'block',
        unitId: api.unitId,
        checkIn: new Date(api.fromDate),
        checkOut: new Date(api.toDate),
        status: 'BLOCKED',
        label: api.reason ?? 'Maintenance',
        nights,
        totalAmount: 0,
        channel: 'Internal',
        guestCount: 0,
        reason: api.reason ?? undefined,
    }
}
