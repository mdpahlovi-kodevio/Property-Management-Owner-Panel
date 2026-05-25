import { Spinner } from '@/components/ui/spinner'

export function PendingComp() {
    return (
        <div className="flex-1 flex justify-center items-center">
            <Spinner className="size-48 stroke-primary" />
        </div>
    )
}
