import type { StatCardProps } from '@/components/ui/stat-card'

// ── Panel ───────────────────────────────────────────────────

export function Panel({
    title,
    subtitle,
    action,
    children,
}: {
    title: string
    subtitle: string
    action?: React.ReactNode
    children: React.ReactNode
}) {
    return (
        <section className="rounded-xl border bg-card p-5 text-card-foreground shadow-sm space-y-4">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h2 className="text-sm font-semibold tracking-tight text-foreground">{title}</h2>
                    <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
                </div>
                {action}
            </div>
            {children}
        </section>
    )
}

// ── Spark card (metric + mini sparkline) ────────────────────

export function SparkCard({ card, sparkline }: { card: StatCardProps; sparkline: number[] }) {
    const colors = { blue: '#6366f1', emerald: '#20b979', amber: '#f2a721', rose: '#f24f73' }
    const color = colors[card.color as keyof typeof colors]
    const heights = sparkline.length
        ? sparkline.map((v, _i, arr) => {
              const max = Math.max(...arr) || 1
              const min = Math.min(...arr)
              const range = max - min || 1
              return 20 + ((v - min) / range) * 80
          })
        : [30, 40, 35, 55, 45, 70]
    return (
        <div className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex items-start justify-between">
                <span className="flex size-8 items-center justify-center rounded-md bg-muted" style={{ color }}>
                    <card.icon className="size-4" />
                </span>
            </div>
            <p className="mt-3 text-[10px] font-medium text-muted-foreground">{card.label}</p>
            <p className="mt-0.5 text-xl font-bold tracking-tight text-foreground">{card.value}</p>
            <div className="mt-3 flex h-5 items-end gap-1">
                {heights.map((height, i) => (
                    <span
                        key={i}
                        className="w-full rounded-sm"
                        style={{ height: `${height}%`, backgroundColor: color, opacity: 0.25 + (i / heights.length) * 0.75 }}
                    />
                ))}
            </div>
        </div>
    )
}

// ── Progress bar row ────────────────────────────────────────

export function ProgressRow({ label, value, percent, color }: { label: string; value: string; percent: number; color: string }) {
    return (
        <div>
            <div className="mb-1.5 flex justify-between text-[10px]">
                <span className="font-medium text-muted-foreground">{label}</span>
                <span className="font-semibold text-foreground">{value}</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted">
                <div className="h-full rounded-full" style={{ width: `${Math.min(percent, 100)}%`, backgroundColor: color }} />
            </div>
        </div>
    )
}

// ── Mini stat box ───────────────────────────────────────────

export function MiniValue({ label, value, tone }: { label: string; value: string; tone: 'violet' | 'mint' | 'rose' }) {
    const backgrounds = { violet: 'bg-indigo-50 text-indigo-600', mint: 'bg-emerald-50 text-emerald-600', rose: 'bg-rose-50 text-rose-600' }
    return (
        <div className={`rounded-md p-3 ${backgrounds[tone]}`}>
            <p className="text-[9px] opacity-70">{label}</p>
            <p className="mt-1 text-sm font-bold">{value}</p>
        </div>
    )
}

// ── Section heading with badge ──────────────────────────────

export function SectionLabel({ title, badge }: { title: string; badge: string }) {
    return (
        <div className="flex items-center gap-2 pt-2">
            <span className="h-4 w-1 rounded-full bg-emerald-500" />
            <h2 className="text-sm font-bold text-foreground">{title}</h2>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-semibold text-primary">{badge}</span>
        </div>
    )
}

// ── Error / empty states ────────────────────────────────────

export function ErrorNote({ message }: { message?: string }) {
    return (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <p className="text-sm font-medium text-destructive">Failed to load analytics data</p>
            <p className="text-xs text-muted-foreground">{message ?? 'Please try again.'}</p>
        </div>
    )
}

export function ChartEmpty() {
    return (
        <div className="flex h-full min-h-32 flex-col items-center justify-center gap-1 text-center">
            <p className="text-xs font-medium text-muted-foreground">No data for this period</p>
            <p className="text-[10px] text-muted-foreground/70">Try widening the date range.</p>
        </div>
    )
}
