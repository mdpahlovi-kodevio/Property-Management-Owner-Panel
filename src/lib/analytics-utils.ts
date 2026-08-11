// ── Period presets ──────────────────────────────────────────

export const PERIOD_OPTIONS = [
    { value: '7d', label: 'Last 7 days', days: 7 },
    { value: '30d', label: 'Last 30 days', days: 30 },
    { value: '90d', label: 'Last 90 days', days: 90 },
] as const

export type PeriodValue = (typeof PERIOD_OPTIONS)[number]['value']

// ── Date helpers ────────────────────────────────────────────

/** Local-timezone YYYY-MM-DD string (avoids UTC off-by-one). */
export function toDateInputValue(d: Date): string {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
}

/** Inclusive [today - days + 1, today] window. */
export function periodRange(days: number): { from: string; to: string } {
    const to = new Date()
    const from = new Date()
    from.setDate(to.getDate() - (days - 1))
    return { from: toDateInputValue(from), to: toDateInputValue(to) }
}

/** ISO string → local YYYY-MM-DD (for grouping guest flow by day). */
export function toLocalDateStr(iso: string): string {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return iso.slice(0, 10)
    return toDateInputValue(d)
}

// ── Pagination helpers ──────────────────────────────────────

/** Clamps the requested page to the table's actual page count. */
export function safePage(page: number, limit: number, total: number): number {
    const totalPages = Math.max(1, Math.ceil(total / limit))
    return Math.min(Math.max(page, 1), totalPages)
}

/** Client-side slice of a full-array response for the current page. */
export function slicePage<T>(rows: T[], page: number, limit: number): T[] {
    const from = (page - 1) * limit
    return rows.slice(from, from + limit)
}

// ── CSV export ──────────────────────────────────────────────

/** Download an array of objects as a CSV file. */
export function downloadCsv<T extends object>(filename: string, rows: T[]) {
    if (!rows.length) return
    const headers = Object.keys(rows[0])
    const escape = (v: unknown) => {
        const s = String(v ?? '')
        return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
    }
    const csv = [headers.join(','), ...rows.map((r) => headers.map((h) => escape((r as Record<string, unknown>)[h])).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
}

// ── Chart / badge constants ─────────────────────────────────

export const CHANNEL_COLORS: Record<string, string> = {
    DIRECT: '#6366f1',
    MANUAL: '#20c77a',
    OTA: '#f4a51c',
    API: '#0ea5a5',
}

export const STATUS_BADGE: Record<string, string> = {
    PENDING: 'text-amber-600 bg-amber-500/10',
    CONFIRMED: 'text-emerald-600 bg-emerald-500/10',
    CHECKED_IN: 'text-blue-600 bg-blue-500/10',
    CHECKED_OUT: 'text-slate-600 bg-slate-500/10',
    NO_SHOW: 'text-rose-600 bg-rose-500/10',
    CANCELLED: 'text-rose-600 bg-rose-500/10',
    EXPIRED: 'text-slate-600 bg-slate-500/10',
}

/** Heatmap cell color for an occupancy rate (0–100). */
export function heatColor(rate: number): string {
    if (rate >= 80) return '#6366f1'
    if (rate >= 60) return '#818cf8'
    if (rate >= 40) return '#a5b4fc'
    if (rate >= 20) return '#c7d2fe'
    return '#e0e7ff'
}
