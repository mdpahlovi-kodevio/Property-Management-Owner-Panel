import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useFieldContext } from './form-context'

type FormInputNumberProps = {
    label: string
    placeholder?: string
    readOnly?: boolean
    disabled?: boolean
    step?: string | number
    min?: string | number
    max?: string | number
}

export function FormInputNumber({ label, ...props }: FormInputNumberProps) {
    const field = useFieldContext<number>()
    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
    const value = field.state.value

    return (
        <Field data-invalid={isInvalid}>
            <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
            <Input
                id={field.name}
                type="number"
                name={field.name}
                value={value === undefined || value === null || Number.isNaN(value) ? '' : value}
                onBlur={field.handleBlur}
                onChange={(e) => {
                    const raw = e.target.value
                    if (raw === '') {
                        // Empty field — let the schema's required check handle it.
                        field.handleChange(undefined as unknown as number)
                        return
                    }
                    const parsed = Number(raw)
                    field.handleChange((Number.isNaN(parsed) ? undefined : parsed) as unknown as number)
                }}
                aria-invalid={isInvalid}
                {...props}
            />
            {isInvalid && <FieldError errors={field.state.meta.errors} />}
        </Field>
    )
}
