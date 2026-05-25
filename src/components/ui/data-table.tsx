import { Button } from '@/components/ui/button'
import { PaginationComp } from '@/components/ui/pagination'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { SearchX } from 'lucide-react'
import { useMemo, useState } from 'react'

export type DataTableColumn<T> = {
    key: string
    header: string
    render: (row: T) => React.ReactNode
    className?: string
}

type DataTableProps<T> = {
    columns: DataTableColumn<T>[]
    data: T[]
    noun?: string
    emptyIcon?: React.ReactNode
    limitOptions?: number[]
    defaultLimit?: number
    onReset?: () => void
}

function DataTable<T>({
    columns,
    data,
    noun = 'rows',
    emptyIcon,
    limitOptions = [5, 10, 20],
    defaultLimit = 10,
    onReset,
}: DataTableProps<T>) {
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(defaultLimit)

    // Reset to page 1 when data changes (e.g. filters applied externally)
    const dataLength = data.length
    useMemo(() => {
        setPage(1)
    }, [dataLength])

    const paginatedData = useMemo(() => {
        const start = (page - 1) * limit
        return data.slice(start, start + limit)
    }, [data, page, limit])

    if (data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
                <div className="p-3 bg-muted rounded-full text-muted-foreground animate-pulse">
                    {emptyIcon ?? <SearchX className="h-6 w-6" />}
                </div>
                <div className="max-w-xs">
                    <h3 className="font-semibold text-foreground">No {noun} found</h3>
                    <p className="text-sm text-muted-foreground">
                        No records matched your search query or active filters. Try clearing your parameters!
                    </p>
                </div>
                {onReset && (
                    <Button variant="outline" size="sm" onClick={onReset}>
                        Reset Filters
                    </Button>
                )}
            </div>
        )
    }

    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow>
                        {columns.map((col) => (
                            <TableHead key={col.key}>{col.header}</TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paginatedData.map((row, index) => (
                        <TableRow key={index}>
                            {columns.map((col) => (
                                <TableCell key={col.key} className={col.className}>
                                    {col.render(row)}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <DataTableFooter
                page={page}
                limit={limit}
                total={data.length}
                onPageChange={setPage}
                onLimitChange={setLimit}
                limitOptions={limitOptions}
                noun={noun}
            />
        </>
    )
}

type DataTableFooterProps = {
    page: number
    limit: number
    total: number
    onPageChange: (page: number) => void
    onLimitChange: (limit: number) => void
    limitOptions?: number[]
    noun?: string
}

function DataTableFooter({
    page,
    limit,
    total,
    onPageChange,
    onLimitChange,
    limitOptions = [5, 10, 20],
    noun = 'rows',
}: DataTableFooterProps) {
    const from = total > 0 ? (page - 1) * limit + 1 : 0
    const to = Math.min(page * limit, total)

    return (
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
            {/* Showing X-Y of Z */}
            <p className="text-sm text-muted-foreground shrink-0">
                {total > 0 ? (
                    <>
                        Showing <span className="font-semibold text-foreground">{from}</span> to{' '}
                        <span className="font-semibold text-foreground">{to}</span> of{' '}
                        <span className="font-semibold text-foreground">{total}</span> {noun}
                    </>
                ) : (
                    <>No {noun} found</>
                )}
            </p>

            {/* Right side: page-size selector + pagination */}
            <div className="flex items-center gap-4">
                {/* Page Size Selector — hidden on small screens */}
                <div className="hidden md:flex items-center gap-1.5 text-sm text-muted-foreground">
                    <span>Rows per page:</span>
                    <Select
                        value={String(limit)}
                        onValueChange={(val) => {
                            onLimitChange(Number(val))
                            onPageChange(1)
                        }}
                    >
                        <SelectTrigger size="sm">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {limitOptions.map((opt) => (
                                <SelectItem key={opt} value={String(opt)}>
                                    {opt}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Pagination nav */}
                <PaginationComp page={page} limit={limit} total={total} onPageChange={onPageChange} />
            </div>
        </div>
    )
}

export { DataTable, DataTableFooter }
