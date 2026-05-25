import { Button } from '@/components/ui/button'
import type { ErrorComponentProps } from '@tanstack/react-router'
import { RotateCw, ShieldAlert } from 'lucide-react'

export function ErrorComp(props: ErrorComponentProps) {
    return (
        <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-6">
                <div className="flex items-center justify-center w-20 h-20 rounded-full bg-destructive/5 text-destructive">
                    <ShieldAlert size={48} />
                </div>
                <div className="text-center grid gap-2">
                    <h4>Something went wrong</h4>
                    <p>An unexpected error occurred while please try again</p>
                </div>
                <Button variant="destructive" onClick={props.reset}>
                    <RotateCw />
                    Try Again
                </Button>
            </div>
        </div>
    )
}
