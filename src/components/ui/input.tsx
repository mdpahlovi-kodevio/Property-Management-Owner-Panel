import * as React from 'react'

import { cn } from '@/lib/utils'

function Input({
    className,
    size = 'default',
    type,
    ...props
}: Omit<React.ComponentProps<'input'>, 'size'> & {
    size?: 'sm' | 'default'
}) {
    return (
        <input
            type={type}
            data-slot="input"
            data-size={size}
            className={cn(
                'w-full min-w-0 rounded-lg border border-input bg-transparent px-3 py-2 text-sm transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive data-[size=default]:h-10 data-[size=sm]:h-8 dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50',
                className,
            )}
            {...props}
        />
    )
}

export { Input }
