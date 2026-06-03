import { useState, useMemo, useCallback } from 'react'
import { getDaysInMonth } from '@/lib/calendar-utils'
import type { Booking } from '@/types/calendar'

export function useCalendarState() {
    const today = useMemo(() => new Date(), [])

    const [currentYear, setCurrentYear] = useState(today.getFullYear())
    const [currentMonth, setCurrentMonth] = useState(today.getMonth())
    const [filterStatus, setFilterStatus] = useState<string>('all')
    const [filterType, setFilterType] = useState<string>('all')
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
    const [isRefreshing, setIsRefreshing] = useState(false)

    const daysInMonth = getDaysInMonth(currentYear, currentMonth)
    const days = useMemo(
        () => Array.from({ length: daysInMonth }, (_, i) => i + 1),
        [daysInMonth],
    )

    const goToPrev = useCallback(() => {
        setCurrentMonth((m) => {
            if (m === 0) { setCurrentYear((y) => y - 1); return 11 }
            return m - 1
        })
    }, [])

    const goToNext = useCallback(() => {
        setCurrentMonth((m) => {
            if (m === 11) { setCurrentYear((y) => y + 1); return 0 }
            return m + 1
        })
    }, [])

    const goToToday = useCallback(() => {
        setCurrentYear(today.getFullYear())
        setCurrentMonth(today.getMonth())
    }, [today])

    const handleRefresh = useCallback(() => {
        setIsRefreshing(true)
        setTimeout(() => setIsRefreshing(false), 800)
    }, [])

    const isCurrentMonth =
        currentYear === today.getFullYear() && currentMonth === today.getMonth()

    return {
        today,
        currentYear,
        currentMonth,
        filterStatus,
        setFilterStatus,
        filterType,
        setFilterType,
        selectedBooking,
        setSelectedBooking,
        isRefreshing,
        daysInMonth,
        days,
        goToPrev,
        goToNext,
        goToToday,
        handleRefresh,
        isCurrentMonth,
    }
}
