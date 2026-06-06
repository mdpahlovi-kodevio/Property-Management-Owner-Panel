import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { createFileRoute } from '@tanstack/react-router'
import {
    BedDouble,
    ChevronLeft,
    ChevronRight,
    Plus,
    RefreshCw,
    XCircle,
    Home,
    DoorOpen,
    Wrench,
} from 'lucide-react'

// Hooks and Utilities
import { useCalendarState } from '@/components/calendar/hooks/useCalendarState'
import { useCalendarStats } from '@/components/calendar/hooks/useCalendarStats'
import { isSameDay } from '@/lib/calendar-utils'
import { MONTHS, ROOMS } from '@/data/mock-calendar'

// UI Components
import { StatCardsGrid } from '@/components/ui/stat-card'
import { Legend } from '@/components/calendar/Legend'
import { BookingDetailDialog } from '@/components/calendar/BookingDetailDialog'
import { CalendarRow } from '@/components/calendar/CalendarRow'
import { PageHeader } from '#/components/ui/page-header'

export const Route = createFileRoute('/__main/calendar')({
    component: RouteComponent,
})

function RouteComponent() {
    const {
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
    } = useCalendarState()

    const {
        filteredRooms,
        bookingsForRoom,
        todayStats,
    } = useCalendarStats({
        currentYear,
        currentMonth,
        days,
        daysInMonth,
        today,
        filterStatus,
        filterType,
    })

    const selectedRoom = selectedBooking
        ? ROOMS.find((r) => r.id === selectedBooking.roomId) ?? null
        : null

    return (
        <>
            <PageHeader
                title="Calender"
                description="Manage your Schedules via Calender"
            />
            {/* ── Stat Cards Grid ───────────────────────────────────────────── */}
            <StatCardsGrid
                cards={[
                    {
                        icon: Home,
                        label: "Total Rooms",
                        value: todayStats.total,
                        color: "blue"
                    },
                    {
                        icon: BedDouble,
                        label: "Booked Today",
                        value: todayStats.booked,
                        color: "rose"
                    },
                    {
                        icon: DoorOpen,
                        label: "Available Today",
                        value: todayStats.available,
                        color: "emerald"
                    },
                    {
                        icon: Wrench,
                        label: "Maintenance",
                        value: todayStats.maintenance,
                        color: "slate"
                    }
                ]}
            />
            {/* ── Calendar Card ──────────────────────────────────────────────── */}
            <Card className="border-0 shadow-sm overflow-hidden">
                {/* Toolbar */}
                <CardHeader className="pb-3 border-b border-border/60">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                        {/* Month navigator */}
                        <div className="flex items-center gap-2">
                            <Button
                                id="calendar-prev-month"
                                variant="outline"
                                size="sm"
                                onClick={goToPrev}
                                className="size-8 p-0"
                            >
                                <ChevronLeft className="size-4" />
                            </Button>

                            <CardTitle className="text-sm font-semibold w-36 text-center">
                                {MONTHS[currentMonth]} {currentYear}
                            </CardTitle>

                            <Button
                                id="calendar-next-month"
                                variant="outline"
                                size="sm"
                                onClick={goToNext}
                                className="size-8 p-0"
                            >
                                <ChevronRight className="size-4" />
                            </Button>

                            {!isCurrentMonth && (
                                <Button
                                    id="calendar-today"
                                    variant="outline"
                                    size="sm"
                                    onClick={goToToday}
                                    className="text-xs h-8 px-3"
                                >
                                    Today
                                </Button>
                            )}
                        </div>

                        {/* Filters + actions */}
                        <div className="flex items-center gap-2 flex-wrap">
                            {/* Status filter */}
                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                                <SelectTrigger
                                    id="calendar-filter-status"
                                    size="sm"
                                    className="h-8 text-xs"
                                >
                                    <SelectValue placeholder="All statuses" />
                                </SelectTrigger>
                                <SelectContent position="popper">
                                    <SelectGroup>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="confirmed">Confirmed</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                        <SelectItem value="blocked">Blocked</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>

                            {/* Room type filter */}
                            <Select value={filterType} onValueChange={setFilterType}>
                                <SelectTrigger
                                    id="calendar-filter-type"
                                    size="sm"
                                    className="h-8 text-xs"
                                >
                                    <SelectValue placeholder="All rooms" />
                                </SelectTrigger>
                                <SelectContent position="popper">
                                    <SelectGroup>
                                        <SelectItem value="all">All Rooms</SelectItem>
                                        <SelectItem value="single">Single</SelectItem>
                                        <SelectItem value="double">Double</SelectItem>
                                        <SelectItem value="suite">Suite</SelectItem>
                                        <SelectItem value="villa">Villa</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>

                            {/* Refresh */}
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

                            {/* New booking */}
                            <Button id="calendar-new-booking" size="sm" className="h-8 gap-1.5 text-xs">
                                <Plus className="size-3.5" data-icon="inline-start" />
                                New Booking
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                {/* Grid */}
                <CardContent className="p-0 overflow-x-auto">
                    {isRefreshing ? (
                        <div className="p-4 flex flex-col gap-2">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <Skeleton key={i} className="h-12 w-full rounded-lg" />
                            ))}
                        </div>
                    ) : (
                        <div className="min-w-180">
                            {/* Day-number header */}
                            <div className="flex border-b border-border/60 bg-muted/40">
                                {/* Room column header */}
                                <div className="w-40 shrink-0 px-3 py-2 border-r border-border/60 flex items-center gap-1.5">
                                    <BedDouble className="size-3.5 text-muted-foreground" />
                                    <span className="text-xs font-semibold text-muted-foreground">Rooms</span>
                                </div>

                                {/* Day numbers */}
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

                            {/* Room rows */}
                            {filteredRooms.length === 0 ? (
                                <div className="flex items-center justify-center py-16 text-muted-foreground text-sm gap-2">
                                    <XCircle className="size-5" />
                                    No rooms match the current filter
                                </div>
                            ) : (
                                filteredRooms.map((room) => (
                                    <CalendarRow
                                        key={room.id}
                                        room={room}
                                        bookings={bookingsForRoom(room.id)}
                                        days={days}
                                        year={currentYear}
                                        month={currentMonth}
                                        today={today}
                                        onBookingClick={setSelectedBooking}
                                    />
                                ))
                            )}
                        </div>
                    )}
                </CardContent>

                {/* Footer */}
                <div className="flex items-center justify-between px-4 py-3 border-t border-border/60 bg-muted/20">
                    <Legend />
                    <p className="text-[11px] text-muted-foreground hidden sm:block">
                        {filteredRooms.length} room{filteredRooms.length !== 1 ? 's' : ''} ·
                        Click any bar to view details
                    </p>
                </div>
            </Card>


            {/* Booking detail dialog */}
            {selectedBooking && selectedRoom && (
                <BookingDetailDialog
                    booking={selectedBooking}
                    room={selectedRoom}
                    onClose={() => setSelectedBooking(null)}
                />
            )}
        </>
    )
}
