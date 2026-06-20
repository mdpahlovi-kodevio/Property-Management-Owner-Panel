import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useFieldContext } from './form-context'

type FormRadioProps = {
    label: string
    options: { value: string; label: string }[]
    disabled?: boolean
}

export function FormRadio({ label, options, disabled }: FormRadioProps) {
    const field = useFieldContext<string>()
    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

    return (
        <Field data-invalid={isInvalid}>
            <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
            <RadioGroup
                className="flex flex-wrap gap-3"
                value={field.state.value}
                onValueChange={(value) => field.handleChange(value)}
                disabled={disabled}
            >
                {options.map((option) => (
                    <div key={option.value} className="flex items-center gap-1.5 rounded-full border px-3 py-2">
                        <RadioGroupItem id={option.value} value={option.value} />
                        <Label htmlFor={option.value} className="leading-normal">
                            {option.label}
                        </Label>
                    </div>
                ))}
            </RadioGroup>
            {isInvalid && <FieldError errors={field.state.meta.errors} />}
        </Field>
    )
}
