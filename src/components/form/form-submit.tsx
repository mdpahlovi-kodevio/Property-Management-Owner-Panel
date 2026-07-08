import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useFormContext } from './form-context'

export function FormSubmit({ label, destructive }: { label: string; destructive?: boolean }) {
    const form = useFormContext()

    return (
        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
            {([canSubmit, isSubmitting]) => (
                <Button type="submit" variant={destructive ? 'destructive' : 'default'} disabled={!canSubmit}>
                    {isSubmitting ? <Spinner /> : label}
                </Button>
            )}
        </form.Subscribe>
    )
}
