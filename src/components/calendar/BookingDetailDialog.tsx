import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { STATUS_CONFIG } from '@/lib/calendar'
import { daysBetween, formatDate } from '@/lib/calendar-utils'
import { cn } from '@/lib/utils'
import type { CalendarEntry, CalendarUnit } from '@/types/calendar'
import { useNavigate } from '@tanstack/react-router'
import { Info, Moon, Pencil, Trash2, Users, Wrench } from 'lucide-react'

export function BookingDetailDialog({
    entry,
    unit,
    onClose,
    onEditBlock,
    onDeleteBlock,
}: {
    entry: CalendarEntry
    unit: CalendarUnit
    onClose: () => void
    onEditBlock?: () => void
    onDeleteBlock?: () => void
}) {
    const cfg = STATUS_CONFIG[entry.status]
    const isBlock = entry.type === 'block'
    const nights = daysBetween(entry.checkIn, entry.checkOut)
    const navigate = useNavigate()

    const formattedAmount =
        entry.totalAmount > 0
            ? (() => {
                  const cur = entry.currency ?? unit.propertyCurrency
                  try {
                      return new Intl.NumberFormat('en-US', { style: 'currency', currency: cur }).format(entry.totalAmount)
                  } catch {
                      return `${cur} ${entry.totalAmount.toFixed(2)}`
                  }
              })()
            : '—'

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
                            {isBlock ? (
                                <Wrench className={cn('size-5', cfg.text)} />
                            ) : (
                                <img
                                    src={
                                        entry.avatar
                                            ? entry.avatar
                                            : `https://api.dicebear.com/7.x/notionists/svg?seed=${entry.label.replace(' ', '')}`
                                    }
                                    alt={entry.label}
                                    className="size-full object-cover"
                                />
                            )}
                        </div>
                        <div className="min-w-0">
                            <DialogTitle className="text-base truncate">{entry.label}</DialogTitle>
                            <DialogDescription className="text-xs truncate">
                                {unit.name} · {unit.roomTypeName}
                            </DialogDescription>
                        </div>
                        <span
                            className={cn(
                                'ml-auto text-xs font-semibold px-2.5 py-1 rounded-full border shrink-0',
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
                        <span className="font-semibold">{formatDate(entry.checkIn)}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-muted-foreground font-medium">Check-out</span>
                        <span className="font-semibold">{formatDate(entry.checkOut)}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-muted-foreground font-medium">Duration</span>
                        <span className="font-semibold flex items-center gap-1.5">
                            <Moon className="size-3.5 text-muted-foreground" />
                            {nights} night{nights !== 1 ? 's' : ''}
                        </span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-muted-foreground font-medium">{isBlock ? 'Block type' : 'Guests'}</span>
                        <span className="font-semibold flex items-center gap-1.5">
                            {isBlock ? (
                                <>
                                    <Wrench className="size-3.5 text-muted-foreground" />
                                    Maintenance
                                </>
                            ) : (
                                <>
                                    <Users className="size-3.5 text-muted-foreground" />
                                    {entry.guestCount} guest{entry.guestCount !== 1 ? 's' : ''}
                                </>
                            )}
                        </span>
                    </div>
                    {!isBlock && (
                        <>
                            <div className="flex flex-col gap-0.5">
                                <span className="text-xs text-muted-foreground font-medium">Channel</span>
                                <span className="font-semibold">{entry.channel}</span>
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <span className="text-xs text-muted-foreground font-medium">Total Amount</span>
                                <span className="font-semibold text-primary">{formattedAmount}</span>
                            </div>
                        </>
                    )}
                </div>

                {entry.reason && (
                    <>
                        <Separator />
                        <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted rounded-lg p-3">
                            <Info className="size-4 shrink-0 mt-0.5 text-primary" />
                            <span>{entry.reason}</span>
                        </div>
                    </>
                )}

                <DialogFooter className="flex-row gap-2 justify-end">
                    {isBlock && onDeleteBlock && (
                        <Button variant="destructive" size="sm" onClick={onDeleteBlock} className="mr-auto">
                            <Trash2 className="size-3.5" />
                            Delete
                        </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={onClose}>
                        Close
                    </Button>
                    {isBlock && onEditBlock && (
                        <Button size="sm" onClick={onEditBlock}>
                            <Pencil className="size-3.5" />
                            Edit Block
                        </Button>
                    )}
                    {!isBlock && (
                        <Button size="sm" onClick={() => navigate({ to: '/reservations/$id', params: { id: entry.id } })}>
                            Edit Reservation
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
