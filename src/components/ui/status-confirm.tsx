import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import type { ReactNode } from 'react'

type StatusConfirmProps = {
    /** The trigger element — rendered inside AlertDialogTrigger with asChild */
    children?: ReactNode
    /** The name shown in the confirmation message */
    name: ReactNode
    /** The current status of the item */
    currentStatus: string
    /** The status it will change to */
    newStatus: string
    /** Title of the confirmation dialog */
    title?: string
    /** Called when the user confirms the action */
    onConfirm: () => void
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export function StatusConfirm({
    children,
    name,
    currentStatus,
    newStatus,
    title = 'Confirm Status Change',
    onConfirm,
    open,
    onOpenChange,
}: StatusConfirmProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            {children && <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>}
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to change the status of <strong className="text-foreground">{name}</strong> from{' '}
                        <strong className="text-foreground">{currentStatus}</strong> to{' '}
                        <strong className="text-foreground">{newStatus}</strong>?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm}>Confirm</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
