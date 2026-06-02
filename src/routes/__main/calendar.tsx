import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { PageHeader } from '@/components/ui/page-header'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { createFileRoute } from '@tanstack/react-router'
import {
    BedDouble,
    BedSingle,
    Building2,
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    CircleDot,
    Clock,
    Home,
    Info,
    LogIn,
    LogOut,
    Moon,
    Plus,
    RefreshCw,
    Users,
    XCircle,
} from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import type { ReactNode } from 'react';

export const Route = createFileRoute('/__main/calendar')({
    component: RouteComponent,
})

// ─── Types ────────────────────────────────────────────────────────────────────

type BookingStatus = 'confirmed' | 'pending' | 'cancelled' | 'blocked'

interface Booking {
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

interface Room {
    id: string
    name: string
    type: 'single' | 'double' | 'suite' | 'villa'
    floor: number
    capacity: number
    ratePerNight: number
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const ROOMS: Room[] = [
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

const BOOKINGS: Booking[] = [
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

// ─── Config ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
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

const ROOM_TYPE_ICONS: Record<Room['type'], ReactNode> = {
    single: <BedSingle className="size-3.5" />,
    double: <BedDouble className="size-3.5" />,
    suite: <Building2 className="size-3.5" />,
    villa: <Home className="size-3.5" />,
}

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate()
}

function isSameDay(a: Date, b: Date) {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    )
}

function daysBetween(a: Date, b: Date) {
    return Math.round((b.getTime() - a.getTime()) / 86_400_000)
}

function formatDate(d: Date) {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
    icon,
    label,
    value,
    sub,
    color,
}: {
    icon: ReactNode
    label: string
    value: string | number
    sub?: string
    color: string
}) {
    return (
        <Card className="overflow-hidden border-0 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
                <div className={cn('size-10 rounded-xl flex items-center justify-center shrink-0', color)}>
                    {icon}
                </div>
                <div className="min-w-0">
                    <p className="text-xs text-muted-foreground font-medium truncate">{label}</p>
                    <p className="text-xl font-bold leading-tight">{value}</p>
                    {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
                </div>
            </CardContent>
        </Card>
    )
}

// ─── Avatar Chip ──────────────────────────────────────────────────────────────

function AvatarChip({ name, status }: { name: string; status: BookingStatus }) {
    const cfg = STATUS_CONFIG[status]
    return (
        <div
            className={cn(
                'size-5 shrink-0 rounded-full overflow-hidden flex items-center justify-center ring-1 ring-border/50',
                cfg.bg,
            )}
        >
            <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${name.replace(' ', '')}`} alt={name} className="size-full object-cover opacity-90" />
        </div>
    )
}

// ─── Legend ───────────────────────────────────────────────────────────────────

function Legend() {
    return (
        <div className="flex items-center gap-4 flex-wrap">
            {/* Available slot */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="size-2.5 rounded-full bg-emerald-500/40 border border-emerald-500/60" />
                Available
            </div>
            {(
                Object.entries(STATUS_CONFIG) as [
                    BookingStatus,
                    (typeof STATUS_CONFIG)[BookingStatus],
                ][]
            ).map(([status, cfg]) => (
                <div key={status} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className={cn('size-2.5 rounded-full', cfg.dot)} />
                    {cfg.label}
                </div>
            ))}
        </div>
    )
}

// ─── Today's Activity Panel ──────────────────────────────────────────────────

function TodayPanel({ today }: { today: Date }) {
    const checkIns = BOOKINGS.filter(
        (b) => b.status !== 'cancelled' && isSameDay(b.checkIn, today),
    )
    const checkOuts = BOOKINGS.filter(
        (b) => b.status !== 'cancelled' && isSameDay(b.checkOut, today),
    )

    if (checkIns.length === 0 && checkOuts.length === 0) return null

    return (
        <Card className="border-0 shadow-sm overflow-hidden">
            <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <CalendarDays className="size-4 text-primary" />
                    Today's Activity
                    <span className="ml-auto text-xs font-normal text-muted-foreground">
                        {formatDate(today)}
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
                <div className="grid gap-3 sm:grid-cols-2">
                    {/* Check-ins */}
                    <div className="flex flex-col gap-2">
                        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                            <LogIn className="size-3.5 text-emerald-600" />
                            Check-ins ({checkIns.length})
                        </p>
                        {checkIns.length === 0 ? (
                            <p className="text-xs text-muted-foreground italic">None today</p>
                        ) : (
                            checkIns.map((b) => {
                                const room = ROOMS.find((r) => r.id === b.roomId)
                                return (
                                    <div
                                        key={b.id}
                                        className="flex items-center gap-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/15 px-3 py-2"
                                    >
                                        <div className="size-7 rounded-lg bg-emerald-500/15 flex items-center justify-center text-[10px] font-bold text-emerald-700 shrink-0">
                                            {b.guestAvatar}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-semibold truncate">{b.guestName}</p>
                                            <p className="text-[10px] text-muted-foreground truncate">
                                                {room?.name} · {b.channel}
                                            </p>
                                        </div>
                                        <span className="ml-auto text-xs font-semibold text-emerald-700 shrink-0">
                                            {b.nights}n
                                        </span>
                                    </div>
                                )
                            })
                        )}
                    </div>

                    {/* Check-outs */}
                    <div className="flex flex-col gap-2">
                        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                            <LogOut className="size-3.5 text-amber-600" />
                            Check-outs ({checkOuts.length})
                        </p>
                        {checkOuts.length === 0 ? (
                            <p className="text-xs text-muted-foreground italic">None today</p>
                        ) : (
                            checkOuts.map((b) => {
                                const room = ROOMS.find((r) => r.id === b.roomId)
                                return (
                                    <div
                                        key={b.id}
                                        className="flex items-center gap-2.5 rounded-lg bg-amber-500/5 border border-amber-500/15 px-3 py-2"
                                    >
                                        <div className="size-7 rounded-lg bg-amber-500/15 flex items-center justify-center text-[10px] font-bold text-amber-700 shrink-0">
                                            {b.guestAvatar}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-semibold truncate">{b.guestName}</p>
                                            <p className="text-[10px] text-muted-foreground truncate">
                                                {room?.name} · {b.nights} nights stayed
                                            </p>
                                        </div>
                                        <span className="ml-auto text-xs font-semibold text-amber-700 shrink-0">
                                            ${b.totalAmount > 0 ? b.totalAmount : '—'}
                                        </span>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

// ─── Booking Detail Dialog ────────────────────────────────────────────────────

function BookingDetailDialog({
    booking,
    room,
    onClose,
}: {
    booking: Booking
    room: Room
    onClose: () => void
}) {
    const cfg = STATUS_CONFIG[booking.status]
    const nights = daysBetween(booking.checkIn, booking.checkOut)

    return (
        <Dialog open onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div
                            className={cn(
                                'size-10 rounded-xl overflow-hidden flex items-center justify-center shrink-0 ring-1 ring-border/50',
                                cfg.bg,
                            )}
                        >
                            <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${booking.guestName.replace(' ', '')}`} alt={booking.guestName} className="size-full object-cover" />
                        </div>
                        <div>
                            <DialogTitle className="text-base">{booking.guestName}</DialogTitle>
                            <DialogDescription className="text-xs">
                                {room.name} ·{' '}
                                {room.type.charAt(0).toUpperCase() + room.type.slice(1)}
                            </DialogDescription>
                        </div>
                        <span
                            className={cn(
                                'ml-auto text-xs font-semibold px-2.5 py-1 rounded-full border',
                                cfg.bg,
                                cfg.text,
                                cfg.border,
                            )}
                        >
                            {cfg.label}
                        </span>
                    </div>
                </DialogHeader>

                <Separator />

                <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-muted-foreground font-medium">Check-in</span>
                        <span className="font-semibold">{formatDate(booking.checkIn)}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-muted-foreground font-medium">Check-out</span>
                        <span className="font-semibold">{formatDate(booking.checkOut)}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-muted-foreground font-medium">Duration</span>
                        <span className="font-semibold flex items-center gap-1.5">
                            <Moon className="size-3.5 text-muted-foreground" />
                            {nights} night{nights !== 1 ? 's' : ''}
                        </span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-muted-foreground font-medium">Guests</span>
                        <span className="font-semibold flex items-center gap-1.5">
                            <Users className="size-3.5 text-muted-foreground" />
                            {booking.guestCount} guest{booking.guestCount !== 1 ? 's' : ''}
                        </span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-muted-foreground font-medium">Channel</span>
                        <span className="font-semibold">{booking.channel}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-muted-foreground font-medium">Total Amount</span>
                        <span className="font-semibold text-primary">
                            {booking.totalAmount > 0
                                ? `$${booking.totalAmount.toLocaleString()}`
                                : '—'}
                        </span>
                    </div>
                </div>

                {booking.notes && (
                    <>
                        <Separator />
                        <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted rounded-lg p-3">
                            <Info className="size-4 shrink-0 mt-0.5 text-primary" />
                            <span>{booking.notes}</span>
                        </div>
                    </>
                )}

                <DialogFooter className="flex-row gap-2 justify-end">
                    <Button variant="outline" size="sm" onClick={onClose}>
                        Close
                    </Button>
                    <Button size="sm">Edit Booking</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

// ─── Calendar Row (one room) ──────────────────────────────────────────────────

interface BarEntry {
    booking: Booking
    startDay: number
    spanDays: number
    isStart: boolean
}

function CalendarRow({
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
                                    'absolute bottom-0 left-0 right-0 h-0.75rounded-t-sm transition-all',
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

// ─── Main Page ────────────────────────────────────────────────────────────────

function RouteComponent() {
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

    // ── Navigation ────────────────────────────────────────────────────────────

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

    // ── Filtered rooms ────────────────────────────────────────────────────────

    const filteredRooms = useMemo(
        () => (filterType === 'all' ? ROOMS : ROOMS.filter((r) => r.type === filterType)),
        [filterType],
    )

    // ── Bookings per room (respects month + status filter) ───────────────────

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

    // ── Stats ─────────────────────────────────────────────────────────────────

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

    // ── Per-type availability for today ──────────────────────────────────────
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

    const selectedRoom = selectedBooking
        ? ROOMS.find((r) => r.id === selectedBooking.roomId) ?? null
        : null

    // ─────────────────────────────────────────────────────────────────────────

    return (
        <>
            {/* ── Dashboard Tabs ───────────────────────────────────────────── */}
            <Tabs defaultValue="stats" className="w-full space-y-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
                    <PageHeader
                        title="Booking Calendar"
                        description="Visual overview of all room reservations and availability"
                    />
                    <TabsList>
                        <TabsTrigger value="stats">Confirmed Bookings This Month</TabsTrigger>
                        {isCurrentMonth && <TabsTrigger value="availability">Room Availability Today</TabsTrigger>}
                        {isCurrentMonth && <TabsTrigger value="activity">Today's Activity</TabsTrigger>}
                    </TabsList>
                </div>

                <TabsContent value="stats">
                    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                        <StatCard
                            icon={<CalendarDays className="size-5 text-primary" />}
                            label="Confirmed Bookings"
                            value={stats.confirmed}
                            sub="This month"
                            color="bg-primary/10"
                        />
                        <StatCard
                            icon={<Clock className="size-5 text-amber-600" />}
                            label="Pending Bookings"
                            value={stats.pending}
                            sub="Awaiting confirmation"
                            color="bg-amber-500/10"
                        />
                        <StatCard
                            icon={<CircleDot className="size-5 text-emerald-600" />}
                            label="Occupancy Rate"
                            value={`${stats.occupancy}%`}
                            sub={`${ROOMS.length - Math.round(ROOMS.length * stats.occupancy / 100)} of ${ROOMS.length} rooms free today`}
                            color="bg-emerald-500/10"
                        />
                        <StatCard
                            icon={<Building2 className="size-5 text-violet-600" />}
                            label="Est. Revenue"
                            value={`$${stats.revenue.toLocaleString()}`}
                            sub="Confirmed only"
                            color="bg-violet-500/10"
                        />
                    </div>
                </TabsContent>

                {isCurrentMonth && (
                    <TabsContent value="availability">
                        <Card className="border-0 shadow-sm overflow-hidden">
                            <CardHeader className="pb-2 pt-4 px-4">
                                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                    <BedDouble className="size-4 text-primary" />
                                    Room Availability Today
                                    <span className="ml-auto text-xs font-normal text-muted-foreground">
                                        {availabilityByType.reduce((s, t) => s + t.free, 0)} of{' '}
                                        {ROOMS.length} rooms available
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-4 pb-4">
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                    {availabilityByType.map(({ type, total, free }) => {
                                        const pct = total > 0 ? Math.round((free / total) * 100) : 0
                                        const typeLabel = type.charAt(0).toUpperCase() + type.slice(1)
                                        const allFree = free === total
                                        const noneFree = free === 0
                                        return (
                                            <div key={type} className="flex flex-col gap-2">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-muted-foreground">{ROOM_TYPE_ICONS[type]}</span>
                                                        <span className="text-xs font-semibold capitalize">{typeLabel}</span>
                                                    </div>
                                                    <span
                                                        className={cn(
                                                            'text-xs font-bold',
                                                            allFree
                                                                ? 'text-emerald-600'
                                                                : noneFree
                                                                    ? 'text-destructive'
                                                                    : 'text-amber-600',
                                                        )}
                                                    >
                                                        {free}/{total}
                                                    </span>
                                                </div>
                                                {/* Fill bar */}
                                                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                                                    <div
                                                        className={cn(
                                                            'h-full rounded-full transition-all duration-500',
                                                            allFree
                                                                ? 'bg-emerald-500'
                                                                : noneFree
                                                                    ? 'bg-destructive'
                                                                    : 'bg-amber-500',
                                                        )}
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                </div>
                                                <p className="text-[10px] text-muted-foreground">
                                                    {free === 0
                                                        ? 'Fully occupied'
                                                        : free === total
                                                            ? 'All available'
                                                            : `${free} free · ${total - free} occupied`}
                                                </p>
                                            </div>
                                        )
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                )}

                {isCurrentMonth && (
                    <TabsContent value="activity">
                        <TodayPanel today={today} />
                    </TabsContent>
                )}
            </Tabs>

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
