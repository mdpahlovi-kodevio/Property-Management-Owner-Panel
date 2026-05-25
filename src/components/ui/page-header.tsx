import { cn } from '@/lib/utils'

export function PageHeader({
    title,
    description,
    className,
}: {
    title: string
    description?: string
    className?: string
}) {
    return (
        <div className={cn(className)}>
            <h2 className="text-lg font-semibold">{title}</h2>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
    )
}
