import { PageHeader } from '#/components/ui/page-header'
import { BlockDialog } from '@/components/calendar/BlockDialog'
import { BookingDetailDialog } from '@/components/calendar/BookingDetailDialog'
import { CalendarRow } from '@/components/calendar/CalendarRow'
import { useCalendarState } from '@/components/calendar/hooks/useCalendarState'
import { Legend } from '@/components/calendar/Legend'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { StatCardsGrid } from '@/components/ui/stat-card'
import { unitBlockApi, type UnitBlock } from '@/lib/api'
import { MONTHS } from '@/lib/calendar'
import { isSameDay } from '@/lib/calendar-utils'
import { cn } from '@/lib/utils'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { BedDouble, ChevronLeft, ChevronRight, DoorOpen, Home, Plus, RefreshCw, Wrench, XCircle } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export const Route = createFileRoute('/__main/calendar')({
    component: RouteComponent,
})

function toISODate(d: Date): string {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
}

function RouteComponent() {
    const {
        today,
        currentYear,
        currentMonth,
        filterStatus,
        setFilterStatus,
        selectedEntry,
        setSelectedEntry,
        isRefreshing,
        days,
        goToPrev,
        goToNext,
        goToToday,
        handleRefresh,
        isCurrentMonth,
        units,
        entriesByUnit,
        isLoading,
        isError,
        todayStats,
        statusOptions,
    } = useCalendarState()

    const queryClient = useQueryClient()

    // Block dialog state: null = closed, otherwise carries the config.
    const [createBlockDefaults, setCreateBlockDefaults] = useState<{ unitId?: string; fromDate?: string; toDate?: string } | null>(null)
    const [editingBlock, setEditingBlock] = useState<UnitBlock | null>(null)

    // Fall back to zeros during the first render to avoid layout shift.
    const stats = todayStats ?? { date: '', total: 0, booked: 0, available: 0, maintenance: 0 }

    const selectedUnit = selectedEntry ? (units.find((u) => u.id === selectedEntry.unitId) ?? null) : null

    // Build the UnitBlock shape needed by BlockDialog from a CalendarEntry.
    const blockForEntry = (entry: {
        id: string
        type: 'booking' | 'block'
        checkIn: Date
        checkOut: Date
        label: string
        reason?: string
        unitId: string
    }): UnitBlock | null => {
        if (entry.type !== 'block') return null
        return {
            id: entry.id,
            unitId: entry.unitId,
            fromDate: toISODate(entry.checkIn),
            toDate: toISODate(entry.checkOut),
            reason: entry.reason ?? null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            deletedAt: null,
        }
    }

    const deleteBlockMutation = useMutation({
        mutationFn: (id: string) => unitBlockApi.remove(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['calendar-snapshot'] })
            queryClient.invalidateQueries({ queryKey: ['calendar-stats'] })
            toast.success('Block removed')
            setSelectedEntry(null)
        },
        onError: (err: Error) => toast.error(err.message || 'Failed to delete block'),
    })

    const handleFreeCellClick = (unitId: string, date: Date) => {
        const iso = toISODate(date)
        setCreateBlockDefaults({ unitId, fromDate: iso, toDate: iso })
    }

    return (
        <div className="flex h-[calc(100dvh-7rem)] min-h-0 flex-col gap-6 overflow-hidden">
            <PageHeader title="Calender" description="Manage your Schedules via Calender" />
            <StatCardsGrid
                cards={[
                    { icon: Home, label: 'Total Rooms', value: stats.total, color: 'blue' },
                    { icon: BedDouble, label: 'Booked Today', value: stats.booked, color: 'rose' },
                    { icon: DoorOpen, label: 'Available Today', value: stats.available, color: 'emerald' },
                    { icon: Wrench, label: 'Maintenance', value: stats.maintenance, color: 'slate' },
                ]}
            />
            <Card className="flex min-h-0 flex-1 flex-col overflow-hidden border-0 shadow-sm">
                <CardHeader className="pb-3 border-b border-border/60">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2">
                            <Button id="calendar-prev-month" variant="outline" size="sm" onClick={goToPrev} className="size-8 p-0">
                                <ChevronLeft className="size-4" />
                            </Button>

                            <CardTitle className="text-sm font-semibold w-36 text-center">
                                {MONTHS[currentMonth]} {currentYear}
                            </CardTitle>

                            <Button id="calendar-next-month" variant="outline" size="sm" onClick={goToNext} className="size-8 p-0">
                                <ChevronRight className="size-4" />
                            </Button>

                            {!isCurrentMonth && (
                                <Button id="calendar-today" variant="outline" size="sm" onClick={goToToday} className="text-xs h-8 px-3">
                                    Today
                                </Button>
                            )}
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                            <Button
                                id="calendar-create-block"
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs gap-1.5"
                                onClick={() => setCreateBlockDefaults({})}
                                disabled={units.length === 0}
                            >
                                <Plus className="size-3.5" />
                                Block
                            </Button>

                            <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as typeof filterStatus)}>
                                <SelectTrigger id="calendar-filter-status" size="sm" className="h-8 text-xs">
                                    <SelectValue placeholder="All statuses" />
                                </SelectTrigger>
                                <SelectContent position="popper">
                                    <SelectGroup>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        {statusOptions.map((s) => (
                                            <SelectItem key={s} value={s}>
                                                {s
                                                    .toLowerCase()
                                                    .split('_')
                                                    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
                                                    .join(' ')}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>

                            <Button
                                id="calendar-refresh"
                                variant="outline"
                                size="sm"
                                className="size-8 p-0"
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                            >
                                <RefreshCw className={cn('size-3.5', isRefreshing && 'animate-spin')} />
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="min-h-0 flex-1 overflow-auto p-0">
                    {isRefreshing || (isLoading && units.length === 0) ? (
                        <div className="p-4 flex flex-col gap-2">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <Skeleton key={i} className="h-12 w-full rounded-lg" />
                            ))}
                        </div>
                    ) : isError ? (
                        <div className="flex items-center justify-center py-16 text-muted-foreground text-sm gap-2">
                            <XCircle className="size-5" />
                            Failed to load calendar data. Please try again.
                        </div>
                    ) : (
                            <div className="min-w-180">
                            <div className="sticky top-0 z-20 flex border-b border-border/60 bg-white dark:bg-card">
                                <div className="sticky left-0 z-30 w-40 shrink-0 px-3 py-2 border-r border-border/60 flex items-center gap-1.5 bg-white dark:bg-card">
                                    <BedDouble className="size-3.5 text-muted-foreground" />
                                    <span className="text-xs font-semibold text-muted-foreground">Rooms</span>
                                </div>

                                <div className="flex flex-1">
                                    {days.map((d) => {
                                        const cellDate = new Date(currentYear, currentMonth, d)
                                        const isToday = isSameDay(cellDate, today)
                                        const dow = cellDate.getDay()
                                        const isWeekend = dow === 0 || dow === 6
                                        const DOW_ABBR = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

                                        return (
                                            <div
                                                key={d}
                                                className={cn(
                                                    'flex-1 min-w-7 flex flex-col items-center justify-center gap-0.5 py-1',
                                                    'border-r border-border/30 last:border-r-0',
                                                    isToday && 'bg-primary/5',
                                                )}
                                            >
                                                <span
                                                    className={cn(
                                                        'text-[8px] font-medium leading-none',
                                                        isToday
                                                            ? 'text-primary'
                                                            : isWeekend
                                                              ? 'text-muted-foreground/50'
                                                              : 'text-muted-foreground/60',
                                                    )}
                                                >
                                                    {DOW_ABBR[dow]}
                                                </span>
                                                <span
                                                    className={cn(
                                                        'text-[10px] font-semibold size-5 flex items-center justify-center rounded-full',
                                                        isToday
                                                            ? 'bg-primary text-primary-foreground'
                                                            : isWeekend
                                                              ? 'text-muted-foreground/60'
                                                              : 'text-muted-foreground',
                                                    )}
                                                >
                                                    {d}
                                                </span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            {units.length === 0 ? (
                                <div className="flex items-center justify-center py-16 text-muted-foreground text-sm gap-2">
                                    <XCircle className="size-5" />
                                    No rooms to display
                                </div>
                            ) : (
                                units.map((unit) => (
                                    <CalendarRow
                                        key={unit.id}
                                        unit={unit}
                                        entries={entriesByUnit.get(unit.id) ?? []}
                                        days={days}
                                        year={currentYear}
                                        month={currentMonth}
                                        today={today}
                                        onEntryClick={setSelectedEntry}
                                        onFreeCellClick={handleFreeCellClick}
                                    />
                                ))
                            )}
                        </div>
                    )}
                </CardContent>

                <div className="flex items-center justify-between px-4 py-3 border-t border-border/60 bg-muted/20">
                    <Legend />
                    <p className="text-[11px] text-muted-foreground hidden sm:block">
                        {units.length} room{units.length !== 1 ? 's' : ''} · Click a free day to block it
                    </p>
                </div>
            </Card>

            {selectedEntry && selectedUnit && (
                <BookingDetailDialog
                    entry={selectedEntry}
                    unit={selectedUnit}
                    onClose={() => setSelectedEntry(null)}
                    onEditBlock={() => {
                        const block = blockForEntry(selectedEntry)
                        if (block) {
                            setSelectedEntry(null)
                            setEditingBlock(block)
                        }
                    }}
                    onDeleteBlock={() => {
                        if (window.confirm('Delete this maintenance block?')) {
                            deleteBlockMutation.mutate(selectedEntry.id)
                        }
                    }}
                />
            )}

            {createBlockDefaults && (
                <BlockDialog
                    mode="create"
                    units={units}
                    defaultUnitId={createBlockDefaults.unitId}
                    defaultFromDate={createBlockDefaults.fromDate}
                    defaultToDate={createBlockDefaults.toDate}
                    onClose={() => setCreateBlockDefaults(null)}
                />
            )}

            {editingBlock && <BlockDialog mode="edit" units={units} block={editingBlock} onClose={() => setEditingBlock(null)} />}
        </div>
    )
}
