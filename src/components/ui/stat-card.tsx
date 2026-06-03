import { cn } from '@/lib/utils'
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from 'lucide-react'

const COLOR_MAP = {
    blue: {
        blob: 'bg-blue-500/5',
        badge: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
    },
    emerald: {
        blob: 'bg-emerald-500/5',
        badge: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
    },
    orange: {
        blob: 'bg-orange-500/5',
        badge: 'bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400',
    },
    amber: {
        blob: 'bg-amber-500/5',
        badge: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
    },
    pink: {
        blob: 'bg-pink-500/5',
        badge: 'bg-pink-50 text-pink-600 dark:bg-pink-950/40 dark:text-pink-400',
    },
    rose: {
        blob: 'bg-rose-500/5',
        badge: 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400',
    },
    slate: {
        blob: 'bg-slate-500/5',
        badge: 'bg-slate-50 text-slate-600 dark:bg-slate-950/40 dark:text-slate-400',
    },
} as const

export type StatCardColor = keyof typeof COLOR_MAP

export interface StatCardTrend {
    value: string
    direction: 'up' | 'down'
    label?: string
}

export interface StatCardProps {
    label: string
    value: string | number
    icon: LucideIcon
    color: StatCardColor
    trend?: StatCardTrend
    className?: string
}

export function StatCard({ label, value, icon: Icon, color, trend, className }: StatCardProps) {
    const colors = COLOR_MAP[color]

    return (
        <div
            className={cn(
                'group relative flex flex-col border border-border/50 rounded-lg gap-2 p-4 overflow-hidden transition-colors duration-200 hover:border-border',
                className,
            )}
        >
            {/* Decorative corner blob */}
            <div className={cn('absolute top-0 right-0 w-22 h-22 rounded-bl-full pointer-events-none', colors.blob)} />

            {/* Header: label + icon */}
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">{label}</span>
                <div className={cn('p-2 rounded-xl transition-transform duration-300 group-hover:scale-110', colors.badge)}>
                    <Icon className="h-4.5 w-4.5" />
                </div>
            </div>

            {/* Value + optional trend */}
            <div>
                <div className="text-2xl font-bold tracking-tight">{value}</div>
                {trend && (
                    <div
                        className={cn(
                            'flex items-center gap-1 mt-1.5 text-xs font-medium',
                            trend.direction === 'up' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400',
                        )}
                    >
                        {trend.direction === 'up' ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                        <span>{trend.value}</span>
                        {trend.label && <span className="text-muted-foreground font-normal ml-0.5">{trend.label}</span>}
                    </div>
                )}
            </div>
        </div>
    )
}

export function StatCardsGrid({ cards, className }: { cards: StatCardProps[], className?: string }) {
    return (
        <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", className)}>
            {cards.map((card, idx) => (
                <StatCard key={idx} {...card} />
            ))}
        </div>
    )
}
