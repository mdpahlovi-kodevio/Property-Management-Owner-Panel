import type { StatCardProps } from '@/components/ui/stat-card'
import { capitalize } from '@/lib/utils'
import type { ArrivalsReport, OccupancyReport, RevenueReport } from '@/lib/api'
import { ArrowDownRight, ArrowUpRight, BedDouble, CalendarCheck, CalendarX, Home, Users } from 'lucide-react'

// ── Formatting helpers ──────────────────────────────────

export function formatCurrency(amount: number | null | undefined, currency = 'USD'): string {
    if (amount == null || !Number.isFinite(Number(amount))) return '—'
    try {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 2 }).format(amount)
    } catch {
        return `${currency} ${Number(amount).toFixed(2)}`
    }
}

export function formatPercent(value: number | null | undefined): string {
    if (value == null || !Number.isFinite(value)) return '—'
    return `${value.toFixed(1)}%`
}

export function formatReportDate(dateStr: string): string {
    // 'YYYY-MM-DD' (from the occupancy endpoint) must be parsed as a local date —
    // `new Date('YYYY-MM-DD')` parses as UTC midnight and shifts a day in western timezones.
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr)
    const d = match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : new Date(dateStr)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatReportDateTime(dateStr: string): string {
    const d = new Date(dateStr)
    const date = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    return `${date}, ${time}`
}

/** OTA/API stay uppercase; the rest become Title Case (DIRECT → Direct). */
export function formatSource(source: string): string {
    if (source === 'OTA' || source === 'API') return source
    return capitalize(source)
}

/** Booking status enum → human label (CHECKED_IN → Checked in). */
export function formatStatus(status: string): string {
    return capitalize(status)
}

// ── Stat card builders (fed by the reports API summaries) ──

export function getOccupancyStatsCards(report: OccupancyReport | undefined, currency = 'USD'): StatCardProps[] {
    const s = report?.summary
    return [
        { label: 'Occupancy Rate', value: s ? formatPercent(s.occupancyRate) : '—', icon: BedDouble, color: 'blue' },
        { label: 'ADR (Avg. Daily Rate)', value: s ? formatCurrency(s.adr, currency) : '—', icon: Home, color: 'emerald' },
        { label: 'REVPAR', value: s ? formatCurrency(s.revpar, currency) : '—', icon: CalendarCheck, color: 'amber' },
        { label: 'Total Room Nights', value: s ? s.totalRoomNights.toLocaleString() : '—', icon: Users, color: 'slate' },
    ]
}

export function getRevenueStatsCards(report: RevenueReport | undefined, currency = 'USD'): StatCardProps[] {
    const s = report?.summary
    return [
        { label: 'Total Revenue', value: s ? formatCurrency(s.totalRevenue, currency) : '—', icon: CalendarCheck, color: 'blue' },
        { label: 'Total Bookings', value: s ? s.totalBookings.toLocaleString() : '—', icon: BedDouble, color: 'emerald' },
        { label: 'Net Earnings', value: s ? formatCurrency(s.netEarnings, currency) : '—', icon: CalendarX, color: 'orange' },
        { label: 'Top Channel', value: s?.topChannel ? formatSource(s.topChannel) : '—', icon: Home, color: 'amber' },
    ]
}

export function getArrivalsStatsCards(report: ArrivalsReport | undefined): StatCardProps[] {
    const s = report?.summary
    return [
        { label: 'Arrivals Today', value: s ? s.arrivalsToday.toLocaleString() : '—', icon: ArrowDownRight, color: 'blue' },
        { label: 'Departures Today', value: s ? s.departuresToday.toLocaleString() : '—', icon: ArrowUpRight, color: 'orange' },
        { label: 'In-house', value: s ? s.inHouse.toLocaleString() : '—', icon: Home, color: 'emerald' },
        { label: 'No-shows', value: s ? s.noShows.toLocaleString() : '—', icon: CalendarX, color: 'rose' },
    ]
}
