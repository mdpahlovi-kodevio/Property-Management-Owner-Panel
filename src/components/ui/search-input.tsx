import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Search, X } from 'lucide-react'
import * as React from 'react'

export interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'value' | 'onChange'> {
    value: string
    onValueChange: (value: string) => void
}

export function SearchInput({ value, onValueChange, className, placeholder = 'Search...', ...props }: SearchInputProps) {
    return (
        <div className={cn('relative w-full', className)}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/75" />
            <Input
                placeholder={placeholder}
                value={value}
                onChange={(e) => onValueChange(e.target.value)}
                className="px-9 pr-8 bg-white border-slate-200"
                {...props}
            />
            {value && (
                <button
                    type="button"
                    onClick={() => onValueChange('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                    <X className="h-3 w-3" />
                </button>
            )}
        </div>
    )
}
