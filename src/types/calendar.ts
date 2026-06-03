/**
 * Represents the base properties shared across all entities.
 */
export interface BaseEntity {
    id: string
    createdAt?: Date
    updatedAt?: Date
}

export type BookingStatus = 'confirmed' | 'pending' | 'cancelled' | 'blocked'
export type RoomType = 'single' | 'double' | 'suite' | 'villa'
export type BookingChannel = 'Direct' | 'Airbnb' | 'Booking.com' | 'Expedia' | 'Internal' | string

/**
 * Represents a reservation made by a guest.
 */
export interface Booking extends BaseEntity {
    guestName: string
    guestAvatar: string
    roomId: string
    checkIn: Date
    checkOut: Date
    status: BookingStatus
    nights: number
    totalAmount: number
    channel: BookingChannel
    guestCount: number
    notes?: string
    /** Optional field tracking whether the booking has been paid for */
    paymentStatus?: 'unpaid' | 'partial' | 'paid' | 'refunded'
}

/**
 * Represents a physical room or property unit available for booking.
 */
export interface Room extends BaseEntity {
    name: string
    type: RoomType
    floor: number
    capacity: number
    ratePerNight: number
    /** Optional array of amenities available in the room */
    amenities?: string[]
    /** Indicates if the room is currently out of service (e.g., for repairs) */
    isOutOfOrder?: boolean
}
