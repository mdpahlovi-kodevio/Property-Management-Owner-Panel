import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'
import type { RatePlanCalendarDay, RatePlanListItem } from '@/lib/api'
import { ratePlanApi } from '@/lib/api'
import { formatPrice } from '@/lib/properties'
import { cn } from '@/lib/utils'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, Pencil } from 'lucide-react'
import { useState } from 'react'

const WEEKDAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

function isoDay(d: Date) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
function monthStart(d: Date) {
    return new Date(d.getFullYear(), d.getMonth(), 1)
}
function monthEnd(d: Date) {
    return new Date(d.getFullYear(), d.getMonth() + 1, 0)
}
function addMonths(d: Date, n: number) {
    return new Date(d.getFullYear(), d.getMonth() + n, 1)
}
function priceOf(day: RatePlanCalendarDay) {
    const n = typeof day.price === 'string' ? Number(day.price) : day.price
    return Number.isFinite(n) ? n : 0
}

function DayCell({ dayOfMonth, day, isToday }: { dayOfMonth: number; day: RatePlanCalendarDay | undefined; isToday: boolean }) {
    const title = day
        ? [
              `${formatPrice(priceOf(day))}${day.source === 'default' ? ' (plan default)' : ''}`,
              day.minLOS != null ? `Min stay ${day.minLOS}n` : null,
              day.maxLOS != null ? `Max stay ${day.maxLOS}n` : null,
              day.closedToArrival ? 'Closed to arrival' : null,
              day.closedToDeparture ? 'Closed to departure' : null,
              day.stopSell ? 'Stop-sell' : null,
          ]
              .filter(Boolean)
              .join(' · ')
        : 'No data'

    return (
        <div
            title={title}
            className={cn(
                'flex min-h-16 flex-col justify-between rounded-md border p-1.5',
                day?.stopSell && 'border-rose-200 bg-rose-50',
                isToday && 'ring-1 ring-primary',
            )}
        >
            <div className="text-[10px] font-medium text-muted-foreground">{dayOfMonth}</div>
            {day && (
                <>
                    <div className={cn('text-xs font-bold', day.source === 'default' && 'font-medium text-muted-foreground')}>
                        {formatPrice(priceOf(day))}
                    </div>
                    <div className="flex gap-1">
                        {day.stopSell && <span className="size-1.5 rounded-full bg-rose-500" />}
                        {day.closedToArrival && <span className="size-1.5 rounded-full bg-amber-500" />}
                        {day.closedToDeparture && <span className="size-1.5 rounded-full bg-sky-500" />}
                        {(day.minLOS != null || day.maxLOS != null) && <span className="size-1.5 rounded-full bg-violet-500" />}
                    </div>
                </>
            )}
        </div>
    )
}

/** Read-only month grid of the plan's effective per-night price + restrictions. */
export function RatePlanCalendarDialog({
    ratePlan,
    onClose,
    onFillRange,
}: {
    ratePlan: RatePlanListItem | null
    onClose: () => void
    onFillRange: (ratePlan: RatePlanListItem) => void
}) {
    const [month, setMonth] = useState(() => monthStart(new Date()))
    const first = monthStart(month)
    const last = monthEnd(month)

    const calendarQuery = useQuery({
        queryKey: ['rate-plan-calendar', ratePlan?.id, isoDay(first)],
        queryFn: () => {
            if (!ratePlan) throw new Error('No rate plan selected')
            return ratePlanApi.calendar({ ratePlanId: ratePlan.id, fromDate: isoDay(first), toDate: isoDay(last) })
        },
        enabled: !!ratePlan,
        placeholderData: keepPreviousData,
    })

    const byDate = new Map((calendarQuery.data?.data.days ?? []).map((d) => [d.date, d]))
    const todayIso = isoDay(new Date())
    const cells: ({ date: string; dayOfMonth: number; day: RatePlanCalendarDay | undefined } | null)[] = [
        ...Array.from({ length: first.getDay() }, () => null),
        ...Array.from({ length: last.getDate() }, (_, i) => {
            const date = isoDay(new Date(first.getFullYear(), first.getMonth(), i + 1))
            return { date, dayOfMonth: i + 1, day: byDate.get(date) }
        }),
    ]

    return (
        <Dialog
            open={!!ratePlan}
            onOpenChange={(open) => {
                if (!open) onClose()
            }}
        >
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Rate calendar{ratePlan ? ` — ${ratePlan.name} (${ratePlan.code})` : ''}</DialogTitle>
                    <DialogDescription>
                        Effective per-night price and restrictions: plan defaults merged with daily overrides.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex items-center justify-between">
                    <Button size="sm" variant="outline" onClick={() => setMonth((m) => addMonths(m, -1))} aria-label="Previous month">
                        <ChevronLeft className="size-4" />
                    </Button>
                    <div className="text-sm font-bold">{month.toLocaleString('en-US', { month: 'long', year: 'numeric' })}</div>
                    <Button size="sm" variant="outline" onClick={() => setMonth((m) => addMonths(m, 1))} aria-label="Next month">
                        <ChevronRight className="size-4" />
                    </Button>
                </div>

                {calendarQuery.isLoading ? (
                    <div className="flex justify-center py-16">
                        <Spinner className="size-6" />
                    </div>
                ) : calendarQuery.isError ? (
                    <p className="py-10 text-center text-sm text-rose-600">Failed to load the calendar.</p>
                ) : (
                    <div className="grid grid-cols-7 gap-1">
                        {WEEKDAY_LABELS.map((label) => (
                            <div
                                key={label}
                                className="pb-1 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
                            >
                                {label}
                            </div>
                        ))}
                        {cells.map((cell, i) =>
                            cell === null ? (
                                <div key={`blank-${i}`} />
                            ) : (
                                <DayCell key={cell.date} dayOfMonth={cell.dayOfMonth} day={cell.day} isToday={cell.date === todayIso} />
                            ),
                        )}
                    </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-3">
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                            <span className="size-1.5 rounded-full bg-rose-500" /> Stop-sell
                        </span>
                        <span className="inline-flex items-center gap-1">
                            <span className="size-1.5 rounded-full bg-amber-500" /> Closed to arrival
                        </span>
                        <span className="inline-flex items-center gap-1">
                            <span className="size-1.5 rounded-full bg-sky-500" /> Closed to departure
                        </span>
                        <span className="inline-flex items-center gap-1">
                            <span className="size-1.5 rounded-full bg-violet-500" /> Min/Max stay
                        </span>
                        <span>Muted price = plan default</span>
                    </div>
                    <Button size="sm" onClick={() => ratePlan && onFillRange(ratePlan)}>
                        <Pencil className="size-3.5" /> Edit range
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
