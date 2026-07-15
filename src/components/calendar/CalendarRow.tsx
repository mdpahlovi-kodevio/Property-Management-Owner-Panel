import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { getUnitIcon, STATUS_CONFIG } from '@/lib/calendar'
import { formatDate, getDaysInMonth, isSameDay } from '@/lib/calendar-utils'
import { cn } from '@/lib/utils'
import type { CalendarEntry, CalendarUnit } from '@/types/calendar'
import { useMemo } from 'react'
import { AvatarChip } from './AvatarChip'

interface BarEntry {
    entry: CalendarEntry
    startDay: number
    spanDays: number
    isStart: boolean
}

export function CalendarRow({
    unit,
    entries,
    days,
    year,
    month,
    today,
    onEntryClick,
    onFreeCellClick,
}: {
    unit: CalendarUnit
    entries: CalendarEntry[]
    days: number[]
    year: number
    month: number
    today: Date
    onEntryClick: (entry: CalendarEntry) => void
    onFreeCellClick?: (unitId: string, date: Date) => void
}) {
    const dayMap = useMemo(() => {
        const map = new Map<number, BarEntry | null>()
        days.forEach((d) => map.set(d, null))

        const lastDayInMonth = getDaysInMonth(year, month)

        for (const entry of entries) {
            const ciDate = entry.checkIn
            const coDate = entry.checkOut

            // Clamp to month boundaries so a bar that started last month (or
            // ends next month) still renders correctly.
            const startDay = ciDate.getMonth() === month && ciDate.getFullYear() === year ? ciDate.getDate() : 1

            const endDay =
                coDate.getMonth() === month && coDate.getFullYear() === year ? Math.max(coDate.getDate() - 1, startDay) : lastDayInMonth

            if (startDay > lastDayInMonth || endDay < 1) continue

            const spanDays = Math.max(1, endDay - startDay + 1)

            if (!map.get(startDay)) {
                map.set(startDay, { entry, startDay, spanDays, isStart: true })
            }

            for (let d = startDay + 1; d <= endDay; d++) {
                if (!map.get(d)) {
                    map.set(d, { entry, startDay, spanDays, isStart: false })
                }
            }
        }

        return map
    }, [entries, days, month, year])

    const isTodayAvailable = useMemo(() => {
        const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month
        if (!isCurrentMonth) return null
        const todayEntry = dayMap.get(today.getDate())
        return todayEntry === null || todayEntry === undefined
    }, [dayMap, today, year, month])

    return (
        <div className="flex border-b border-border/60 last:border-b-0 hover:bg-muted/20 transition-colors">
            <div className="w-40 shrink-0 flex items-center gap-2 px-3 py-2 border-r border-border/60 bg-card">
                <span className="text-muted-foreground shrink-0">{getUnitIcon(unit.roomTypeName)}</span>
                <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold truncate">{unit.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">
                        {unit.roomTypeName}
                        {unit.floor ? ` · Floor ${unit.floor}` : ''}
                    </p>
                </div>
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

            <div className="flex flex-1 relative">
                {days.map((d) => {
                    const cellDate = new Date(year, month, d)
                    const isToday = isSameDay(cellDate, today)
                    const dayEntry = dayMap.get(d)
                    const isFree = dayEntry === null || dayEntry === undefined
                    const isPast = cellDate < new Date(today.getFullYear(), today.getMonth(), today.getDate())
                    const clickable = isFree && !isPast && !!onFreeCellClick

                    return (
                        <div
                            key={d}
                            onClick={clickable ? () => onFreeCellClick!(unit.id, cellDate) : undefined}
                            className={cn(
                                'relative border-r border-border/30 last:border-r-0 flex-1 min-w-7 h-12 group/cell',
                                isFree && !isPast && 'bg-emerald-500/[0.07]',
                                isFree && isPast && 'bg-muted/40',
                                isToday && 'bg-primary/[0.07]',
                                clickable && 'cursor-pointer hover:bg-emerald-500/15',
                            )}
                        >
                            <span
                                className={cn(
                                    'absolute bottom-0 left-0 right-0 h-0.75 rounded-t-sm transition-all',
                                    isFree && !isPast && !isToday && 'bg-emerald-500/40',
                                    isFree && isPast && 'bg-muted-foreground/15',
                                    isToday && isFree && 'bg-primary/40',
                                    !isFree && 'bg-transparent',
                                )}
                            />

                            {isFree && !isPast && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/cell:opacity-100 transition-opacity cursor-pointer">
                                            <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-500/15 border border-emerald-500/25 rounded px-1 leading-tight">
                                                ${unit.ratePerNight}
                                            </span>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="top">
                                        <p className="font-semibold text-emerald-400">Available</p>
                                        <p className="opacity-80">
                                            ${unit.ratePerNight} / night · {unit.name}
                                        </p>
                                        {onFreeCellClick && <p className="opacity-60 text-[10px] mt-0.5">Click to create a block</p>}
                                    </TooltipContent>
                                </Tooltip>
                            )}

                            {dayEntry?.isStart &&
                                (() => {
                                    const { entry, spanDays } = dayEntry
                                    const cfg = STATUS_CONFIG[entry.status]
                                    const isBlock = entry.type === 'block'

                                    return (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <button
                                                    id={`calendar-bar-${entry.id}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        onEntryClick(entry)
                                                    }}
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
                                                    {isBlock ? (
                                                        <span className="size-5 shrink-0 rounded-full bg-muted-foreground/20 flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                                                            !
                                                        </span>
                                                    ) : (
                                                        <AvatarChip name={entry.label} status={entry.status} />
                                                    )}
                                                    <span className="truncate leading-none">{entry.label}</span>
                                                </button>
                                            </TooltipTrigger>
                                            <TooltipContent side="top">
                                                <p className="font-semibold">{entry.label}</p>
                                                <p className="opacity-80">
                                                    {formatDate(entry.checkIn)} → {formatDate(entry.checkOut)}
                                                </p>
                                                <p className="opacity-80">
                                                    {entry.nights} nights · {isBlock ? 'Maintenance' : entry.channel}
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
