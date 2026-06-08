import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Moon, Users, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDate, daysBetween } from '@/lib/calendar-utils'
import { STATUS_CONFIG } from '@/lib/calendar'
import type { Booking, Room } from '@/types/calendar'

export function BookingDetailDialog({
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
                    <Button size="sm">Edit Reservation</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
