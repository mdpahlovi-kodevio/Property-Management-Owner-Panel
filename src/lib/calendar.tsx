import type { CalendarStatus } from '@/types/calendar'
import { BedDouble, BedSingle, Building2, Home } from 'lucide-react'
import type { ReactNode } from 'react'

export const STATUS_CONFIG: Record<CalendarStatus, { label: string; bg: string; text: string; border: string; dot: string }> = {
    PENDING: {
        label: 'Pending',
        bg: 'bg-amber-500/10',
        text: 'text-amber-600',
        border: 'border-amber-500/30',
        dot: 'bg-amber-500',
    },
    CONFIRMED: {
        label: 'Confirmed',
        bg: 'bg-primary/10',
        text: 'text-primary',
        border: 'border-primary/30',
        dot: 'bg-primary',
    },
    CHECKED_IN: {
        label: 'Checked-in',
        bg: 'bg-blue-500/10',
        text: 'text-blue-600',
        border: 'border-blue-500/30',
        dot: 'bg-blue-500',
    },
    CHECKED_OUT: {
        label: 'Checked-out',
        bg: 'bg-slate-500/10',
        text: 'text-slate-600',
        border: 'border-slate-500/30',
        dot: 'bg-slate-500',
    },
    CANCELLED: {
        label: 'Cancelled',
        bg: 'bg-destructive/10',
        text: 'text-destructive',
        border: 'border-destructive/30',
        dot: 'bg-destructive',
    },
    NO_SHOW: {
        label: 'No-show',
        bg: 'bg-rose-500/10',
        text: 'text-rose-600',
        border: 'border-rose-500/30',
        dot: 'bg-rose-500',
    },
    EXPIRED: {
        label: 'Expired',
        bg: 'bg-zinc-500/10',
        text: 'text-zinc-600',
        border: 'border-zinc-500/30',
        dot: 'bg-zinc-500',
    },
    BLOCKED: {
        label: 'Blocked',
        bg: 'bg-muted-foreground/10',
        text: 'text-muted-foreground',
        border: 'border-muted-foreground/20',
        dot: 'bg-muted-foreground',
    },
}

export function getUnitIcon(roomTypeName: string): ReactNode {
    const n = roomTypeName.toLowerCase()
    if (n.includes('villa') || n.includes('bungalow')) return <Home className="size-3.5" />
    if (n.includes('suite') || n.includes('penthouse')) return <Building2 className="size-3.5" />
    if (n.includes('twin') || n.includes('double') || n.includes('king') || n.includes('queen')) return <BedDouble className="size-3.5" />
    return <BedSingle className="size-3.5" />
}

export const MONTHS = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
]
