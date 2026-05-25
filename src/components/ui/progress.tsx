import * as React from 'react'
import { Progress as ProgressPrimitive } from 'radix-ui'

import { cn } from '@/lib/utils'

const STATUS_STYLES: Record<string, { color: string }> = {
    Available: { color: 'rgb(0, 139, 63)' },
    Reserved: { color: 'rgb(255, 170, 0)' },
    Shipped: { color: 'rgb(6, 163, 255)' },
    Cleaning: { color: 'rgb(145, 82, 255)' },
    Repair: { color: 'rgb(211, 0, 4)' },
    Default: { color: 'rgb(0, 113, 181)' },
}

function Progress({ className, value, status, ...props }: React.ComponentProps<typeof ProgressPrimitive.Root> & { status?: string }) {
    // @ts-ignore
    const statusStyle = STATUS_STYLES[status] ?? STATUS_STYLES.Default

    console.log(statusStyle)

    return (
        <ProgressPrimitive.Root
            data-slot="progress"
            className={cn('relative flex h-4 w-full items-center overflow-x-hidden bg-muted rounded-full', className)}
            style={{ backgroundColor: statusStyle.bg }}
            {...props}
        >
            <ProgressPrimitive.Indicator
                data-slot="progress-indicator"
                className={cn('size-full flex-1 transition-all')}
                style={{
                    backgroundColor: statusStyle.color,
                    transform: `translateX(-${100 - (value || 0)}%)`,
                }}
            />
        </ProgressPrimitive.Root>
    )
}

export { Progress }
