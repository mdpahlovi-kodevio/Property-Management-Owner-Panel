import { calendarApi, mapApiBlockToCalendarEntry, mapApiBookingToCalendarEntry, mapApiUnitToCalendarUnit } from '@/lib/api'
import { getDaysInMonth } from '@/lib/calendar-utils'
import { BookingStatusValues, type CalendarEntry, type CalendarStatus, type CalendarUnit } from '@/types/calendar'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo, useState } from 'react'

function toISODate(d: Date): string {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
}

export function useCalendarState() {
    const today = useMemo(() => new Date(), [])

    const [currentYear, setCurrentYear] = useState(today.getFullYear())
    const [currentMonth, setCurrentMonth] = useState(today.getMonth())
    const [filterStatus, setFilterStatus] = useState<CalendarStatus | 'all'>('all')
    const [selectedEntry, setSelectedEntry] = useState<CalendarEntry | null>(null)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [refreshTick, setRefreshTick] = useState(0)

    const daysInMonth = getDaysInMonth(currentYear, currentMonth)
    const days = useMemo(() => Array.from({ length: daysInMonth }, (_, i) => i + 1), [daysInMonth])

    // Exclusive upper bound = first day of next month, so a checkout on the
    // month's last day is still included.
    const from = useMemo(() => toISODate(new Date(currentYear, currentMonth, 1)), [currentYear, currentMonth])
    const to = useMemo(() => toISODate(new Date(currentYear, currentMonth + 1, 1)), [currentYear, currentMonth])
    const status = useMemo(() => {
        if (filterStatus === 'all') return undefined
        return filterStatus
    }, [filterStatus])

    const snapshotQuery = useQuery({
        queryKey: ['calendar-snapshot', from, to, status, refreshTick],
        queryFn: () => calendarApi.list({ from, to, status }),
        staleTime: 30_000,
    })

    const statsQuery = useQuery({
        queryKey: ['calendar-stats', from, refreshTick],
        queryFn: () => calendarApi.stats({ date: from }),
        staleTime: 30_000,
    })

    const queryClient = useQueryClient()
    const handleRefresh = useCallback(() => {
        setIsRefreshing(true)
        setRefreshTick((t) => t + 1)
        Promise.all([
            queryClient.invalidateQueries({ queryKey: ['calendar-snapshot'] }),
            queryClient.invalidateQueries({ queryKey: ['calendar-stats'] }),
        ]).finally(() => {
            setTimeout(() => setIsRefreshing(false), 400)
        })
    }, [queryClient])

    const { units, entriesByUnit } = useMemo(() => {
        const snap = snapshotQuery.data?.data
        if (!snap) return { units: [] as CalendarUnit[], entriesByUnit: new Map<string, CalendarEntry[]>() }

        const units = snap.units.map(mapApiUnitToCalendarUnit)
        const entries: CalendarEntry[] = [
            ...snap.bookings.map(mapApiBookingToCalendarEntry),
            ...snap.blocks.map(mapApiBlockToCalendarEntry),
        ]

        const map = new Map<string, CalendarEntry[]>()
        for (const u of units) map.set(u.id, [])
        for (const e of entries) {
            const list = map.get(e.unitId)
            if (list) list.push(e)
        }
        return { units, entriesByUnit: map }
    }, [snapshotQuery.data])

    const goToPrev = useCallback(() => {
        setCurrentMonth((m) => {
            if (m === 0) {
                setCurrentYear((y) => y - 1)
                return 11
            }
            return m - 1
        })
    }, [])

    const goToNext = useCallback(() => {
        setCurrentMonth((m) => {
            if (m === 11) {
                setCurrentYear((y) => y + 1)
                return 0
            }
            return m + 1
        })
    }, [])

    const goToToday = useCallback(() => {
        setCurrentYear(today.getFullYear())
        setCurrentMonth(today.getMonth())
    }, [today])

    const isCurrentMonth = currentYear === today.getFullYear() && currentMonth === today.getMonth()

    return {
        today,
        currentYear,
        currentMonth,
        filterStatus,
        setFilterStatus,
        selectedEntry,
        setSelectedEntry,
        isRefreshing,
        daysInMonth,
        days,
        goToPrev,
        goToNext,
        goToToday,
        handleRefresh,
        isCurrentMonth,
        units,
        entriesByUnit,
        isLoading: snapshotQuery.isLoading,
        isError: snapshotQuery.isError,
        todayStats: statsQuery.data?.data,
        statusOptions: BookingStatusValues,
    }
}
