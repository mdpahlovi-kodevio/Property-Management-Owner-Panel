export interface BaseEntity {
    id: string
    createdAt?: Date
    updatedAt?: Date
}

/**
 * Mirrors the Prisma `BookingStatus` enum plus a virtual `BLOCKED` value for
 * `UnitBlock` entries (maintenance / OOO).
 */
export type CalendarStatus = 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED' | 'NO_SHOW' | 'EXPIRED' | 'BLOCKED'

export const BookingStatusValues: CalendarStatus[] = [
    'PENDING',
    'CONFIRMED',
    'CHECKED_IN',
    'CHECKED_OUT',
    'CANCELLED',
    'NO_SHOW',
    'EXPIRED',
]

export type BookingChannel = 'DIRECT' | 'MANUAL' | 'OTA' | 'API' | string

/**
 * Unified entry rendered on the calendar grid. A booking (`type: 'booking'`)
 * represents a guest reservation; a block (`type: 'block'`) represents a
 * maintenance / OOO window.
 */
export interface CalendarEntry extends BaseEntity {
    type: 'booking' | 'block'
    unitId: string
    checkIn: Date
    checkOut: Date
    status: CalendarStatus
    /** Display label (guest name for bookings, reason for blocks). */
    label: string
    avatar?: string | null
    nights: number
    totalAmount: number
    channel: BookingChannel
    guestCount: number
    reason?: string
    currency?: string
}

/** Physical room / unit available for booking. */
export interface CalendarUnit extends BaseEntity {
    name: string
    floor: string | null
    ratePerNight: number
    capacity: number
    roomTypeId: string
    roomTypeName: string
    propertyId: string
    propertyName: string
    propertyCurrency: string
}

export interface CalendarDayStats {
    date: string
    total: number
    booked: number
    available: number
    maintenance: number
}
