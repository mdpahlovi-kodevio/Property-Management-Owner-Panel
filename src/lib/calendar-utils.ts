export function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate()
}

export function isSameDay(a: Date, b: Date) {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    )
}

export function daysBetween(a: Date, b: Date) {
    return Math.round((b.getTime() - a.getTime()) / 86_400_000)
}

export function formatDate(d: Date) {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
