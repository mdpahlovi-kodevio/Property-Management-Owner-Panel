import { STATUS_CONFIG } from '@/lib/calendar'
import { cn } from '@/lib/utils'
import type { CalendarStatus } from '@/types/calendar'

export function AvatarChip({ name, status }: { name: string; status: CalendarStatus }) {
    const cfg = STATUS_CONFIG[status]
    return (
        <div className={cn('size-5 shrink-0 rounded-full overflow-hidden flex items-center justify-center ring-1 ring-border/50', cfg.bg)}>
            <img
                src={`https://api.dicebear.com/7.x/notionists/svg?seed=${name.replace(' ', '')}`}
                alt={name}
                className="size-full object-cover opacity-90"
            />
        </div>
    )
}
