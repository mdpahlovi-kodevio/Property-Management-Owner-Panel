import * as React from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from 'lucide-react'

function Pagination({ className, ...props }: React.ComponentProps<'nav'>) {
    return (
        <nav
            role="navigation"
            aria-label="pagination"
            data-slot="pagination"
            className={cn('mx-auto flex w-fit justify-center', className)}
            {...props}
        />
    )
}

function PaginationContent({ className, ...props }: React.ComponentProps<'ul'>) {
    return <ul data-slot="pagination-content" className={cn('flex items-center gap-0.5', className)} {...props} />
}

function PaginationItem({ ...props }: React.ComponentProps<'li'>) {
    return <li data-slot="pagination-item" {...props} />
}

type PaginationLinkProps = {
    isActive?: boolean
} & React.ComponentProps<typeof Button> &
    React.ComponentProps<'a'>

function PaginationLink({ className, isActive, variant, size = 'icon', ...props }: PaginationLinkProps) {
    return (
        <Button asChild variant={variant ?? (isActive ? 'outline' : 'ghost')} size={size} className={cn(className)}>
            <a aria-current={isActive ? 'page' : undefined} data-slot="pagination-link" data-active={isActive} {...props} />
        </Button>
    )
}

function PaginationPrevious({ className, text = 'Previous', ...props }: React.ComponentProps<typeof PaginationLink> & { text?: string }) {
    return (
        <PaginationLink aria-label="Go to previous page" variant="outline" size="default" className={cn('pl-1.5!', className)} {...props}>
            <ChevronLeftIcon data-icon="inline-start" />
            <span className="hidden sm:block">{text}</span>
        </PaginationLink>
    )
}

function PaginationNext({ className, text = 'Next', ...props }: React.ComponentProps<typeof PaginationLink> & { text?: string }) {
    return (
        <PaginationLink aria-label="Go to next page" variant="outline" size="default" className={cn('pr-1.5!', className)} {...props}>
            <span className="hidden sm:block">{text}</span>
            <ChevronRightIcon data-icon="inline-end" />
        </PaginationLink>
    )
}

function PaginationEllipsis({ className, ...props }: React.ComponentProps<'span'>) {
    return (
        <span
            aria-hidden
            data-slot="pagination-ellipsis"
            className={cn("flex size-8 items-center justify-center [&_svg:not([class*='size-'])]:size-4", className)}
            {...props}
        >
            <MoreHorizontalIcon />
            <span className="sr-only">More pages</span>
        </span>
    )
}

type PaginationCompProps = {
    page?: number
    limit?: number
    total?: number
    onPageChange?: (page: number) => void
}

function PaginationComp({ page = 1, limit = 10, total = 0, onPageChange }: PaginationCompProps) {
    const totalPages = Math.ceil(total / limit)

    if (totalPages <= 1) return null

    const handlePageChange = (e: React.MouseEvent, p: number) => {
        e.preventDefault()
        if (p >= 1 && p <= totalPages && p !== page) {
            onPageChange?.(p)
        }
    }

    const renderPages = () => {
        const pages = []
        const maxPagesToShow = 5
        let startPage = Math.max(1, page - Math.floor(maxPagesToShow / 2))
        const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1)

        if (endPage - startPage + 1 < maxPagesToShow) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1)
        }

        if (startPage > 1) {
            pages.push(
                <PaginationItem key={1}>
                    <PaginationLink size="icon-sm" onClick={(e) => handlePageChange(e, 1)}>
                        1
                    </PaginationLink>
                </PaginationItem>,
            )
            if (startPage > 2) {
                pages.push(
                    <PaginationItem key="ellipsis-start">
                        <PaginationEllipsis />
                    </PaginationItem>,
                )
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <PaginationItem key={i}>
                    <PaginationLink size="icon-sm" isActive={i === page} onClick={(e) => handlePageChange(e, i)}>
                        {i}
                    </PaginationLink>
                </PaginationItem>,
            )
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                pages.push(
                    <PaginationItem key="ellipsis-end">
                        <PaginationEllipsis />
                    </PaginationItem>,
                )
            }
            pages.push(
                <PaginationItem key={totalPages}>
                    <PaginationLink size="icon-sm" onClick={(e) => handlePageChange(e, totalPages)}>
                        {totalPages}
                    </PaginationLink>
                </PaginationItem>,
            )
        }

        return pages
    }

    return (
        <Pagination>
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious
                        size="sm"
                        onClick={(e) => handlePageChange(e, page - 1)}
                        className={page === 1 ? 'pointer-events-none opacity-50' : ''}
                    />
                </PaginationItem>
                {renderPages()}
                <PaginationItem>
                    <PaginationNext
                        size="sm"
                        onClick={(e) => handlePageChange(e, page + 1)}
                        className={page === totalPages ? 'pointer-events-none opacity-50' : ''}
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    )
}

export {
    Pagination,
    PaginationComp,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
}
