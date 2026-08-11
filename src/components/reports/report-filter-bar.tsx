import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { Filter, RotateCcw } from 'lucide-react'
import { useState } from 'react'

export interface ReportFilters {
    from: string
    to: string
    propertyId?: string
}

export interface ReportFilterProperty {
    id: string
    name: string
}

const fieldLabel = 'text-[11px] font-semibold uppercase tracking-wider text-muted-foreground'

/** Local-timezone YYYY-MM-DD string (avoids UTC off-by-one in date inputs). */
function toDateInputValue(d: Date): string {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
}

/** Default report window: last 30 days → today. */
export function defaultReportRange(): Pick<ReportFilters, 'from' | 'to'> {
    const to = new Date()
    const from = new Date()
    from.setDate(from.getDate() - 30)
    return { from: toDateInputValue(from), to: toDateInputValue(to) }
}

export function ReportFilterBar({
    initial,
    properties,
    onApply,
    onReset,
    className,
}: {
    initial: ReportFilters
    properties: ReportFilterProperty[]
    onApply: (filters: ReportFilters) => void
    onReset: () => void
    className?: string
}) {
    const [from, setFrom] = useState(initial.from)
    const [to, setTo] = useState(initial.to)
    const [propertyId, setPropertyId] = useState(initial.propertyId ?? 'all')

    const handleApply = () => {
        onApply({ from, to, propertyId: propertyId === 'all' ? undefined : propertyId })
    }

    const handleReset = () => {
        const d = defaultReportRange()
        setFrom(d.from)
        setTo(d.to)
        setPropertyId('all')
        onReset()
    }

    return (
        <div
            className={cn(
                'flex flex-wrap items-end gap-x-4 gap-y-3 rounded-xl border border-border/60 bg-muted/40 px-4 py-3',
                className,
            )}
        >
            <div className="grid w-full gap-1.5 sm:w-auto">
                <span className={fieldLabel}>From</span>
                <Input
                    type="date"
                    value={from}
                    max={to}
                    onChange={(e) => setFrom(e.target.value)}
                    className="h-10 w-full bg-background sm:w-44"
                />
            </div>
            <div className="grid w-full gap-1.5 sm:w-auto">
                <span className={fieldLabel}>To</span>
                <Input
                    type="date"
                    value={to}
                    min={from}
                    onChange={(e) => setTo(e.target.value)}
                    className="h-10 w-full bg-background sm:w-44"
                />
            </div>
            <div className="grid w-full gap-1.5 sm:w-auto">
                <span className={fieldLabel}>Property</span>
                <Select value={propertyId} onValueChange={setPropertyId}>
                    <SelectTrigger className="h-10 w-full min-w-48 bg-background sm:w-48">
                        <SelectValue placeholder="All properties" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All properties</SelectItem>
                        {properties.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                                {p.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex w-full items-end gap-2 sm:ml-1 sm:w-auto sm:border-l sm:border-border sm:pl-4">
                <Button onClick={handleApply} className="h-10 flex-1 px-5 sm:flex-none">
                    <Filter className="mr-2 h-4 w-4" />
                    Apply Filters
                </Button>
                <Button
                    variant="ghost"
                    className="h-10 px-4 text-muted-foreground hover:text-foreground"
                    onClick={handleReset}
                >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reset
                </Button>
            </div>
        </div>
    )
}
