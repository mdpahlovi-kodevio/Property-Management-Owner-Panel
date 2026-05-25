import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useFormContext } from './form-context'

export function FormSubmit({ label }: { label: string }) {
    const form = useFormContext()

    return (
        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
            {([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit}>
                    {isSubmitting ? <Spinner /> : label}
                </Button>
            )}
        </form.Subscribe>
    )
}
