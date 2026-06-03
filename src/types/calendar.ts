export type BookingStatus = 'confirmed' | 'pending' | 'cancelled' | 'blocked'

export interface Booking {
    id: string
    guestName: string
    guestAvatar: string
    roomId: string
    checkIn: Date
    checkOut: Date
    status: BookingStatus
    nights: number
    totalAmount: number
    channel: string
    guestCount: number
    notes?: string
}

export interface Room {
    id: string
    name: string
    type: 'single' | 'double' | 'suite' | 'villa'
    floor: number
    capacity: number
    ratePerNight: number
}
