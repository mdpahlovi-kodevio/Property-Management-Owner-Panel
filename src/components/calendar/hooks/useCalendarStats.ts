import { useMemo, useCallback } from 'react'
import type { Room, Booking } from '@/types/calendar'
import { ROOMS, BOOKINGS } from '@/data/mock-calendar'

interface UseCalendarStatsProps {
    currentYear: number
    currentMonth: number
    days: number[]
    daysInMonth: number
    today: Date
    filterStatus: string
    filterType: string
}

export function useCalendarStats({
    currentYear,
    currentMonth,
    days,
    daysInMonth,
    today,
    filterStatus,
    filterType,
}: UseCalendarStatsProps) {

    const filteredRooms = useMemo(
        () => (filterType === 'all' ? ROOMS : ROOMS.filter((r) => r.type === filterType)),
        [filterType],
    )

    const bookingsForRoom = useCallback(
        (roomId: string): Booking[] => {
            const monthStart = new Date(currentYear, currentMonth, 1)
            const monthEnd = new Date(currentYear, currentMonth + 1, 0)

            return BOOKINGS.filter((b) => {
                if (b.roomId !== roomId) return false
                if (filterStatus !== 'all' && b.status !== filterStatus) return false
                // Overlaps this month?
                return b.checkIn <= monthEnd && b.checkOut > monthStart
            })
        },
        [filterStatus, currentYear, currentMonth],
    )

    const stats = useMemo(() => {
        const monthStart = new Date(currentYear, currentMonth, 1)
        const monthEnd = new Date(currentYear, currentMonth + 1, 0)

        const monthBookings = BOOKINGS.filter(
            (b) => b.checkIn <= monthEnd && b.checkOut > monthStart,
        )

        const confirmed = monthBookings.filter((b) => b.status === 'confirmed').length
        const pending = monthBookings.filter((b) => b.status === 'pending').length
        const revenue = monthBookings
            .filter((b) => b.status === 'confirmed')
            .reduce((s, b) => s + b.totalAmount, 0)

        // Occupancy – count room-days occupied by confirmed/blocked bookings
        let occupiedDays = 0
        ROOMS.forEach((room) => {
            const rbs = BOOKINGS.filter(
                (b) =>
                    b.roomId === room.id &&
                    (b.status === 'confirmed' || b.status === 'blocked'),
            )
            days.forEach((d) => {
                const cell = new Date(currentYear, currentMonth, d)
                if (rbs.some((b) => cell >= b.checkIn && cell < b.checkOut)) {
                    occupiedDays++
                }
            })
        })

        const totalRoomDays = ROOMS.length * daysInMonth
        const occupancy = Math.round((occupiedDays / totalRoomDays) * 100)

        return { confirmed, pending, revenue, occupancy }
    }, [currentYear, currentMonth, days, daysInMonth])

    const availabilityByType = useMemo(() => {
        const types: Room['type'][] = ['single', 'double', 'suite', 'villa']
        return types.map((type) => {
            const roomsOfType = ROOMS.filter((r) => r.type === type)
            const freeToday = roomsOfType.filter((room) => {
                const occupying = BOOKINGS.filter(
                    (b) =>
                        b.roomId === room.id &&
                        (b.status === 'confirmed' || b.status === 'blocked') &&
                        b.checkIn <= today &&
                        b.checkOut > today,
                )
                return occupying.length === 0
            })
            return { type, total: roomsOfType.length, free: freeToday.length }
        })
    }, [today])

    const todayStats = useMemo(() => {
        let booked = 0;
        let maintenance = 0;

        ROOMS.forEach(room => {
            const occupying = BOOKINGS.filter(
                (b) =>
                    b.roomId === room.id &&
                    b.checkIn <= today &&
                    b.checkOut > today,
            )
            
            if (occupying.some(b => b.status === 'blocked')) {
                maintenance++;
            } else if (occupying.some(b => b.status === 'confirmed' || b.status === 'pending')) {
                booked++;
            }
        });

        return {
            total: ROOMS.length,
            booked,
            maintenance,
            available: ROOMS.length - booked - maintenance
        }
    }, [today])

    return {
        filteredRooms,
        bookingsForRoom,
        stats,
        availabilityByType,
        todayStats,
    }
}
