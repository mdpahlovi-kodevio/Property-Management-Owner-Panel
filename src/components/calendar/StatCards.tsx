import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

export function StatCard({
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

export function SimpleStatCard({
    label,
    value,
    colorClass,
}: {
    label: string
    value: string | number
    colorClass: string
}) {
    return (
        <Card className="border-0 shadow-sm">
            <CardContent className="p-5 flex flex-col gap-2">
                <p className="text-sm font-medium text-foreground/80">{label}</p>
                <p className={cn("text-3xl font-bold tracking-tight", colorClass)}>{value}</p>
            </CardContent>
        </Card>
    )
}
