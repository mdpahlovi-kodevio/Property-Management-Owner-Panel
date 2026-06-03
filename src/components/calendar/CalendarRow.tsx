import { useMemo } from 'react'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { isSameDay, getDaysInMonth, formatDate } from '@/lib/calendar-utils'
import { ROOM_TYPE_ICONS, STATUS_CONFIG } from '@/data/mock-calendar'
import type { Booking, Room } from '@/types/calendar'
import { AvatarChip } from './AvatarChip'

interface BarEntry {
    booking: Booking
    startDay: number
    spanDays: number
    isStart: boolean
}

export function CalendarRow({
    room,
    bookings,
    days,
    year,
    month,
    today,
    onBookingClick,
}: {
    room: Room
    bookings: Booking[]
    days: number[]
    year: number
    month: number
    today: Date
    onBookingClick: (b: Booking) => void
}) {
    // Build a map from day → bar entry (only set at the bar's start day)
    const dayMap = useMemo(() => {
        const map = new Map<number, BarEntry | null>()
        days.forEach((d) => map.set(d, null))

        const lastDayInMonth = getDaysInMonth(year, month)

        for (const booking of bookings) {
            const ciDate = booking.checkIn
            const coDate = booking.checkOut

            // Determine the visual start / end in this month
            const startDay =
                ciDate.getMonth() === month && ciDate.getFullYear() === year
                    ? ciDate.getDate()
                    : 1

            const endDay =
                coDate.getMonth() === month && coDate.getFullYear() === year
                    ? coDate.getDate() - 1
                    : lastDayInMonth

            if (startDay > lastDayInMonth || endDay < 1) continue

            const spanDays = Math.max(1, endDay - startDay + 1)

            // Place bar entry at startDay
            if (!map.get(startDay)) {
                map.set(startDay, { booking, startDay, spanDays, isStart: true })
            }

            // Mark subsequent days as "occupied" (no bar rendered)
            for (let d = startDay + 1; d <= endDay; d++) {
                if (!map.get(d)) {
                    map.set(d, { booking, startDay, spanDays, isStart: false })
                }
            }
        }

        return map
    }, [bookings, days, month, year])

    // Compute today's availability for the room label badge
    const isTodayAvailable = useMemo(() => {
        const todayEntry = dayMap.get(today.getDate())
        const isCurrentMonth =
            today.getFullYear() === year && today.getMonth() === month
        if (!isCurrentMonth) return null
        return todayEntry === null || todayEntry === undefined
    }, [dayMap, today, year, month])

    return (
        <div className="flex border-b border-border/60 last:border-b-0 hover:bg-muted/20 transition-colors">
            {/* Room label */}
            <div className="w-40 shrink-0 flex items-center gap-2 px-3 py-2 border-r border-border/60 bg-card">
                <span className="text-muted-foreground shrink-0">{ROOM_TYPE_ICONS[room.type]}</span>
                <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold truncate">{room.name}</p>
                    <p className="text-[10px] text-muted-foreground capitalize">
                        {room.type} · Floor {room.floor}
                    </p>
                </div>
                {/* Today availability badge */}
                {isTodayAvailable !== null && (
                    <span
                        className={cn(
                            'shrink-0 text-[9px] font-semibold px-1.5 py-0.5 rounded-full border leading-none',
                            isTodayAvailable
                                ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30'
                                : 'bg-muted text-muted-foreground border-border',
                        )}
                    >
                        {isTodayAvailable ? 'Free' : 'Occ.'}
                    </span>
                )}
            </div>

            {/* Day cells */}
            <div className="flex flex-1 relative">
                {days.map((d) => {
                    const cellDate = new Date(year, month, d)
                    const isToday = isSameDay(cellDate, today)
                    const entry = dayMap.get(d)
                    const isFree = entry === null || entry === undefined
                    const isPast = cellDate < new Date(today.getFullYear(), today.getMonth(), today.getDate())

                    return (
                        <div
                            key={d}
                            className={cn(
                                'relative border-r border-border/30 last:border-r-0 flex-1 min-w-7 h-12 group/cell',
                                // Free future/today cells: emerald tint
                                isFree && !isPast && 'bg-emerald-500/[0.07]',
                                // Free past cells: very subtle muted
                                isFree && isPast && 'bg-muted/40',
                                // Today column tint (overrides)
                                isToday && 'bg-primary/[0.07]',
                            )}
                        >
                            {/* Bottom availability strip */}
                            <span
                                className={cn(
                                    'absolute bottom-0 left-0 right-0 h-0.75 rounded-t-sm transition-all',
                                    isFree && !isPast && !isToday && 'bg-emerald-500/40',
                                    isFree && isPast && 'bg-muted-foreground/15',
                                    isToday && isFree && 'bg-primary/40',
                                    !isFree && 'bg-transparent',
                                )}
                            />
                            {/* Available rate chip — visible on hover for free future/today cells */}
                            {isFree && !isPast && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/cell:opacity-100 transition-opacity cursor-default">
                                            <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-500/15 border border-emerald-500/25 rounded px-1 leading-tight">
                                                ${room.ratePerNight}
                                            </span>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                        <p className="font-semibold text-emerald-400">Available</p>
                                        <p className="opacity-80">${room.ratePerNight} / night · {room.name}</p>
                                    </TooltipContent>
                                </Tooltip>
                            )}

                            {/* Booking bar */}
                            {entry?.isStart && (() => {
                                const { booking, spanDays } = entry
                                const cfg = STATUS_CONFIG[booking.status]

                                return (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <button
                                                id={`booking-bar-${booking.id}`}
                                                onClick={() => onBookingClick(booking)}
                                                className={cn(
                                                    'absolute inset-y-1.5 left-0.5 flex items-center gap-1 px-2 rounded-md',
                                                    'text-[10px] font-semibold truncate cursor-pointer',
                                                    'transition-all hover:opacity-90 hover:shadow-sm active:scale-[0.99] border',
                                                    cfg.bg,
                                                    cfg.text,
                                                    cfg.border,
                                                )}
                                                style={{
                                                    width: `calc(${spanDays * 100}% - 4px)`,
                                                    zIndex: 10,
                                                }}
                                            >
                                                <AvatarChip name={booking.guestName} status={booking.status} />
                                                <span className="truncate leading-none">{booking.guestName}</span>
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent side="top">
                                            <p className="font-semibold">{booking.guestName}</p>
                                            <p className="opacity-80">
                                                {formatDate(booking.checkIn)} → {formatDate(booking.checkOut)}
                                            </p>
                                            <p className="opacity-80">
                                                {booking.nights} nights · {booking.channel}
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>
                                )
                            })()}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
