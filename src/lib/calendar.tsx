import type { Booking, Room, BookingStatus } from '@/types/calendar'
import { BedDouble, BedSingle, Building2, Home } from 'lucide-react'
import type { ReactNode } from 'react'

export const ROOMS: Room[] = [
    { id: 'r101', name: 'Room 101', type: 'single', floor: 1, capacity: 1, ratePerNight: 89 },
    { id: 'r102', name: 'Room 102', type: 'single', floor: 1, capacity: 1, ratePerNight: 89 },
    { id: 'r103', name: 'Room 103', type: 'double', floor: 1, capacity: 2, ratePerNight: 139 },
    { id: 'r201', name: 'Room 201', type: 'double', floor: 2, capacity: 2, ratePerNight: 149 },
    { id: 'r202', name: 'Room 202', type: 'double', floor: 2, capacity: 2, ratePerNight: 149 },
    { id: 'r203', name: 'Room 203', type: 'suite', floor: 2, capacity: 4, ratePerNight: 289 },
    { id: 'r301', name: 'Room 301', type: 'suite', floor: 3, capacity: 4, ratePerNight: 319 },
    { id: 'r302', name: 'Room 302', type: 'villa', floor: 3, capacity: 6, ratePerNight: 489 },
]

function makeDate(year: number, month: number, day: number) {
    return new Date(year, month, day)
}

const NOW = new Date()
const Y = NOW.getFullYear()
const M = NOW.getMonth()

export const BOOKINGS: Booking[] = [
    {
        id: 'b001', guestName: 'Jane Cooper', guestAvatar: 'JC',
        roomId: 'r101', checkIn: makeDate(Y, M, 1), checkOut: makeDate(Y, M, 5),
        status: 'confirmed', nights: 4, totalAmount: 356, channel: 'Direct', guestCount: 1,
    },
    {
        id: 'b002', guestName: 'Wade Warren', guestAvatar: 'WW',
        roomId: 'r102', checkIn: makeDate(Y, M, 3), checkOut: makeDate(Y, M, 8),
        status: 'confirmed', nights: 5, totalAmount: 445, channel: 'Airbnb', guestCount: 1,
    },
    {
        id: 'b003', guestName: 'Dianne Russell', guestAvatar: 'DR',
        roomId: 'r103', checkIn: makeDate(Y, M, 6), checkOut: makeDate(Y, M, 11),
        status: 'pending', nights: 5, totalAmount: 695, channel: 'Booking.com', guestCount: 2,
    },
    {
        id: 'b004', guestName: 'Eleanor Pena', guestAvatar: 'EP',
        roomId: 'r201', checkIn: makeDate(Y, M, 10), checkOut: makeDate(Y, M, 15),
        status: 'confirmed', nights: 5, totalAmount: 745, channel: 'Direct', guestCount: 2,
    },
    {
        id: 'b005', guestName: 'Floyd Miles', guestAvatar: 'FM',
        roomId: 'r203', checkIn: makeDate(Y, M, 12), checkOut: makeDate(Y, M, 18),
        status: 'confirmed', nights: 6, totalAmount: 1734, channel: 'Expedia', guestCount: 3,
        notes: 'Early check-in requested',
    },
    {
        id: 'b006', guestName: 'Courtney Henry', guestAvatar: 'CH',
        roomId: 'r301', checkIn: makeDate(Y, M, 8), checkOut: makeDate(Y, M, 12),
        status: 'cancelled', nights: 4, totalAmount: 1276, channel: 'Direct', guestCount: 2,
    },
    {
        id: 'b007', guestName: 'Cody Fisher', guestAvatar: 'CF',
        roomId: 'r302', checkIn: makeDate(Y, M, 15), checkOut: makeDate(Y, M, 22),
        status: 'confirmed', nights: 7, totalAmount: 3423, channel: 'Direct', guestCount: 5,
        notes: 'VIP guest – airport transfer needed',
    },
    {
        id: 'b008', guestName: 'Maintenance', guestAvatar: 'MT',
        roomId: 'r202', checkIn: makeDate(Y, M, 5), checkOut: makeDate(Y, M, 7),
        status: 'blocked', nights: 2, totalAmount: 0, channel: 'Internal', guestCount: 0,
        notes: 'Deep cleaning scheduled',
    },
    {
        id: 'b009', guestName: 'Robert Fox', guestAvatar: 'RF',
        roomId: 'r101', checkIn: makeDate(Y, M, 12), checkOut: makeDate(Y, M, 17),
        status: 'confirmed', nights: 5, totalAmount: 445, channel: 'Booking.com', guestCount: 1,
    },
    {
        id: 'b010', guestName: 'Jenny Wilson', guestAvatar: 'JW',
        roomId: 'r202', checkIn: makeDate(Y, M, 18), checkOut: makeDate(Y, M, 23),
        status: 'pending', nights: 5, totalAmount: 745, channel: 'Airbnb', guestCount: 2,
    },
    {
        id: 'b011', guestName: 'Albert Flores', guestAvatar: 'AF',
        roomId: 'r103', checkIn: makeDate(Y, M, 20), checkOut: makeDate(Y, M, 26),
        status: 'confirmed', nights: 6, totalAmount: 834, channel: 'Direct', guestCount: 2,
    },
    {
        id: 'b012', guestName: 'Kristin Watson', guestAvatar: 'KW',
        roomId: 'r203', checkIn: makeDate(Y, M, 22), checkOut: makeDate(Y, M, 28),
        status: 'confirmed', nights: 6, totalAmount: 1734, channel: 'Expedia', guestCount: 4,
    },
]

export const STATUS_CONFIG: Record<
    BookingStatus,
    { label: string; bg: string; text: string; border: string; dot: string }
> = {
    confirmed: {
        label: 'Confirmed',
        bg: 'bg-primary/10',
        text: 'text-primary',
        border: 'border-primary/30',
        dot: 'bg-primary',
    },
    pending: {
        label: 'Pending',
        bg: 'bg-amber-500/10',
        text: 'text-amber-600',
        border: 'border-amber-500/30',
        dot: 'bg-amber-500',
    },
    cancelled: {
        label: 'Cancelled',
        bg: 'bg-destructive/10',
        text: 'text-destructive',
        border: 'border-destructive/30',
        dot: 'bg-destructive',
    },
    blocked: {
        label: 'Blocked',
        bg: 'bg-muted-foreground/10',
        text: 'text-muted-foreground',
        border: 'border-muted-foreground/20',
        dot: 'bg-muted-foreground',
    },
}

export const ROOM_TYPE_ICONS: Record<Room['type'], ReactNode> = {
    single: <BedSingle className="size-3.5" />,
    double: <BedDouble className="size-3.5" />,
    suite: <Building2 className="size-3.5" />,
    villa: <Home className="size-3.5" />,
}

export const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
]
