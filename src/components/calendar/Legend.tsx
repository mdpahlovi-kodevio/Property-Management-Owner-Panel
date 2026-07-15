import { STATUS_CONFIG } from '@/lib/calendar'
import { cn } from '@/lib/utils'
import type { CalendarStatus } from '@/types/calendar'

export function Legend() {
    return (
        <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="size-2.5 rounded-full bg-emerald-500/40 border border-emerald-500/60" />
                Available
            </div>
            {(Object.entries(STATUS_CONFIG) as [CalendarStatus, (typeof STATUS_CONFIG)[CalendarStatus]][]).map(([status, cfg]) => (
                <div key={status} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className={cn('size-2.5 rounded-full', cfg.dot)} />
                    {cfg.label}
                </div>
            ))}
        </div>
    )
}
