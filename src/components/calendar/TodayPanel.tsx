import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { CalendarDays, LogIn, LogOut } from 'lucide-react'
import { isSameDay, formatDate } from '@/lib/calendar-utils'
import { BOOKINGS, ROOMS } from '@/data/mock-calendar'

export function TodayPanel({ today }: { today: Date }) {
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
