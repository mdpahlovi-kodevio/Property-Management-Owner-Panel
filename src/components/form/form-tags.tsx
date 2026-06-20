import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { cn } from '@/lib/utils'
import { useFieldContext } from './form-context'

type TagOption = {
    value?: string
    label: string
    icon?: string
}

type FormTagsProps = {
    label: string
    options: TagOption[]
    disabled?: boolean
}

export function FormTags({ label, options, disabled }: FormTagsProps) {
    const field = useFieldContext<string[]>()
    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
    const value = field.state.value ?? []

    return (
        <Field data-invalid={isInvalid}>
            <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
            <div className="flex flex-wrap gap-2">
                {options.map((option) => {
                    const optionValue = option.value ?? ''
                    const isOn = value.includes(optionValue)

                    return (
                        <button
                            key={optionValue}
                            type="button"
                            disabled={disabled}
                            aria-pressed={isOn}
                            onClick={() => {
                                field.handleChange(isOn ? value.filter((a) => a !== optionValue) : [...value, optionValue])
                            }}
                            className={cn(
                                'flex items-center gap-1.5 px-3 py-2 rounded-full border text-xs font-medium transition-colors',
                                'disabled:opacity-50 disabled:pointer-events-none',
                                isOn
                                    ? 'bg-primary text-primary-foreground border-primary'
                                    : 'bg-background text-foreground border-border hover:bg-muted hover:border-primary/50',
                            )}
                        >
                            <span
                                className="[&_svg:not([class*='size-'])]:size-4"
                                dangerouslySetInnerHTML={{ __html: option.icon ?? '' }}
                            />
                            <span>{option.label}</span>
                        </button>
                    )
                })}
            </div>
            {isInvalid && <FieldError errors={field.state.meta.errors} />}
        </Field>
    )
}

export default FormTags
