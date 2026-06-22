import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useFieldContext } from './form-context'

type FormInputProps = {
    type?: React.HTMLInputTypeAttribute
    label: string
    placeholder?: string
    readOnly?: boolean
    disabled?: boolean
    hint?: string
}

export function FormInput({ type = 'text', label, hint, ...props }: FormInputProps) {
    const field = useFieldContext<string>()
    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

    return (
        <Field data-invalid={isInvalid}>
            <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
            <Input
                id={field.name}
                type={type}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                aria-invalid={isInvalid}
                {...props}
            />
            {hint && !isInvalid && <FieldDescription>{hint}</FieldDescription>}
            {isInvalid && <FieldError errors={field.state.meta.errors} />}
        </Field>
    )
}
